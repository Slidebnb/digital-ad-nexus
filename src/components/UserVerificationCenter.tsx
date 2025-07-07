import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Check, 
  X, 
  Clock,
  Upload,
  CheckCircle,
  AlertTriangle,
  Star,
  Award,
  Info
} from "lucide-react";

interface VerificationStatus {
  id?: string;
  status: 'none' | 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at?: string;
  reviewed_at?: string;
}

export function UserVerificationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({ status: 'none' });
  const [loading, setLoading] = useState(true);

  const fetchVerificationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setVerificationStatus({
          id: data.id,
          status: data.status as 'pending' | 'approved' | 'rejected',
          admin_notes: data.admin_notes,
          created_at: data.created_at,
          reviewed_at: data.reviewed_at
        });
      } else {
        setVerificationStatus({ status: 'none' });
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchVerificationStatus();
      setLoading(false);
    };

    loadData();

    // Set up real-time updates
    const channel = supabase
      .channel('user-verification')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'verification_requests',
        filter: `user_id=eq.${user?.id}` 
      }, () => {
        fetchVerificationStatus();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusInfo = () => {
    switch (verificationStatus.status) {
      case 'none':
        return {
          title: 'Nicht verifiziert',
          description: 'Starten Sie den Verifizierungsprozess um erweiterte Funktionen freizuschalten',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/20',
          icon: Shield,
          progress: 0
        };
      case 'pending':
        return {
          title: 'Überprüfung läuft',
          description: 'Ihre Dokumente werden geprüft. Dies kann 24-48 Stunden dauern.',
          color: 'text-warning',
          bgColor: 'bg-warning/20',
          icon: Clock,
          progress: 50
        };
      case 'approved':
        return {
          title: 'Vollständig verifiziert',
          description: 'Ihre Identität wurde bestätigt. Sie haben Zugang zu allen Funktionen.',
          color: 'text-success',
          bgColor: 'bg-success/20',
          icon: CheckCircle,
          progress: 100
        };
      case 'rejected':
        return {
          title: 'Verifizierung abgelehnt',
          description: 'Ihre Dokumente konnten nicht bestätigt werden. Bitte versuchen Sie es erneut.',
          color: 'text-destructive',
          bgColor: 'bg-destructive/20',
          icon: X,
          progress: 25
        };
      default:
        return {
          title: 'Unbekannt',
          description: 'Status konnte nicht ermittelt werden',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/20',
          icon: AlertTriangle,
          progress: 0
        };
    }
  };

  const handleStartVerification = () => {
    toast({
      title: "Verifizierung starten",
      description: "Die Verifizierungsfunktion wird bald verfügbar sein.",
    });
  };

  if (loading) {
    return (
      <Card className="gradient-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Lade Verifizierungsstatus...</p>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Identitätsverifizierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className={`p-6 rounded-lg ${statusInfo.bgColor}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full bg-background ${statusInfo.color}`}>
                <StatusIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{statusInfo.title}</h3>
                <p className="text-muted-foreground">{statusInfo.description}</p>
              </div>
              <Badge variant="outline" className={statusInfo.color}>
                {verificationStatus.status === 'none' ? 'Nicht gestartet' : 
                 verificationStatus.status === 'pending' ? 'In Bearbeitung' :
                 verificationStatus.status === 'approved' ? 'Verifiziert' : 'Abgelehnt'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Verifizierungsfortschritt</span>
                <span>{statusInfo.progress}%</span>
              </div>
              <Progress value={statusInfo.progress} className="h-2" />
            </div>
          </div>

          {/* Status-specific Content */}
          {verificationStatus.status === 'none' && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warum verifizieren?</strong> Verifizierte Nutzer erhalten erweiterte Handelsoptionen, 
                  höhere Limits und das Vertrauen der Community.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Star className="h-5 w-5 text-warning flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Erhöhtes Vertrauen</div>
                    <div className="text-xs text-muted-foreground">Vertrauensabzeichen erhalten</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Award className="h-5 w-5 text-success flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Höhere Limits</div>
                    <div className="text-xs text-muted-foreground">Erweiterte Handelsoptionen</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Mehr Sicherheit</div>
                    <div className="text-xs text-muted-foreground">Schutz vor Betrug</div>
                  </div>
                </div>
              </div>

              <Button onClick={handleStartVerification} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Verifizierung starten
              </Button>
            </div>
          )}

          {verificationStatus.status === 'pending' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Ihre Dokumente werden von unserem Team geprüft. Sie erhalten eine Benachrichtigung, 
                sobald die Prüfung abgeschlossen ist. Dies kann bis zu 48 Stunden dauern.
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus.status === 'rejected' && verificationStatus.admin_notes && (
            <Alert className="border-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Grund der Ablehnung:</strong> {verificationStatus.admin_notes}
                <br />
                <br />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleStartVerification}
                  className="mt-2"
                >
                  Erneut versuchen
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus.status === 'approved' && (
            <Alert className="border-success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Herzlichen Glückwunsch!</strong> Ihre Identität wurde erfolgreich verifiziert. 
                Sie haben nun Zugang zu allen erweiterten Funktionen und genießen das volle Vertrauen der Community.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}