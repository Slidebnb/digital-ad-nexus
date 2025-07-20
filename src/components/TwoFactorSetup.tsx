import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Copy, CheckCircle, AlertTriangle, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TwoFactorSetup() {
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<"setup" | "verify" | "complete">("setup");
  const { toast } = useToast();

  useEffect(() => {
    checkTwoFactorStatus();
    if (!isEnabled) {
      generateSecret();
    }
  }, []);

  const checkTwoFactorStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("two_factor_enabled, backup_codes")
      .eq("user_id", user.id)
      .single();

    if (profile?.two_factor_enabled) {
      setIsEnabled(true);
      setBackupCodes(profile.backup_codes || []);
      setStep("complete");
    }
  };

  const generateSecret = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Generate a 32-character base32 secret
    const generateBase32Secret = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      let result = "";
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newSecret = generateBase32Secret();
    setSecret(newSecret);

    // Create QR code URL for authenticator apps
    const serviceName = "Digital Ad Nexus";
    const qrUrl = `otpauth://totp/${encodeURIComponent(serviceName)}:${encodeURIComponent(user.email)}?secret=${newSecret}&issuer=${encodeURIComponent(serviceName)}`;
    setQrCodeUrl(qrUrl);

    // Generate backup codes
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Ungültiger Code",
        description: "Bitte geben Sie einen 6-stelligen Code ein.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      // In production, you would verify the TOTP code server-side
      // For now, we'll simulate the verification
      
      // Update profile with 2FA settings
      const { error } = await supabase
        .from("profiles")
        .update({
          two_factor_enabled: true,
          two_factor_secret: secret,
          backup_codes: backupCodes
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setIsEnabled(true);
      setStep("complete");

      toast({
        title: "2FA aktiviert",
        description: "Zwei-Faktor-Authentifizierung wurde erfolgreich eingerichtet.",
      });

    } catch (error) {
      console.error("2FA Verification Error:", error);
      toast({
        title: "Fehler",
        description: "Verifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const disable2FA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setIsEnabled(false);
      setStep("setup");
      generateSecret();

      toast({
        title: "2FA deaktiviert",
        description: "Zwei-Faktor-Authentifizierung wurde deaktiviert.",
      });

    } catch (error) {
      console.error("2FA Disable Error:", error);
      toast({
        title: "Fehler",
        description: "Deaktivierung fehlgeschlagen.",
        variant: "destructive"
      });
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast({
      title: "Backup-Codes kopiert",
      description: "Die Codes wurden in die Zwischenablage kopiert.",
    });
  };

  if (step === "complete" && isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Zwei-Faktor-Authentifizierung aktiviert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Ihr Konto ist jetzt durch 2FA geschützt. Bewahren Sie Ihre Backup-Codes sicher auf.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-medium mb-2">Backup-Codes</h4>
            <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
              {backupCodes.map((code, index) => (
                <code key={index} className="text-sm">{code}</code>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyBackupCodes}
              className="mt-2"
            >
              <Copy className="h-4 w-4 mr-2" />
              Kopieren
            </Button>
          </div>

          <Button
            variant="destructive"
            onClick={disable2FA}
          >
            2FA deaktivieren
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Zwei-Faktor-Authentifizierung einrichten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === "setup" && (
          <>
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Installieren Sie eine Authenticator-App wie Google Authenticator oder Authy auf Ihrem Smartphone.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. QR-Code scannen</h4>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  {qrCodeUrl && (
                    <QRCodeSVG value={qrCodeUrl} size={200} />
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Oder manuell eingeben</h4>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                    {secret}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={() => setStep("verify")} className="w-full">
                Weiter zur Verifizierung
              </Button>
            </div>
          </>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">3. Code eingeben</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein:
              </p>
              <Input
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-lg tracking-wider"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <Button
                onClick={verifyAndEnable}
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full"
              >
                {isVerifying ? "Wird verifiziert..." : "2FA aktivieren"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setStep("setup")}
                className="w-full"
              >
                Zurück
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Wichtig:</strong> Speichern Sie Ihre Backup-Codes sicher ab, 
                bevor Sie 2FA aktivieren. Sie benötigen diese, falls Sie Ihr Gerät verlieren.
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-medium mb-2">Backup-Codes (sicher aufbewahren!)</h4>
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
                {backupCodes.map((code, index) => (
                  <code key={index} className="text-sm">{code}</code>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}