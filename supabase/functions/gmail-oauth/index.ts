import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ error: "Google OAuth credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── ACTION: initiate ───
    // Generates the Google OAuth URL and returns it
    if (action === "initiate") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });

      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const tenantId = body.tenant_id;
      const redirectUrl = body.redirect_url;

      if (!tenantId || !redirectUrl) {
        return new Response(JSON.stringify({ error: "tenant_id and redirect_url required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Build the callback URL pointing to this same edge function
      const callbackUrl = `${SUPABASE_URL}/functions/v1/gmail-oauth?action=callback`;

      // State carries tenant_id and redirect_url for after the callback
      const state = btoa(JSON.stringify({ tenant_id: tenantId, redirect_url: redirectUrl }));

      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: callbackUrl,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/gmail.send email profile",
        access_type: "offline",
        prompt: "consent",
        state,
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      return new Response(JSON.stringify({ auth_url: authUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── ACTION: callback ───
    // Google redirects here with ?code=...&state=...
    if (action === "callback") {
      const code = url.searchParams.get("code");
      const stateParam = url.searchParams.get("state");
      const errorParam = url.searchParams.get("error");

      if (errorParam) {
        // User denied or error — redirect back with error
        let redirectUrl = "/students";
        try {
          const stateData = JSON.parse(atob(stateParam || ""));
          redirectUrl = stateData.redirect_url || redirectUrl;
        } catch { /* use default */ }

        return new Response(null, {
          status: 302,
          headers: { Location: `${redirectUrl}?gmail_error=${encodeURIComponent(errorParam)}` },
        });
      }

      if (!code || !stateParam) {
        return new Response("Missing code or state", { status: 400 });
      }

      let stateData: { tenant_id: string; redirect_url: string };
      try {
        stateData = JSON.parse(atob(stateParam));
      } catch {
        return new Response("Invalid state", { status: 400 });
      }

      const callbackUrl = `${SUPABASE_URL}/functions/v1/gmail-oauth?action=callback`;

      // Exchange code for tokens
      const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: callbackUrl,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResp.json();

      if (!tokenResp.ok || !tokenData.refresh_token) {
        console.error("Token exchange failed:", tokenData);
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${stateData.redirect_url}?gmail_error=${encodeURIComponent("Failed to get refresh token. Please try again.")}`,
          },
        });
      }

      // Get user email from Google userinfo
      const userinfoResp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userinfo = await userinfoResp.json();
      const gmailAddress = userinfo.email;

      if (!gmailAddress) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${stateData.redirect_url}?gmail_error=${encodeURIComponent("Could not retrieve Gmail address.")}`,
          },
        });
      }

      // Update tenant record using service role
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { error: updateError } = await supabaseAdmin
        .from("tenants")
        .update({
          gmail_refresh_token: tokenData.refresh_token,
          gmail_address: gmailAddress,
        })
        .eq("id", stateData.tenant_id);

      if (updateError) {
        console.error("Failed to update tenant:", updateError);
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${stateData.redirect_url}?gmail_error=${encodeURIComponent("Failed to save credentials.")}`,
          },
        });
      }

      return new Response(null, {
        status: 302,
        headers: {
          Location: `${stateData.redirect_url}?gmail_success=true&tenant_id=${stateData.tenant_id}`,
        },
      });
    }

    // ─── ACTION: disconnect ───
    if (action === "disconnect") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });

      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const tenantId = body.tenant_id;

      if (!tenantId) {
        return new Response(JSON.stringify({ error: "tenant_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { error: updateError } = await supabaseAdmin
        .from("tenants")
        .update({ gmail_refresh_token: null, gmail_address: null })
        .eq("id", tenantId);

      if (updateError) {
        return new Response(JSON.stringify({ error: "Failed to disconnect" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Gmail OAuth error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
