import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle, 
  Users, 
  Settings,
  Eye,
  UserCheck,
  AlertTriangle
} from "lucide-react";

export function AdminWelcome() {
  return (
    <div className="space-y-6">
      <Alert className="border-primary/50 bg-primary/10">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-primary">
          <strong>Willkommen im Admin-Dashboard!</strong> Sie haben vollständige Administratorrechte für die KRYPTOANZEIGEN.DE-Plattform.
        </AlertDescription>
      </Alert>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ihre Admin-Berechtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Benutzerverwaltung</h4>
                <p className="text-sm text-muted-foreground">Verwalten Sie alle Benutzerkonten</p>
              </div>
              <Badge variant="secondary">Aktiv</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Verifizierungen</h4>
                <p className="text-sm text-muted-foreground">Prüfen Sie Identitätsverifizierungen</p>
              </div>
              <Badge variant="secondary">Aktiv</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Eye className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Anzeigen moderieren</h4>
                <p className="text-sm text-muted-foreground">Überwachen Sie alle Anzeigen</p>
              </div>
              <Badge variant="secondary">Aktiv</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Meldungen bearbeiten</h4>
                <p className="text-sm text-muted-foreground">Bearbeiten Sie Nutzer-Meldungen</p>
              </div>
              <Badge variant="secondary">Aktiv</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Erste Schritte als Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-medium">System-Status überprüfen</h4>
                <p className="text-sm text-muted-foreground">Überprüfen Sie die Übersicht für aktuelle Statistiken</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-medium">Ausstehende Verifizierungen bearbeiten</h4>
                <p className="text-sm text-muted-foreground">Gehen Sie zu "Verifizierung" um wartende Anfragen zu bearbeiten</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-medium">Weitere Admins hinzufügen</h4>
                <p className="text-sm text-muted-foreground">Unter "Einstellungen" können Sie weitere Administratoren ernennen</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}