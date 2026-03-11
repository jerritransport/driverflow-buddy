import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validate API key
    const authHeader = req.headers.get("Authorization");
    const expectedKey = Deno.env.get("COMM_SERVICE_API_KEY");
    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tenant_id, to, message } = await req.json();
    if (!tenant_id || !to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: tenant_id, to, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Query tenant
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tenant, error: tenantErr } = await supabase
      .from("tenants")
      .select("twilio_account_sid, twilio_auth_token, twilio_phone_number, is_active")
      .eq("id", tenant_id)
      .single();

    if (tenantErr || !tenant) {
      return new Response(JSON.stringify({ error: "Tenant not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!tenant.is_active) {
      return new Response(JSON.stringify({ error: "Tenant is not active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!tenant.twilio_account_sid || !tenant.twilio_auth_token || !tenant.twilio_phone_number) {
      return new Response(
        JSON.stringify({ error: "Tenant has no Twilio credentials configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Send SMS via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${tenant.twilio_account_sid}/Messages.json`;
    const twilioAuth = btoa(`${tenant.twilio_account_sid}:${tenant.twilio_auth_token}`);

    const smsRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: tenant.twilio_phone_number,
        Body: message,
      }),
    });

    const smsData = await smsRes.json();
    if (!smsRes.ok) {
      console.error("Twilio send failed:", smsData);
      return new Response(
        JSON.stringify({ error: "Failed to send SMS", details: smsData.message }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, sid: smsData.sid }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-sms error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
