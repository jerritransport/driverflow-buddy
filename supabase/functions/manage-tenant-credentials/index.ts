import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the calling user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, tenantId, credentials } = await req.json();

    if (action === "save_twilio") {
      const { error } = await supabase
        .from("tenants")
        .update({
          twilio_account_sid: credentials.account_sid,
          twilio_auth_token: credentials.auth_token,
          twilio_phone_number: credentials.phone_number,
        })
        .eq("id", tenantId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "save_crl") {
      const { error } = await supabase
        .from("tenants")
        .update({
          crl_portal_url: credentials.portal_url,
          crl_login_email: credentials.login_email,
          crl_password: credentials.password,
          crl_company_search_term: credentials.company_search_term,
        })
        .eq("id", tenantId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_credentials") {
      const { data, error } = await supabase
        .from("tenants")
        .select("twilio_account_sid, twilio_auth_token, twilio_phone_number, crl_portal_url, crl_login_email, crl_password, crl_company_search_term, gmail_address, gmail_refresh_token")
        .eq("id", tenantId)
        .single();

      if (error) throw error;

      // Mask sensitive fields
      const masked = {
        ...data,
        twilio_account_sid: data.twilio_account_sid ? "••••" + data.twilio_account_sid.slice(-4) : null,
        twilio_auth_token: data.twilio_auth_token ? "••••••••" : null,
        crl_login_email: data.crl_login_email ? "••••" + data.crl_login_email.slice(-4) : null,
        crl_password: data.crl_password ? "••••••••" : null,
        gmail_refresh_token: data.gmail_refresh_token ? "configured" : null,
      };

      return new Response(JSON.stringify(masked), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
