import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailAttachment {
  filename: string;
  content_base64: string; // raw base64, no data: prefix
  mime_type: string;
}

// Builds a raw MIME message (multipart/mixed with an HTML body + optional
// attachments), base64url-encoded the way the Gmail API expects.
function buildRawEmail(
  from: string,
  to: string,
  subject: string,
  bodyHtml: string,
  attachments: EmailAttachment[]
): string {
  const boundary = `----boundary_${crypto.randomUUID()}`;
  const lines: string[] = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    bodyHtml,
    ``,
  ];

  for (const att of attachments) {
    lines.push(
      `--${boundary}`,
      `Content-Type: ${att.mime_type}; name="${att.filename}"`,
      `Content-Disposition: attachment; filename="${att.filename}"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      att.content_base64,
      ``
    );
  }

  lines.push(`--${boundary}--`);

  const rawEmail = lines.join("\r\n");
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(rawEmail);
  let binary = "";
  for (let i = 0; i < rawBytes.length; i++) binary += String.fromCharCode(rawBytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify this is a real logged-in dashboard user (not a public/anon call).
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to, subject, body_html, attachments, tenant_id } = await req.json() as {
      to: string;
      subject: string;
      body_html: string;
      attachments?: EmailAttachment[];
      tenant_id?: string | null;
    };

    if (!to || !subject || !body_html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, body_html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Look up which Gmail account to send from — prefer the driver's own
    // tenant (if it has Gmail connected), otherwise fall back to any tenant
    // with Gmail connected.
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let tenant = null;
    if (tenant_id) {
      const { data } = await supabaseAdmin
        .from("tenants")
        .select("id, gmail_refresh_token, gmail_address, is_active")
        .eq("id", tenant_id)
        .not("gmail_refresh_token", "is", null)
        .eq("is_active", true)
        .maybeSingle();
      tenant = data;
    }

    if (!tenant) {
      const { data } = await supabaseAdmin
        .from("tenants")
        .select("id, gmail_refresh_token, gmail_address, is_active")
        .not("gmail_refresh_token", "is", null)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      tenant = data;
    }

    if (!tenant) {
      return new Response(
        JSON.stringify({ error: "No Gmail account is connected yet. Connect Gmail in Settings first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get a fresh access token from Google.
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
        JSON.stringify({ error: "Failed to refresh Gmail access token" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Build the MIME email (with attachments) and send via Gmail API.
    const fromAddress = tenant.gmail_address || "me";
    const rawBase64 = buildRawEmail(fromAddress, to, subject, body_html, attachments ?? []);

    const sendRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: rawBase64 }),
      }
    );
    const sendData = await sendRes.json();
    if (!sendRes.ok) {
      console.error("Gmail send failed:", sendData);
      return new Response(
        JSON.stringify({ error: sendData.error?.message || "Failed to send email" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message_id: sendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-driver-email error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
