import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Upload, CheckCircle, FileText, Camera, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function UserVerificationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState('id_card');
  const [fullName, setFullName] = useState('');

  const submitVerificationRequest = async () => {
    if (!user || !fullName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          document_type: documentType,
          full_name: fullName.trim(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Send admin notification (non-blocking)
      if (data) {
        setTimeout(async () => {
          try {
            await supabase.functions.invoke('send-admin-notification-email', {
              body: {
                verificationRequestId: data.id,
                userName: fullName.trim(),
                userEmail: user.email || 'unknown@platform.local',
                documentType: documentType
              }
            });
            console.log('Admin notification sent for verification request:', data.id);
          } catch (emailError) {
            console.error('Admin notification email error:', emailError);
          }
        }, 100);
      }

      toast({
        title: "Antrag eingereicht",
        description: "Ihr Verifizierungsantrag wurde erfolgreich eingereicht.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Einreichen des Antrags.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Benutzer-Verifizierung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-gray-300" />
          ))}
          <Badge variant="secondary">Nicht verifiziert</Badge>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Erhöhen Sie Ihr Vertrauen durch Verifizierung Ihrer Identität.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Vollständiger Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Vor- und Nachname"
            />
          </div>

          <div className="space-y-2">
            <Label>Dokument-Typ</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id_card">Personalausweis</SelectItem>
                <SelectItem value="passport">Reisepass</SelectItem>
                <SelectItem value="drivers_license">Führerschein</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={submitVerificationRequest} disabled={loading} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Verifizierungsantrag einreichen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}