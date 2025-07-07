import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAds } from "@/hooks/useAdminAds";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Star, 
  Flag, 
  MoreHorizontal,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";

export function AdminAdvancedAdsManagement() {
  const {
    ads,
    totalCount,
    loading,
    filters,
    pagination,
    setFilters,
    setPagination,
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

  const exportAds = () => {
    const csvContent = [
      ['Title', 'Price', 'Currency', 'Status', 'Category', 'Location', 'User', 'Created', 'Views', 'Favorites'],
      ...ads.map(ad => [
        ad.title,
        ad.price,
        ad.currency,
        ad.status,
        ad.category,
        ad.location,
        ad.user?.email || '',
        new Date(ad.created_at).toLocaleDateString(),
        ad.view_count,
        ad.favorite_count
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'neu': return 'text-success';
      case 'wie neu': return 'text-success';
      case 'sehr gut': return 'text-primary';
      case 'gut': return 'text-secondary';
      case 'gebraucht': return 'text-muted-foreground';
      case 'defekt': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Erweiterte Anzeigen-Verwaltung
              <Badge variant="outline">{totalCount} Gesamt</Badge>
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
                    placeholder="Titel oder Beschreibung..."
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
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="reported">Gemeldet</SelectItem>
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
                    <SelectItem value="price">Preis</SelectItem>
                    <SelectItem value="view_count">Aufrufe</SelectItem>
                    <SelectItem value="favorite_count">Favoriten</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Reihenfolge</label>
                <Select value={filters.sortOrder} onValueChange={(value) => setFilters({...filters, sortOrder: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Absteigend</SelectItem>
                    <SelectItem value="asc">Aufsteigend</SelectItem>
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
                  <SelectItem value="activate">Aktivieren</SelectItem>
                  <SelectItem value="deactivate">Deaktivieren</SelectItem>
                  <SelectItem value="feature">Featured setzen</SelectItem>
                  <SelectItem value="unfeature">Featured entfernen</SelectItem>
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
                  <TableHead>Preis & Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Nutzer</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedAds.includes(ad.id)}
                        onCheckedChange={(checked) => handleSelectAd(ad.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium line-clamp-2">{ad.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{ad.category}</Badge>
                          {ad.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-xs">{ad.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className={getConditionColor(ad.condition)}>
                            {ad.condition}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {ad.price.toLocaleString()} {ad.currency}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(ad.created_at).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getStatusColor(ad.status)}>
                          {ad.status}
                        </Badge>
                        <div className="flex gap-1">
                          {ad.featured && (
                            <Badge variant="outline" className="text-warning">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {ad.boosted_until && new Date(ad.boosted_until) > new Date() && (
                            <Badge variant="outline" className="text-success">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Boost
                            </Badge>
                          )}
                          {ad.reports_count > 0 && (
                            <Badge variant="destructive">
                              <Flag className="h-3 w-3 mr-1" />
                              {ad.reports_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{ad.view_count} Aufrufe</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>{ad.favorite_count} Favoriten</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{ad.contact_count} Kontakte</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{ad.user?.email}</div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {ad.user?.verified && (
                            <CheckCircle className="h-3 w-3 text-success" />
                          )}
                          <span className="text-xs">
                            {ad.user?.verified ? 'Verifiziert' : 'Unverifiziert'}
                          </span>
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
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Anzeigen-Details & Verwaltung</DialogTitle>
                            <DialogDescription>
                              Detaillierte Informationen und Verwaltung für "{selectedAd?.title}"
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="performance">Performance</TabsTrigger>
                              <TabsTrigger value="reports">Meldungen</TabsTrigger>
                              <TabsTrigger value="actions">Aktionen</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="details" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Grunddaten</CardTitle>
                                  </CardHeader>
                                  <CardContent className="text-sm space-y-2">
                                    <div><strong>Titel:</strong> {selectedAd?.title}</div>
                                    <div><strong>Preis:</strong> {selectedAd?.price} {selectedAd?.currency}</div>
                                    <div><strong>Kategorie:</strong> {selectedAd?.category}</div>
                                    <div><strong>Zustand:</strong> {selectedAd?.condition}</div>
                                    <div><strong>Ort:</strong> {selectedAd?.location}</div>
                                  </CardContent>
                                </Card>
                                
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Status & Termine</CardTitle>
                                  </CardHeader>
                                  <CardContent className="text-sm space-y-2">
                                    <div><strong>Status:</strong> {selectedAd?.status}</div>
                                    <div><strong>Featured:</strong> {selectedAd?.featured ? 'Ja' : 'Nein'}</div>
                                    <div><strong>Erstellt:</strong> {selectedAd && new Date(selectedAd.created_at).toLocaleString('de-DE')}</div>
                                    <div><strong>Aktualisiert:</strong> {selectedAd && new Date(selectedAd.updated_at).toLocaleString('de-DE')}</div>
                                  </CardContent>
                                </Card>
                              </div>
                              
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Beschreibung</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm">{selectedAd?.description}</p>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            
                            <TabsContent value="performance" className="space-y-4">
                              <div className="grid grid-cols-3 gap-4">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      <Eye className="h-4 w-4" />
                                      Aufrufe
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-2xl font-bold">{selectedAd?.view_count}</div>
                                    <div className="text-xs text-muted-foreground">Gesamt</div>
                                  </CardContent>
                                </Card>
                                
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      <Star className="h-4 w-4" />
                                      Favoriten
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-2xl font-bold">{selectedAd?.favorite_count}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {selectedAd?.view_count > 0 && 
                                        `${((selectedAd?.favorite_count / selectedAd?.view_count) * 100).toFixed(1)}% Rate`
                                      }
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      <TrendingUp className="h-4 w-4" />
                                      Kontakte
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-2xl font-bold">{selectedAd?.contact_count}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {selectedAd?.view_count > 0 && 
                                        `${((selectedAd?.contact_count / selectedAd?.view_count) * 100).toFixed(1)}% Conversion`
                                      }
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="reports" className="space-y-4">
                              {selectedAd?.reports_count > 0 ? (
                                <Alert className="border-destructive">
                                  <AlertTriangle className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">
                                      {selectedAd.reports_count} Meldung(en) vorhanden
                                    </div>
                                    <div className="text-sm mt-1">
                                      Diese Anzeige wurde von Nutzern gemeldet und sollte überprüft werden.
                                    </div>
                                  </div>
                                </Alert>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                                  <div>Keine Meldungen für diese Anzeige</div>
                                </div>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="actions" className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <Button 
                                  onClick={() => updateAdStatus(selectedAd?.id, selectedAd?.status === 'active' ? 'inactive' : 'active')}
                                  variant={selectedAd?.status === 'active' ? 'destructive' : 'default'}
                                >
                                  {selectedAd?.status === 'active' ? (
                                    <>
                                      <X className="h-4 w-4 mr-2" />
                                      Deaktivieren
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Aktivieren
                                    </>
                                  )}
                                </Button>
                                
                                <Button 
                                  onClick={() => featureAd(selectedAd?.id, !selectedAd?.featured)}
                                  variant="outline"
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  {selectedAd?.featured ? 'Unfeature' : 'Feature'}
                                </Button>
                                
                                <Button 
                                  variant="destructive"
                                  onClick={() => deleteAd(selectedAd?.id, 'Admin deletion')}
                                  className="col-span-2"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Anzeige löschen
                                </Button>
                              </div>
                              
                              <div className="border-t pt-4">
                                <label className="text-sm font-medium mb-2 block">Admin-Notizen</label>
                                <Textarea 
                                  placeholder="Notizen zu dieser Anzeige..."
                                  rows={3}
                                />
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Zeige {(pagination.page - 1) * pagination.limit + 1} bis {Math.min(pagination.page * pagination.limit, totalCount)} von {totalCount} Anzeigen
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({...pagination, page: Math.max(1, pagination.page - 1)})}
                disabled={pagination.page === 1}
              >
                Zurück
              </Button>
              <span className="text-sm">
                Seite {pagination.page} von {Math.ceil(totalCount / pagination.limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                disabled={pagination.page * pagination.limit >= totalCount}
              >
                Weiter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}