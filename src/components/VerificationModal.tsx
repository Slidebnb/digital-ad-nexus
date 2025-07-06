import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X,
  FileText,
  Camera,
  User
} from 'lucide-react';

interface VerificationModalProps {
  children: React.ReactNode;
}

export function VerificationModal({ children }: VerificationModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    document_type: '',
    full_name: '',
    document_front_url: '',
    document_back_url: '',
    selfie_url: ''
  });

  const { toast } = useToast();
  const { createVerificationRequest, verificationRequest } = useProfile();

  const handleSubmit = async () => {
    if (!formData.document_type || !formData.full_name) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await createVerificationRequest(formData);
      
      if (error) {
        toast({
          title: "Fehler",
          description: "Verifizierungsantrag konnte nicht gesendet werden.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Antrag gesendet",
          description: "Ihr Verifizierungsantrag wurde erfolgreich gesendet und wird geprüft."
        });
        setOpen(false);
        setStep(1);
        setFormData({
          document_type: '',
          full_name: '',
          document_front_url: '',
          document_back_url: '',
          selfie_url: ''
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatus = () => {
    if (!verificationRequest) return null;
    
    switch (verificationRequest.status) {
      case 'pending':
        return (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Ihr Verifizierungsantrag wird geprüft. Dies kann bis zu 24 Stunden dauern.
            </AlertDescription>
          </Alert>
        );
      case 'approved':
        return (
          <Alert className="border-success text-success">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Ihr Account wurde erfolgreich verifiziert!
            </AlertDescription>
          </Alert>
        );
      case 'rejected':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ihr Verifizierungsantrag wurde abgelehnt. {verificationRequest.admin_notes && `Grund: ${verificationRequest.admin_notes}`}
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Account Verifizierung
          </DialogTitle>
        </DialogHeader>

        {getVerificationStatus()}

        {!verificationRequest || verificationRequest.status === 'rejected' ? (
          <div className="space-y-6">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Schritt 1: Grunddaten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Vollständiger Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Max Mustermann"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="document_type">Ausweistyp *</Label>
                    <Select value={formData.document_type} onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie einen Ausweistyp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personalausweis">Personalausweis</SelectItem>
                        <SelectItem value="reisepass">Reisepass</SelectItem>
                        <SelectItem value="fuehrerschein">Führerschein</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={() => setStep(2)} 
                    className="w-full"
                    disabled={!formData.full_name || !formData.document_type}
                  >
                    Weiter zu Schritt 2
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Schritt 2: Dokumente hochladen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Für eine vollständige Verifizierung laden Sie bitte alle angeforderten Dokumente hoch. 
                      Ihre Daten werden verschlüsselt und sicher gespeichert.
                    </AlertDescription>
                  </Alert>

                  {/* Document Front */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Ausweis Vorderseite
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Klicken Sie hier oder ziehen Sie eine Datei hierher
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG bis zu 10MB
                      </p>
                    </div>
                  </div>

                  {/* Document Back */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Ausweis Rückseite
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Klicken Sie hier oder ziehen Sie eine Datei hierher
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG bis zu 10MB
                      </p>
                    </div>
                  </div>

                  {/* Selfie */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Selfie mit Ausweis (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Selfie mit Ihrem Ausweis neben Ihrem Gesicht
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Erhöht die Sicherheit Ihres Accounts
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Zurück
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Wird gesendet...' : 'Verifizierung beantragen'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              {verificationRequest.status === 'pending' && <Clock className="h-12 w-12 mx-auto text-warning" />}
              {verificationRequest.status === 'approved' && <CheckCircle className="h-12 w-12 mx-auto text-success" />}
            </div>
            <p className="text-muted-foreground">
              {verificationRequest.status === 'pending' && 'Ihr Antrag wird bearbeitet...'}
              {verificationRequest.status === 'approved' && 'Sie sind bereits verifiziert!'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function VerificationBadge({ verified, verificationLevel }: { verified?: boolean; verificationLevel?: string }) {
  if (!verified) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <X className="h-3 w-3 mr-1" />
        Nicht verifiziert
      </Badge>
    );
  }

  const level = verificationLevel || 'basic';
  const colors = {
    basic: 'bg-blue-500/10 text-blue-600 border-blue-200',
    id: 'bg-green-500/10 text-green-600 border-green-200',
    full: 'bg-purple-500/10 text-purple-600 border-purple-200'
  };

  return (
    <Badge className={colors[level as keyof typeof colors] || colors.basic}>
      <CheckCircle className="h-3 w-3 mr-1" />
      Verifiziert
    </Badge>
  );
}