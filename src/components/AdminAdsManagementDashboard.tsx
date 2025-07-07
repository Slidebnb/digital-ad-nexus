import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminAds } from "@/hooks/useAdminAds";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Search,
  Filter,
  Star,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Euro,
  MapPin,
  Settings,
  Trash2,
  Ban,
  CheckCircle,
  X,
  Download,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

export function AdminAdsManagementDashboard() {
  const { 
    ads, 
    totalCount, 
    loading, 
    filters,
    setFilters,
    updateAdStatus,
    featureAd,
    deleteAd,
    bulkAction
  } = useAdminAds();
  
  const { toast } = useToast();
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [bulkActionType, setBulkActionType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const handleUpdateAdStatus = async (adId: string, status: string) => {
    const result = await updateAdStatus(adId, status);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: "Anzeige-Status wurde aktualisiert"
      });
      setSelectedAd(null);
    } else {
      toast({
        title: "Fehler",
        description: "Anzeige-Status konnte nicht aktualisiert werden",
        variant: "destructive"
      });
    }
  };

  const handleFeatureAd = async (adId: string, featured: boolean) => {
    const result = await featureAd(adId, featured);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: featured ? "Anzeige wurde hervorgehoben" : "Hervorhebung wurde entfernt"
      });
    } else {
      toast({
        title: "Fehler",
        description: "Aktion fehlgeschlagen",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAd = async (adId: string) => {
    const result = await deleteAd(adId);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: "Anzeige wurde gelöscht"
      });
      setSelectedAd(null);
    } else {
      toast({
        title: "Fehler",
        description: "Anzeige konnte nicht gelöscht werden",
        variant: "destructive"
      });
    }
  };

  const handleBulkAction = async () => {
    if (selectedAds.length === 0 || !bulkActionType) return;

    const result = await bulkAction(selectedAds, bulkActionType as any);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: `${selectedAds.length} Anzeigen wurden bearbeitet`
      });
      setSelectedAds([]);
      setBulkActionType('');
    } else {
      toast({
        title: "Fehler",
        description: "Bulk-Aktion fehlgeschlagen",
        variant: "destructive"
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAds(ads.map(ad => ad.id));
    } else {
      setSelectedAds([]);
    }
  };

  const handleSelectAd = (adId: string, checked: boolean) => {
    if (checked) {
      setSelectedAds([...selectedAds, adId]);
    } else {
      setSelectedAds(selectedAds.filter(id => id !== adId));
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'active': <Badge variant="default" className="bg-success text-success-foreground">Aktiv</Badge>,
      'inactive': <Badge variant="secondary">Inaktiv</Badge>,
      'banned': <Badge variant="destructive">Gesperrt</Badge>,
      'sold': <Badge variant="outline">Verkauft</Badge>
    };
    return badges[status] || <Badge variant="outline">{status}</Badge>;
  };

  const exportAds = () => {
    const csvContent = [
      ['Title', 'Price', 'Status', 'Category', 'Location', 'Views', 'Favorites', 'Created', 'User Email'],
      ...ads.map(ad => [
        ad.title,
        `${ad.price} ${ad.currency}`,
        ad.status,
        ad.category,
        ad.location,
        ad.view_count,
        ad.favorite_count,
        new Date(ad.created_at).toLocaleDateString(),
        ad.user?.email || 'Unbekannt'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Card className="gradient-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Lade Anzeigen...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Anzeigen</p>
                <p className="text-2xl font-bold text-primary">{totalCount}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive</p>
                <p className="text-2xl font-bold text-success">
                  {ads.filter(ad => ad.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hervorgehoben</p>
                <p className="text-2xl font-bold text-warning">
                  {ads.filter(ad => ad.featured).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesperrt</p>
                <p className="text-2xl font-bold text-destructive">
                  {ads.filter(ad => ad.status === 'banned').length}
                </p>
              </div>
              <Ban className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Panel */}
      <Card className="gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Erweiterte Anzeigen-Verwaltung
              <Badge variant="outline">{ads.length} von {totalCount} angezeigt</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={exportAds}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-background/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Suche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Titel, Beschreibung..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                    <SelectItem value="banned">Gesperrt</SelectItem>
                    <SelectItem value="sold">Verkauft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Kategorie</label>
                <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Kategorien</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="altcoins">Altcoins</SelectItem>
                    <SelectItem value="mining">Mining</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Featured</label>
                <Select value="all" onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="featured">Hervorgehoben</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sortierung</label>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Erstellungsdatum</SelectItem>
                    <SelectItem value="updated_at">Letzte Änderung</SelectItem>
                    <SelectItem value="price">Preis</SelectItem>
                    <SelectItem value="view_count">Aufrufe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedAds.length > 0 && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-primary/10 rounded-lg">
              <span className="font-medium">{selectedAds.length} ausgewählt</span>
              <Select value={bulkActionType} onValueChange={setBulkActionType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Aktion wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Hervorheben</SelectItem>
                  <SelectItem value="unfeature">Hervorhebung entfernen</SelectItem>
                  <SelectItem value="activate">Aktivieren</SelectItem>
                  <SelectItem value="deactivate">Deaktivieren</SelectItem>
                  <SelectItem value="delete">Löschen</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkAction} disabled={!bulkActionType}>
                Ausführen
              </Button>
              <Button variant="outline" onClick={() => setSelectedAds([])}>
                Abbrechen
              </Button>
            </div>
          )}

          {/* Ads Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAds.length === ads.length && ads.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Anzeige</TableHead>
                  <TableHead>Status & Features</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Verkäufer</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id} className="hover:bg-background/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedAds.includes(ad.id)}
                        onCheckedChange={(checked) => handleSelectAd(ad.id, checked as boolean)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium line-clamp-1">{ad.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{ad.description}</div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 font-medium text-primary">
                            <Euro className="h-3 w-3" />
                            {ad.price.toLocaleString()} {ad.currency}
                          </span>
                          {ad.location && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {ad.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(ad.status)}
                        {ad.featured && (
                          <Badge variant="outline" className="text-warning border-warning">
                            <Star className="h-3 w-3 mr-1" />
                            Hervorgehoben
                          </Badge>
                        )}
                        {ad.boosted_until && new Date(ad.boosted_until) > new Date() && (
                          <Badge variant="outline" className="text-secondary border-secondary">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Geboostet
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{ad.view_count} Aufrufe</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{ad.favorite_count} Favoriten</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{ad.contact_count} Kontakte</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{ad.user?.email || 'Unbekannt'}</div>
                        {ad.user?.verified && (
                          <Badge variant="outline" className="text-success">
                            Verifiziert
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(ad.created_at).toLocaleDateString('de-DE')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Aktualisiert: {new Date(ad.updated_at).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedAd(ad)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Anzeige verwalten</DialogTitle>
                            <DialogDescription>
                              Aktionen für "{selectedAd?.title}"
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-background/50 rounded-lg">
                              <div><span className="font-medium">Titel:</span> {selectedAd?.title}</div>
                              <div><span className="font-medium">Preis:</span> €{selectedAd?.price}</div>
                              <div><span className="font-medium">Status:</span> {selectedAd?.status}</div>
                              <div><span className="font-medium">Kategorie:</span> {selectedAd?.category}</div>
                              <div><span className="font-medium">Aufrufe:</span> {selectedAd?.view_count}</div>
                              <div><span className="font-medium">Favoriten:</span> {selectedAd?.favorite_count}</div>
                            </div>

                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Status-Änderungen werden sofort wirksam und sind für alle Nutzer sichtbar.
                              </AlertDescription>
                            </Alert>
                          </div>

                          <DialogFooter className="flex gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => handleFeatureAd(selectedAd?.id, !selectedAd?.featured)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              {selectedAd?.featured ? 'Hervorhebung entfernen' : 'Hervorheben'}
                            </Button>
                            
                            {selectedAd?.status === 'active' ? (
                              <Button 
                                variant="outline"
                                onClick={() => handleUpdateAdStatus(selectedAd?.id, 'inactive')}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Deaktivieren
                              </Button>
                            ) : (
                              <Button 
                                variant="outline"
                                onClick={() => handleUpdateAdStatus(selectedAd?.id, 'active')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aktivieren
                              </Button>
                            )}

                            <Button 
                              variant="destructive"
                              onClick={() => handleDeleteAd(selectedAd?.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Löschen
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {ads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Anzeigen gefunden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}