import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import BoostAdModal from "@/components/BoostAdModal";
import { 
  Eye,
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  PlusCircle,
  Search,
  Filter,
  Zap
} from "lucide-react";

export function UserAds() {
  const { userAds, getUserStats } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string>("");
  
  const stats = getUserStats();

  const filteredAds = userAds.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || ad.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteAd = async (adId: string) => {
    // TODO: Implement delete ad functionality
    toast({
      title: "Feature wird implementiert",
      description: "Die Löschfunktion wird bald verfügbar sein.",
    });
  };

  const handleEditAd = (adId: string) => {
    // TODO: Navigate to edit ad page
    toast({
      title: "Feature wird implementiert", 
      description: "Die Bearbeitungsfunktion wird bald verfügbar sein.",
    });
  };

  const handleBoostAd = (adId: string) => {
    setSelectedAdId(adId);
    setBoostModalOpen(true);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Aktiv</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inaktiv</Badge>;
      case 'sold':
        return <Badge className="bg-muted text-muted-foreground">Verkauft</Badge>;
      case 'banned':
        return <Badge variant="destructive">Gesperrt</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const getBoostStatus = (ad: any) => {
    if (ad.boosted_until && new Date(ad.boosted_until) > new Date()) {
      const daysLeft = Math.ceil((new Date(ad.boosted_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return (
        <Badge className="bg-accent/10 text-accent border-accent/20 flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Geboostet ({daysLeft}d)
        </Badge>
      );
    }
    if (ad.featured) {
      return <Badge className="bg-primary/10 text-primary border-primary/20">Featured</Badge>;
    }
    return null;
  };

  const isAdBoosted = (ad: any) => {
    return ad.boosted_until && new Date(ad.boosted_until) > new Date();
  };

  const handleCreateAd = () => {
    if (!stats.verified) {
      toast({
        title: "Verifizierung erforderlich",
        description: "Sie müssen Ihren Account verifizieren, um Anzeigen zu erstellen.",
        variant: "destructive"
      });
      return;
    }
    navigate('/create-ad');
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Meine Anzeigen</h2>
          <p className="text-muted-foreground">
            {stats.totalAds} Anzeigen gesamt • {stats.activeAds} aktiv
          </p>
        </div>
        <Button 
          variant="gradient"
          disabled={!stats.verified}
          onClick={handleCreateAd}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Neue Anzeige
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="gradient-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Anzeigen durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                Alle
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("active")}
              >
                Aktiv
              </Button>
              <Button
                variant={filterStatus === "sold" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("sold")}
              >
                Verkauft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ads List */}
      {filteredAds.length === 0 ? (
        <Card className="gradient-card">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "Keine Anzeigen gefunden" : "Noch keine Anzeigen"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Versuchen Sie andere Suchbegriffe." 
                : stats.verified 
                  ? "Erstellen Sie Ihre erste Anzeige und erreichen Sie tausende potentielle Käufer."
                  : "Verifizieren Sie Ihren Account, um Anzeigen erstellen zu können."
              }
            </p>
            {!searchTerm && (
              <Button 
                variant="gradient"
                disabled={!stats.verified}
                onClick={stats.verified ? handleCreateAd : () => navigate('/dashboard?tab=verification')}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {stats.verified ? "Erste Anzeige erstellen" : "Account verifizieren"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAds.map((ad) => (
            <Card key={ad.id} className={`gradient-card hover:shadow-lg transition-shadow ${isAdBoosted(ad) ? 'ring-2 ring-primary/30 bg-primary/5' : ''}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Image placeholder */}
                  <div className="w-full md:w-32 h-32 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {ad.images && ad.images.length > 0 ? (
                      <img 
                        src={ad.images[0]} 
                        alt={ad.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-4xl">📷</div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Title and Status */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                          {ad.title}
                          {isAdBoosted(ad) && (
                            <Zap className="h-4 w-4 text-primary animate-pulse" />
                          )}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(ad.status)}
                          {getBoostStatus(ad)}
                          {ad.category_name && (
                            <Badge variant="outline" className="text-xs">
                              {ad.category_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          €{Number(ad.price).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ad.currency || 'EUR'}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {ad.description}
                    </p>

                    {/* Stats and Actions */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {ad.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {ad.favorites || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {ad.contact_count || 0}
                        </span>
                        <span className="text-xs">
                          {new Date(ad.created_at || '').toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant={isAdBoosted(ad) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleBoostAd(ad.id)}
                          className={isAdBoosted(ad) ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" : ""}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          {isAdBoosted(ad) ? "Verlängern" : "Boost"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditAd(ad.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteAd(ad.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Boost Modal */}
      <BoostAdModal
        isOpen={boostModalOpen}
        onClose={() => {
          setBoostModalOpen(false);
          setSelectedAdId("");
        }}
        adId={selectedAdId}
      />
    </div>
  );
}
