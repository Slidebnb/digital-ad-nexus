import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, AlertTriangle, CheckCircle } from "lucide-react";

export function AdminPromoteUser() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { promoteUserToAdmin } = useAdminData();
  const { toast } = useToast();

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    const result = await promoteUserToAdmin(email.trim());
    
    if (result.success) {
      toast({
        title: "Erfolgreich",
        description: `${email} wurde zum Admin befördert.`,
      });
      setEmail("");
    } else {
      toast({
        title: "Fehler",
        description: result.error || "Benutzer konnte nicht befördert werden.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Benutzer zum Admin befördern
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-warning/50 bg-warning/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-warning">
            <strong>Achtung:</strong> Diese Aktion verleiht vollständige Admin-Rechte.
          </AlertDescription>
        </Alert>

        <form onSubmit={handlePromote} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promote-email">E-Mail-Adresse des Benutzers</Label>
            <Input
              id="promote-email"
              type="email"
              placeholder="benutzer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !email.trim()}
            className="w-full"
          >
            {isLoading ? "Beförderung läuft..." : "Zum Admin befördern"}
          </Button>
        </form>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Aktuelle Admins:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• wladislawhuwa@web.de (Haupt-Admin)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}