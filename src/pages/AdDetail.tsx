import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, MapPin, Clock, Shield, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  images: string[];
  accepted_coins: string[];
  created_at: string;
  user_id: string;
  condition: string;
  category: string;
}

interface Profile {
  full_name: string;
  avatar_url: string;
  city: string;
  verified: boolean;
  rating: number;
  total_trades: number;
  member_since: string;
}

export default function AdDetail() {
  const { id } = useParams<{ id: string }>();
  const [ad, setAd] = useState<Ad | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchAdDetails = async () => {
      if (!id) return;

      try {
        // Fetch ad details
        const { data: adData, error: adError } = await supabase
          .from('ads')
          .select('*')
          .eq('id', id)
          .single();

        if (adError) throw adError;
        setAd(adData);

        // Fetch seller profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', adData.user_id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Increment view count
        await supabase.rpc('increment_ad_views', { ad_id: id });

      } catch (error) {
        console.error('Error fetching ad details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ad || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Anzeige nicht gefunden</h1>
            <p className="text-muted-foreground">Die gesuchte Anzeige existiert nicht oder wurde entfernt.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <Card className="gradient-card">
              <CardContent className="p-0">
                {ad.images && ad.images.length > 0 ? (
                  <div className="relative">
                    <img 
                      src={ad.images[currentImageIndex]} 
                      alt={ad.title}
                      className="w-full h-96 object-cover rounded-t-lg"
                    />
                    {ad.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {ad.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-96 bg-muted rounded-t-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Kein Bild verfügbar</p>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{ad.title}</h1>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {ad.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(ad.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {ad.price.toLocaleString('de-DE')} {ad.currency}
                      </div>
                      <Badge variant="secondary">{ad.condition}</Badge>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Beschreibung</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{ad.description}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Akzeptierte Kryptowährungen</h3>
                    <div className="flex flex-wrap gap-2">
                      {ad.accepted_coins.map((coin) => (
                        <Badge key={coin} variant="outline">{coin}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seller Info & Actions */}
          <div className="space-y-6">
            {/* Seller Profile */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Verkäufer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback>{profile.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{profile.full_name}</h3>
                      {profile.verified && (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{profile.city}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{profile.rating || 0}/5</span>
                      <span className="text-sm text-muted-foreground">
                        ({profile.total_trades || 0} Trades)
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mitglied seit {formatDate(profile.member_since || '2024-01-01')}
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="gradient-card">
              <CardContent className="p-6 space-y-4">
                <Button className="w-full" size="lg">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Nachricht senden
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Heart className="h-5 w-5 mr-2" />
                  Zu Favoriten hinzufügen
                </Button>
                <Button variant="secondary" className="w-full">
                  Verkäufer melden
                </Button>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sicherheitstipps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>• Treffen Sie sich an öffentlichen Orten</p>
                <p>• Verwenden Sie sichere Zahlungsmethoden</p>
                <p>• Überprüfen Sie die Identität des Verkäufers</p>
                <p>• Melden Sie verdächtige Aktivitäten</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}