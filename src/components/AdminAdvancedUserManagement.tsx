import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Shield, 
  Ban, 
  UserCheck, 
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  MoreHorizontal,
  Eye,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Star
} from "lucide-react";

export function AdminAdvancedUserManagement() {
  const { 
    users, 
    totalCount, 
    loading, 
    filters, 
    pagination,
    setFilters,
    setPagination,
    promoteUserToAdmin, 
    banUser, 
    unbanUser, 
    verifyUser,
    bulkAction 
  } = useAdminUsers();
  
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [bulkActionType, setBulkActionType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0 || !bulkActionType) return;

    const result = await bulkAction(selectedUsers, bulkActionType as any);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: `${selectedUsers.length} Nutzer wurden bearbeitet`
      });
      setSelectedUsers([]);
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
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Email', 'Role', 'Verified', 'Banned', 'Created', 'Last Active', 'Trades', 'Volume'],
      ...users.map(user => [
        user.email,
        user.role,
        user.verified ? 'Yes' : 'No',
        user.banned ? 'Yes' : 'No',
        new Date(user.created_at).toLocaleDateString(),
        new Date(user.last_active).toLocaleDateString(),
        user.total_trades,
        user.total_trade_volume_eur
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getVerificationBadge = (level: string) => {
    const badges = {
      'none': <Badge variant="outline">Nicht verifiziert</Badge>,
      'email': <Badge variant="secondary">E-Mail</Badge>,
      'phone': <Badge variant="secondary">Telefon</Badge>,
      'id': <Badge variant="default">Ausweis</Badge>,
      'full': <Badge variant="default" className="bg-success">Vollständig</Badge>
    };
    return badges[level] || badges['none'];
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Erweiterte Nutzer-Verwaltung
              <Badge variant="outline">{totalCount} Gesamt</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={exportUsers}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-background/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Suche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="E-Mail oder Name..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Rolle</label>
                <Select value={filters.role} onValueChange={(value) => setFilters({...filters, role: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Rollen</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Nutzer</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="banned">Gesperrt</SelectItem>
                    <SelectItem value="unverified">Unverifiziert</SelectItem>
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
                    <SelectItem value="created_at">Registrierung</SelectItem>
                    <SelectItem value="last_active">Letzte Aktivität</SelectItem>
                    <SelectItem value="email">E-Mail</SelectItem>
                    <SelectItem value="total_trades">Trades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-primary/10 rounded-lg">
              <span className="font-medium">{selectedUsers.length} ausgewählt</span>
              <Select value={bulkActionType} onValueChange={setBulkActionType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Aktion wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ban">Sperren</SelectItem>
                  <SelectItem value="unban">Entsperren</SelectItem>
                  <SelectItem value="verify">Verifizieren</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkAction} disabled={!bulkActionType}>
                Ausführen
              </Button>
              <Button variant="outline" onClick={() => setSelectedUsers([])}>
                Abbrechen
              </Button>
            </div>
          )}

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nutzer</TableHead>
                  <TableHead>Rolle & Status</TableHead>
                  <TableHead>Verifizierung</TableHead>
                  <TableHead>Aktivität</TableHead>
                  <TableHead>Trades</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.profile?.avatar_url ? (
                            <img src={user.profile.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                          ) : (
                            <Users className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            {user.profile?.full_name && (
                              <>
                                <span>{user.profile.full_name}</span>
                                {user.profile?.city && (
                                  <>
                                    <span>•</span>
                                    <MapPin className="h-3 w-3" />
                                    <span>{user.profile.city}</span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Admin' : 'Nutzer'}
                        </Badge>
                        {user.banned && (
                          <Badge variant="destructive">Gesperrt</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.verified ? (
                          <Badge variant="outline" className="text-success">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Verifiziert
                          </Badge>
                        ) : (
                          <Badge variant="outline">Unverifiziert</Badge>
                        )}
                        {user.profile?.verification_level && 
                          getVerificationBadge(user.profile.verification_level)
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString('de-DE')}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground mt-1">
                          <Eye className="h-3 w-3" />
                          {new Date(user.last_active).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span className="font-medium">{user.total_trades}</span>
                        </div>
                        <div className="text-muted-foreground">
                          €{user.total_trade_volume_eur?.toLocaleString() || 0}
                        </div>
                        {user.profile?.trust_score && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-warning" />
                            <span className="text-xs">{user.profile.trust_score}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Nutzer Details & Aktionen</DialogTitle>
                            <DialogDescription>
                              Detaillierte Informationen und Verwaltung für {selectedUser?.email}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="activity">Aktivität</TabsTrigger>
                              <TabsTrigger value="actions">Aktionen</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="details" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">E-Mail:</span> {selectedUser?.email}
                                </div>
                                <div>
                                  <span className="font-medium">Rolle:</span> {selectedUser?.role}
                                </div>
                                <div>
                                  <span className="font-medium">Verifiziert:</span> {selectedUser?.verified ? 'Ja' : 'Nein'}
                                </div>
                                <div>
                                  <span className="font-medium">Gesperrt:</span> {selectedUser?.banned ? 'Ja' : 'Nein'}
                                </div>
                                <div>
                                  <span className="font-medium">Registriert:</span> {selectedUser && new Date(selectedUser.created_at).toLocaleString('de-DE')}
                                </div>
                                <div>
                                  <span className="font-medium">Letzter Login:</span> {selectedUser && new Date(selectedUser.last_active).toLocaleString('de-DE')}
                                </div>
                              </div>
                              
                              {selectedUser?.profile && (
                                <div className="border-t pt-4">
                                  <h4 className="font-medium mb-3">Profil-Informationen</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Name:</span> {selectedUser.profile.full_name || 'Nicht angegeben'}
                                    </div>
                                    <div>
                                      <span className="font-medium">Stadt:</span> {selectedUser.profile.city || 'Nicht angegeben'}
                                    </div>
                                    <div>
                                      <span className="font-medium">Trust Score:</span> {selectedUser.profile.trust_score || 0}
                                    </div>
                                    <div>
                                      <span className="font-medium">Verifizierung:</span> {selectedUser.profile.verification_level || 'none'}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="activity" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Trading</CardTitle>
                                  </CardHeader>
                                  <CardContent className="text-sm">
                                    <div>Trades: {selectedUser?.total_trades || 0}</div>
                                    <div>Volumen: €{selectedUser?.total_trade_volume_eur?.toLocaleString() || 0}</div>
                                  </CardContent>
                                </Card>
                                
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Aktivität</CardTitle>
                                  </CardHeader>
                                  <CardContent className="text-sm">
                                    <div>Anzeigen: -</div>
                                    <div>Nachrichten: -</div>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="actions" className="space-y-4">
                              <div className="grid grid-cols-1 gap-3">
                                {!selectedUser?.verified && (
                                  <Button 
                                    onClick={() => verifyUser(selectedUser?.id)}
                                    className="w-full"
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Nutzer verifizieren
                                  </Button>
                                )}
                                
                                {!selectedUser?.banned ? (
                                  <Button 
                                    variant="destructive"
                                    onClick={() => banUser(selectedUser?.id, 'Admin action')}
                                    className="w-full"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Nutzer sperren
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline"
                                    onClick={() => unbanUser(selectedUser?.id)}
                                    className="w-full"
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Sperre aufheben
                                  </Button>
                                )}
                                
                                <Button variant="outline" className="w-full">
                                  <Mail className="h-4 w-4 mr-2" />
                                  E-Mail senden
                                </Button>
                              </div>
                              
                              <div className="border-t pt-4">
                                <label className="text-sm font-medium mb-2 block">Admin-Notizen</label>
                                <Textarea 
                                  placeholder="Notizen zu diesem Nutzer..."
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
              Zeige {(pagination.page - 1) * pagination.limit + 1} bis {Math.min(pagination.page * pagination.limit, totalCount)} von {totalCount} Nutzern
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