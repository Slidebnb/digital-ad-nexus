import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Shield, Upload, CheckCircle, FileText, Camera, Star, UserCheck, Award, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  verified: boolean;
  verification_level: string;
  full_name: string;
}

interface VerificationRequest {
  id: string;
  status: string;
  document_type: string;
  full_name: string;
  created_at: string;
  admin_notes?: string;
}

export function UserVerificationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [documentType, setDocumentType] = useState('id_card');
  const [fullName, setFullName] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
      setupRealtimeSubscriptions();
    }

    return () => {
      // Cleanup subscriptions
      supabase.removeAllChannels();
    };
  }, [user]);

  // Real-time Updates alle 10 Sekunden
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('🔄 Live Status Update - Verifikation');
      fetchVerificationStatus();
    }, 10000); // Alle 10 Sekunden

    return () => clearInterval(interval);
  }, [user]);

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // Real-time Updates für Verifikationsanträge
    const verificationsChannel = supabase
      .channel('verification_requests_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verification_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🚀 Real-time Verifikationsantrag Update:', payload);
          fetchVerificationStatus();
        }
      )
      .subscribe();

    // Real-time Updates für Profile
    const profilesChannel = supabase
      .channel('profiles_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🚀 Real-time Profil Update:', payload);
          fetchVerificationStatus();
        }
      )
      .subscribe();
  };

  const fetchVerificationStatus = async () => {
    if (!user) return;

    try {
      console.log('📡 Live-Abfrage: Verifikationsstatus für User:', user.id);
      setFetchLoading(true);

      // User-Profile abrufen
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('verified, verification_level, full_name')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Fehler beim Laden des Profils:', profileError);
      } else {
        console.log('✅ Profil geladen:', profile);
        setUserProfile(profile);
      }

      // Aktuellste Verifikationsanfrage abrufen
      const { data: request, error: requestError } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Verwende maybeSingle() statt single()

      if (requestError) {
        console.error('Fehler beim Laden der Verifikationsanfrage:', requestError);
      } else {
        console.log('✅ Verifikationsanfrage geladen:', request);
        setVerificationRequest(request);
      }

    } catch (error) {
      console.error('❌ Fehler beim Laden des Verifikationsstatus:', error);
    } finally {
      setFetchLoading(false);
    }
  };

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

      // Status sofort neu laden
      console.log('🔄 Antrag eingereicht - Live-Update wird ausgelöst');
      setTimeout(() => fetchVerificationStatus(), 500);
      fetchVerificationStatus();
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

  const getVerificationLevelDisplay = (level: string) => {
    switch (level) {
      case 'id': return { label: 'ID verifiziert', color: 'bg-green-500', icon: UserCheck };
      case 'full': return { label: 'Vollständig verifiziert', color: 'bg-blue-500', icon: Award };
      case 'phone': return { label: 'Telefon verifiziert', color: 'bg-yellow-500', icon: Shield };
      default: return { label: 'Nicht verifiziert', color: 'bg-gray-400', icon: Shield };
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'In Bearbeitung', color: 'bg-yellow-500', icon: Clock };
      case 'approved': return { label: 'Genehmigt', color: 'bg-green-500', icon: CheckCircle };
      case 'rejected': return { label: 'Abgelehnt', color: 'bg-red-500', icon: FileText };
      default: return { label: 'Unbekannt', color: 'bg-gray-400', icon: Shield };
    }
  };

  if (fetchLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">🔄 Live-Status wird abgerufen...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aktueller Verifikationsstatus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            🔴 Live-Verifikationsstatus
            <Badge variant="outline" className="text-xs animate-pulse">
              🔄 Live Updates
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userProfile?.verified ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <div className="font-semibold text-green-700">✅ Ihr Account ist verifiziert!</div>
                  <div className="text-sm text-muted-foreground">
                    Verifikationslevel: {getVerificationLevelDisplay(userProfile.verification_level || 'none').label}
                  </div>
                </div>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  🎉 Herzlichen Glückwunsch! Ihr Account ist vollständig verifiziert. 
                  Sie genießen erhöhtes Vertrauen bei anderen Nutzern und haben Zugang zu allen Premium-Funktionen.
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <Badge variant="default" className="bg-green-600">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Verifiziert
                </Badge>
              </div>

              {userProfile.full_name && (
                <div className="text-sm">
                  <strong>Verifizierter Name:</strong> {userProfile.full_name}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verifikationsantrag Status oder neuer Antrag */}
      {verificationRequest ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              🔴 Live-Antrags-Status
              <Badge variant="outline" className="text-xs animate-pulse">
                🔄 Auto-Refresh
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant={verificationRequest.status === 'approved' ? 'default' : 
                              verificationRequest.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {(() => {
                    const StatusIcon = getStatusDisplay(verificationRequest.status).icon;
                    return StatusIcon ? <StatusIcon className="h-3 w-3 mr-1" /> : null;
                  })()}
                  {getStatusDisplay(verificationRequest.status).label}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Eingereicht am:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(verificationRequest.created_at).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Dokument-Typ:</span>
                <span className="text-sm">
                  {verificationRequest.document_type === 'id_card' ? 'Personalausweis' :
                   verificationRequest.document_type === 'passport' ? 'Reisepass' : 'Führerschein'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Name:</span>
                <span className="text-sm">{verificationRequest.full_name}</span>
              </div>

              {verificationRequest.admin_notes && (
                <div className="space-y-2">
                  <span className="font-medium">Admin-Hinweise:</span>
                  <div className="p-3 bg-muted rounded text-sm">
                    {verificationRequest.admin_notes}
                  </div>
                </div>
              )}
            </div>

            {verificationRequest.status === 'pending' && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    🔄 <strong>Live-Status:</strong> Ihr Antrag wird bearbeitet. Updates erfolgen automatisch alle 10 Sekunden. 
                    Sie erhalten eine E-Mail, sobald die Prüfung abgeschlossen ist.
                  </AlertDescription>
                </Alert>
            )}

            {verificationRequest.status === 'rejected' && !userProfile?.verified && (
              <div className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <FileText className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Ihr Antrag wurde leider abgelehnt. Bitte prüfen Sie die Admin-Hinweise und reichen Sie einen neuen Antrag ein.
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('🔄 Neuer Antrag - Live-Update wird vorbereitet');
                    setVerificationRequest(null);
                    fetchVerificationStatus();
                  }}
                  className="w-full"
                >
                  🔄 Neuen Antrag stellen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : !userProfile?.verified && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Neuen Verifikationsantrag einreichen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Reichen Sie Ihre Dokumente für die Identitätsprüfung ein, um Ihr Vertrauen zu erhöhen.
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
                {loading ? 'Wird eingereicht...' : 'Verifizierungsantrag einreichen'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verifikationsvorteile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Vorteile der Verifizierung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Erhöhtes Vertrauen bei Nutzern</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Höhere Sichtbarkeit der Anzeigen</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Zugang zu Premium-Features</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Schutz vor Betrug</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}