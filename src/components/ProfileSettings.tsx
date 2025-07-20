import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VerificationModal, VerificationBadge } from "@/components/VerificationModal";
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Globe,
  Shield,
  Bell,
  Palette,
  Wallet,
  Save,
  Upload,
  Lock,
  Info,
  HelpCircle,
  Camera,
  X
} from "lucide-react";

interface UserProfile {
  full_name: string;
  bio: string;
  city: string;
  phone: string;
  website: string;
  telegram_username: string;
  preferred_language: string;
  timezone: string;
  avatar_url: string;
  verified: boolean;
  verification_level: string;
  email: string;
  created_at: string;
}

export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Trenne veränderbare und unveränderbare Daten
  const [editableData, setEditableData] = useState({
    bio: '',
    website: '',
    telegram_username: '',
    preferred_language: 'de',
    timezone: 'Europe/Berlin'
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
      setupRealtimeSubscriptions();
    }

    return () => {
      supabase.removeAllChannels();
    };
  }, [user]);

  // Real-time Updates alle 15 Sekunden
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('Profile Update');
      fetchProfileData();
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // Real-time Updates für Profile
    const profileChannel = supabase
      .channel('profile_settings_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time Profil-Einstellungen Update:', payload);
          fetchProfileData();
        }
      )
      .subscribe();
  };

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      console.log('Profil-Einstellungen für User:', user.id);
      setFetchLoading(true);

      // Profil-Daten abrufen
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Fehler beim Laden des Profils:', profileError);
        return;
      }

      // User Auth-Daten abrufen (Email, created_at)
      const authUser = user;

      const fullProfile = {
        full_name: profileData?.full_name || '',
        bio: profileData?.bio || '',
        city: profileData?.city || '',
        phone: profileData?.phone || '',
        website: profileData?.website || '',
        telegram_username: profileData?.telegram_username || '',
        preferred_language: profileData?.preferred_language || 'de',
        timezone: profileData?.timezone || 'Europe/Berlin',
        avatar_url: profileData?.avatar_url || '',
        verified: profileData?.verified || false,
        verification_level: profileData?.verification_level || 'none',
        email: authUser.email || '',
        created_at: authUser.created_at || ''
      };

      console.log('Profil-Daten geladen:', fullProfile);
      setProfile(fullProfile);

      // Editierbare Daten setzen
      setEditableData({
        bio: fullProfile.bio,
        website: fullProfile.website,
        telegram_username: fullProfile.telegram_username,
        preferred_language: fullProfile.preferred_language,
        timezone: fullProfile.timezone
      });

    } catch (error) {
      console.error('Fehler beim Laden der Profil-Daten:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      console.log('Speichere editierbare Profil-Daten:', editableData);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...editableData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Gespeichert",
        description: "Ihre Profileinstellungen wurden erfolgreich aktualisiert."
      });

      // Daten sofort neu laden
      setTimeout(() => fetchProfileData(), 500);
      
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast({
        title: "Fehler",
        description: "Profil konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditableData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine gültige Bilddatei aus.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fehler", 
        description: "Die Datei ist zu groß. Maximale Größe: 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      console.log('Uploading avatar for user:', user.id);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      console.log('Avatar uploaded, public URL:', publicUrl);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      toast({
        title: "Erfolgreich",
        description: "Profilbild wurde erfolgreich hochgeladen."
      });

      // Reload profile data
      setTimeout(() => fetchProfileData(), 500);

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Fehler",
        description: "Profilbild konnte nicht hochgeladen werden.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (!user || !profile?.avatar_url) return;

    setUploadingAvatar(true);

    try {
      // Update profile in database (remove avatar_url)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Erfolgreich",
        description: "Profilbild wurde entfernt."
      });

      // Reload profile data
      setTimeout(() => fetchProfileData(), 500);

    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "Fehler", 
        description: "Profilbild konnte nicht entfernt werden.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (fetchLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Profildaten werden geladen...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Profileinstellungen</h2>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie Ihre persönlichen Informationen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <VerificationBadge 
            verified={profile?.verified || false} 
            verificationLevel={profile?.verification_level || 'none'} 
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* UNVERÄNDERBARE GRUNDINFORMATIONEN */}
        <Card className="border-muted bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Grundinformationen (Registrierung)
              <Badge variant="outline" className="text-xs">
                Unveränderbar
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-muted bg-muted/50">
              <Info className="h-4 w-4 text-muted-foreground" />
              <AlertDescription>
                Diese Daten stammen aus Ihrer Registrierung und können nur über den Support geändert werden.
              </AlertDescription>
            </Alert>

            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profile?.full_name?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : (
                      <Camera className="h-4 w-4 mr-2" />
                    )}
                    {profile?.avatar_url ? 'Ändern' : 'Hochladen'}
                  </Button>
                  {profile?.avatar_url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button"
                      onClick={handleAvatarDelete}
                      disabled={uploadingAvatar}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile?.avatar_url ? 'Profilbild gespeichert' : 'Kein Profilbild vorhanden'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* UNVERÄNDERBARE FELDER */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                  E-Mail-Adresse
                </Label>
                <Input
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                  Vollständiger Name
                </Label>
                <Input
                  value={profile?.full_name || 'Nicht gesetzt'}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                  Stadt
                </Label>
                <Input
                  value={profile?.city || 'Nicht gesetzt'}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                  Telefonnummer
                </Label>
                <Input
                  value={profile?.phone || 'Nicht gesetzt'}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-3 w-3 text-muted-foreground" />
                Registriert seit
              </Label>
              <Input
                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Unbekannt'}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <Alert className="border-yellow-200 bg-yellow-50">
              <HelpCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Support kontaktieren:</strong> Für Änderungen der Grunddaten wenden Sie sich an unser Support-Team.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Separator />

        {/* ÄNDERBARE ZUSÄTZLICHE INFORMATIONEN */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Zusätzliche Informationen
              <Badge variant="default" className="text-xs bg-green-600">
                Änderbar
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="bio">Über mich</Label>
              <Textarea
                id="bio"
                value={editableData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Erzählen Sie etwas über sich..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={editableData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram Username</Label>
              <Input
                id="telegram"
                value={editableData.telegram_username}
                onChange={(e) => handleInputChange('telegram_username', e.target.value)}
                placeholder="@username"
              />
            </div>
          </CardContent>
        </Card>

        {/* EINSTELLUNGEN UND PRÄFERENZEN */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Präferenzen & Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Sprache</Label>
                <Select value={editableData.preferred_language} onValueChange={(value) => handleInputChange('preferred_language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zeitzone</Label>
                <Select value={editableData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Berlin">Europa/Berlin</SelectItem>
                    <SelectItem value="Europe/Vienna">Europa/Wien</SelectItem>
                    <SelectItem value="Europe/Zurich">Europa/Zürich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VERIFIKATION */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verifizierung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Verifizierung</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.verified 
                    ? "Ihr Account ist verifiziert. Sie können Anzeigen erstellen."
                    : "Verifizieren Sie Ihren Account, um Anzeigen erstellen zu können."
                  }
                </p>
              </div>
              {!profile?.verified && (
                <VerificationModal>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Jetzt verifizieren
                  </Button>
                </VerificationModal>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SPEICHERN BUTTON */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={fetchProfileData}
            disabled={loading}
          >
            Neu laden
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[140px]">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Änderungen speichern
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}