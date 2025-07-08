import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationStatusEmailRequest {
  email: string;
  displayName: string;
  status: 'approved' | 'rejected';
  adminNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName, status, adminNotes }: VerificationStatusEmailRequest = await req.json();

    console.log(`Sending verification ${status} email to ${email}`);

    const isApproved = status === 'approved';
    const subject = isApproved ? "🎉 Verifizierung erfolgreich!" : "Verifizierung nicht erfolgreich";

    const emailResponse = await resend.emails.send({
      from: "KryptoMarkt <verification@kryptomarkt.dev>",
      to: [email],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
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
              background: linear-gradient(135deg, ${isApproved ? '#10b981, #059669' : '#ef4444, #dc2626'});
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
              color: ${isApproved ? '#10b981' : '#ef4444'}; 
              margin-bottom: 20px;
            }
            .status-icon {
              font-size: 64px;
              text-align: center;
              margin: 20px 0;
            }
            .cta { 
              text-align: center; 
              margin: 30px 0;
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #f97316, #f59e0b);
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              transition: transform 0.2s;
            }
            .admin-notes {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid ${isApproved ? '#10b981' : '#ef4444'};
              margin: 20px 0;
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
              <h1>🪙 KryptoMarkt</h1>
              <p>${isApproved ? 'Deine Verifizierung war erfolgreich!' : 'Update zu deiner Verifizierung'}</p>
            </div>
            
            <div class="content">
              <div class="status-icon">${isApproved ? '✅' : '❌'}</div>
              
              <h2>Hallo ${displayName || 'Crypto-Händler'}!</h2>
              
              ${isApproved ? `
                <p><strong>Herzlichen Glückwunsch!</strong> Deine Identitätsverifizierung wurde erfolgreich abgeschlossen.</p>
                
                <p>Du profitierst jetzt von folgenden Vorteilen:</p>
                <ul>
                  <li>✅ <strong>Vertrauensvoller Handel:</strong> Andere Nutzer sehen dein Verifiziert-Badge</li>
                  <li>✅ <strong>Höhere Limits:</strong> Größere Handelsvolumen möglich</li>
                  <li>✅ <strong>Prioritäts-Support:</strong> Schnellere Hilfe bei Fragen</li>
                  <li>✅ <strong>Bessere Sichtbarkeit:</strong> Deine Anzeigen werden bevorzugt angezeigt</li>
                </ul>
                
                <div class="cta">
                  <a href="https://kryptomarkt.dev/dashboard" class="button">
                    Zum Dashboard 🚀
                  </a>
                </div>
              ` : `
                <p>Leider konnten wir deine Identitätsverifizierung nicht abschließen.</p>
                
                ${adminNotes ? `
                  <div class="admin-notes">
                    <strong>Grund der Ablehnung:</strong><br>
                    ${adminNotes}
                  </div>
                ` : ''}
                
                <p><strong>Was kannst du tun?</strong></p>
                <ul>
                  <li>📄 Überprüfe deine eingereichten Dokumente auf Vollständigkeit</li>
                  <li>📷 Stelle sicher, dass alle Fotos scharf und gut lesbar sind</li>
                  <li>🆔 Verwende ein gültiges Ausweisdokument</li>
                  <li>🔄 Starte eine neue Verifizierung mit korrigierten Dokumenten</li>
                </ul>
                
                <div class="cta">
                  <a href="https://kryptomarkt.dev/verification" class="button">
                    Erneut verifizieren 🔄
                  </a>
                </div>
              `}
              
              <p><strong>Fragen?</strong> Unser Support-Team hilft dir gerne weiter. Antworte einfach auf diese E-Mail.</p>
            </div>
            
            <div class="footer">
              <p><strong>KryptoMarkt Verification Team</strong></p>
              <p>Sicher, vertrauensvoll, dezentral</p>
              <p style="margin-top: 20px; font-size: 12px;">
                Diese E-Mail wurde an ${email} gesendet.<br>
                <a href="#" style="color: #f97316;">Support</a> | 
                <a href="#" style="color: #f97316;">Datenschutz</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Verification status email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-status-email function:", error);
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