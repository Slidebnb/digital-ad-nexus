
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BoostedAdCard } from "./BoostedAdCard";
import { Zap, Crown, ArrowRight, TrendingUp } from "lucide-react";

interface BoostedAd {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  created_at: string;
  images: string[];
  view_count: number;
  favorite_count: number;
  boosted_until: string;
  condition: string;
  featured: boolean;
}

interface BoostedAdsSectionProps {
  maxAds?: number;
  showHeader?: boolean;
  className?: string;
}

export function BoostedAdsSection({ maxAds = 6, showHeader = true, className = "" }: BoostedAdsSectionProps) {
  const [boostedAds, setBoostedAds] = useState<BoostedAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoostedAds = async () => {
      try {
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('status', 'active')
          .gt('boosted_until', new Date().toISOString())
          .order('featured', { ascending: false })
          .order('boosted_until', { ascending: false })
          .limit(maxAds);

        if (error) {
          console.error('Error fetching boosted ads:', error);
        } else {
          setBoostedAds(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoostedAds();
  }, [maxAds]);

  const handleAdClick = (adId: string) => {
    window.location.href = `/ad/${adId}`;
  };

  const handleViewAllClick = () => {
    window.location.href = '/browse?boosted=true';
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (boostedAds.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Gesponserte Anzeigen
              </h2>
              <p className="text-muted-foreground">
                Premium-Anzeigen von verifizierten Verkäufern
              </p>
            </div>
          </div>
          <Button 
            onClick={handleViewAllClick}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary"
          >
            Alle anzeigen
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boostedAds.map((ad) => (
          <BoostedAdCard
            key={ad.id}
            ad={ad}
            onClick={() => handleAdClick(ad.id)}
          />
        ))}
      </div>

      {/* Stats Banner */}
      <Card className="mt-8 bg-gradient-to-r from-primary/10 via-purple-50 to-pink-50 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Boost deine Anzeige!</h3>
                <p className="text-muted-foreground">
                  Erreiche bis zu 10x mehr potenzielle Käufer mit unserem Boost-System
                </p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/create-ad'}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary"
            >
              <Zap className="h-4 w-4 mr-2" />
              Anzeige boosten
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
