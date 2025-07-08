import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  verificationRequestId: string;
  userName: string;
  userEmail: string;
  documentType: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { verificationRequestId, userName, userEmail, documentType }: AdminNotificationRequest = await req.json();

    console.log(`Sending admin notification for verification request ${verificationRequestId}`);

    // Get all admin users
    const { data: adminUsers, error } = await supabase
      .from('profiles')
      .select('user_id')
      .in('role', ['admin', 'moderator']);

    if (error) {
      throw new Error(`Failed to fetch admin users: ${error.message}`);
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.log('No admin users found');
      return new Response(JSON.stringify({ message: 'No admin users to notify' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get admin emails from auth.users - we'll use a placeholder system for now
    const adminEmails = [
      'admin@kryptomarkt.dev', // Primary admin email
      'verification@kryptomarkt.dev' // Verification team email
    ];

    const dashboardUrl = `https://kryptomarkt.dev/dashboard?tab=verification&request=${verificationRequestId}`;

    const emailResponse = await resend.emails.send({
      from: "KryptoMarkt <notifications@kryptomarkt.dev>",
      to: adminEmails,
      subject: "🔔 Neue Verifizierungsanfrage eingegangen",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Neue Verifizierungsanfrage</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333;
              background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
              margin: 0;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .header { 
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white; 
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: bold;
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 { 
              color: #3b82f6; 
              margin-bottom: 20px;
            }
            .request-details {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 5px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-label {
              font-weight: bold;
              color: #374151;
            }
            .detail-value {
              color: #6b7280;
            }
            .cta { 
              text-align: center; 
              margin: 30px 0;
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              transition: transform 0.2s;
            }
            .priority {
              background: #fef3c7;
              color: #92400e;
              padding: 5px 10px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .footer { 
              background: #f8f9fa; 
              padding: 30px; 
              text-align: center; 
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🪙 KryptoMarkt Admin</h1>
              <p>Neue Verifizierungsanfrage wartet auf Bearbeitung</p>
            </div>
            
            <div class="content">
              <h2>🔔 Neue Verifizierung eingegangen</h2>
              
              <p>Ein Nutzer hat eine neue Identitätsverifizierung eingereicht. Bitte überprüfe die Dokumente zeitnah.</p>
              
              <div class="request-details">
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${userName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">E-Mail:</span>
                  <span class="detail-value">${userEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Dokumenttyp:</span>
                  <span class="detail-value">${documentType}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Anfrage-ID:</span>
                  <span class="detail-value">${verificationRequestId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value"><span class="priority">Wartend</span></span>
                </div>
              </div>
              
              <p><strong>Nächste Schritte:</strong></p>
              <ul>
                <li>📄 Überprüfe die eingereichten Dokumente</li>
                <li>🔍 Verifiziere die Identität des Nutzers</li>
                <li>✅ Approve oder ❌ Reject mit Begründung</li>
                <li>📧 Nutzer wird automatisch per E-Mail benachrichtigt</li>
              </ul>
              
              <div class="cta">
                <a href="${dashboardUrl}" class="button">
                  Jetzt überprüfen 🚀
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">
                <strong>⏰ SLA:</strong> Bitte bearbeite Verifizierungsanfragen innerhalb von 24 Stunden.<br>
                <strong>📊 Dashboard:</strong> Weitere Details findest du im Admin-Dashboard.
              </p>
            </div>
            
            <div class="footer">
              <p><strong>KryptoMarkt Admin System</strong></p>
              <p>Automatische Benachrichtigung - Bitte nicht antworten</p>
              <p style="margin-top: 20px; font-size: 12px;">
                Bei Problemen mit dem System wende dich an:<br>
                <a href="mailto:tech@kryptomarkt.dev" style="color: #3b82f6;">tech@kryptomarkt.dev</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      emailResponse,
      notifiedAdmins: adminEmails.length
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);