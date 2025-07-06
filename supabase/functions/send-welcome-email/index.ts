import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  displayName: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName, userId }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to ${email} for user ${userId}`);

    const emailResponse = await resend.emails.send({
      from: "KryptoMarkt <welcome@kryptomarkt.dev>",
      to: [email],
      subject: "Willkommen bei KryptoMarkt! 🚀",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Willkommen bei KryptoMarkt</title>
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
              background: linear-gradient(135deg, #f97316, #f59e0b);
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
              color: #f97316; 
              margin-bottom: 20px;
            }
            .feature { 
              display: flex; 
              align-items: center; 
              margin: 20px 0;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .feature-icon { 
              width: 40px; 
              height: 40px; 
              background: linear-gradient(135deg, #f97316, #f59e0b);
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              margin-right: 15px;
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
            .button:hover { 
              transform: translateY(-2px);
            }
            .footer { 
              background: #f8f9fa; 
              padding: 30px; 
              text-align: center; 
              color: #666;
              font-size: 14px;
            }
            .stats { 
              display: flex; 
              justify-content: space-around; 
              margin: 30px 0;
              text-align: center;
            }
            .stat { 
              flex: 1;
            }
            .stat-number { 
              font-size: 24px; 
              font-weight: bold; 
              color: #f97316;
            }
            .stat-label { 
              font-size: 12px; 
              color: #666; 
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🪙 KryptoMarkt</h1>
              <p>Willkommen bei der führenden Krypto-Kleinanzeigenplattform!</p>
            </div>
            
            <div class="content">
              <h2>Hallo ${displayName || 'Crypto-Enthusiast'}! 👋</h2>
              
              <p>Schön, dass du dich bei <strong>KryptoMarkt</strong> registriert hast! Du bist jetzt Teil einer wachsenden Community von Krypto-Händlern.</p>
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-number">10K+</div>
                  <div class="stat-label">Aktive Nutzer</div>
                </div>
                <div class="stat">
                  <div class="stat-number">5K+</div>
                  <div class="stat-label">Anzeigen</div>
                </div>
                <div class="stat">
                  <div class="stat-number">€2.5M</div>
                  <div class="stat-label">Handelsvolumen</div>
                </div>
              </div>
              
              <h2>Was dich erwartet:</h2>
              
              <div class="feature">
                <div class="feature-icon">🔒</div>
                <div>
                  <strong>Sichere Transaktionen</strong><br>
                  Bewertungssystem und Verifizierung für maximale Sicherheit
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">⚡</div>
                <div>
                  <strong>Schnell & Einfach</strong><br>
                  Intuitive Benutzeroberfläche für müheloses Handeln
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">👥</div>
                <div>
                  <strong>Community-getrieben</strong><br>
                  Direkte Kommunikation zwischen Käufern und Verkäufern
                </div>
              </div>
              
              <div class="cta">
                <a href="https://kryptomarkt.dev/browse" class="button">
                  Jetzt Anzeigen durchsuchen 🚀
                </a>
              </div>
              
              <h2>Erste Schritte:</h2>
              <ol>
                <li><strong>Profil vervollständigen:</strong> Füge ein Profilbild und Informationen hinzu</li>
                <li><strong>Verifizierung:</strong> Lasse dich verifizieren für mehr Vertrauen</li>
                <li><strong>Erste Anzeige:</strong> Erstelle deine erste Verkaufsanzeige</li>
                <li><strong>Handeln:</strong> Starte deinen ersten Trade!</li>
              </ol>
              
              <p><strong>Hast du Fragen?</strong> Unser Support-Team hilft dir gerne weiter. Antworte einfach auf diese E-Mail oder besuche unser Help Center.</p>
            </div>
            
            <div class="footer">
              <p><strong>KryptoMarkt Team</strong></p>
              <p>Die dezentrale Plattform für den sicheren Handel mit Kryptowährungen</p>
              <p style="margin-top: 20px; font-size: 12px;">
                Diese E-Mail wurde an ${email} gesendet.<br>
                <a href="#" style="color: #f97316;">Abmelden</a> | 
                <a href="#" style="color: #f97316;">Datenschutz</a> | 
                <a href="#" style="color: #f97316;">Support</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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