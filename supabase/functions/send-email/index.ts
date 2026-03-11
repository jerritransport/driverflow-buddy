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

    const { tenant_id, to, subject, body_html } = await req.json();
    if (!tenant_id || !to || !subject || !body_html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: tenant_id, to, subject, body_html" }),
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
      .select("gmail_refresh_token, gmail_address, is_active")
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
    if (!tenant.gmail_refresh_token) {
      return new Response(JSON.stringify({ error: "Tenant has no Gmail credentials configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Get fresh access token from Google
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
        refresh_token: tenant.gmail_refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google token refresh failed:", tokenData);
      return new Response(
        JSON.stringify({ error: "Failed to refresh Gmail access token", details: tokenData.error_description }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Build RFC 2822 email and base64url encode
    const fromAddress = tenant.gmail_address || "me";
    const rawEmail = [
      `From: ${fromAddress}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset="UTF-8"`,
      ``,
      body_html,
    ].join("\r\n");

    const encoder = new TextEncoder();
    const rawBytes = encoder.encode(rawEmail);
    const base64Raw = btoa(String.fromCharCode(...rawBytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // 5. Send via Gmail API
    const sendRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: base64Raw }),
      }
    );

    const sendData = await sendRes.json();
    if (!sendRes.ok) {
      console.error("Gmail send failed:", sendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: sendData.error?.message }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message_id: sendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-email error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
