import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Shield, 
  Ban, 
  UserCheck, 
  Search,
  Crown,
  AlertTriangle,
  TrendingUp,
  Activity,
  Star,
  Mail,
  MapPin,
  Calendar,
  Eye,
  Zap
} from "lucide-react";

export function AdminUserManagementDashboard() {
  const { 
    users, 
    totalCount, 
    loading, 
    filters,
    setFilters,
    promoteUserToAdmin, 
    banUser, 
    unbanUser,
    verifyUser
  } = useAdminUsers();
  
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [banReason, setBanReason] = useState("");

  const handlePromoteUser = async () => {
    if (!promoteEmail) return;
    
    const result = await promoteUserToAdmin(promoteEmail);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: "Nutzer wurde erfolgreich zum Admin befördert"
      });
      setPromoteEmail("");
    } else {
      toast({
        title: "Fehler",
        description: "Nutzer konnte nicht befördert werden",
        variant: "destructive"
      });
    }
  };

  const handleBanUser = async (userId: string) => {
    const result = await banUser(userId, banReason);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: "Nutzer wurde gesperrt"
      });
      setSelectedUser(null);
      setBanReason("");
    } else {
      toast({
        title: "Fehler", 
        description: "Nutzer konnte nicht gesperrt werden",
        variant: "destructive"
      });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const result = await unbanUser(userId);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: "Nutzer wurde entsperrt"
      });
      setSelectedUser(null);
    } else {
      toast({
        title: "Fehler",
        description: "Nutzer konnte nicht entsperrt werden", 
        variant: "destructive"
      });
    }
  };

  const handleVerifyUser = async (userId: string) => {
    const result = await verifyUser(userId);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: "Nutzer wurde verifiziert"
      });
      setSelectedUser(null);
    } else {
      toast({
        title: "Fehler",
        description: "Nutzer konnte nicht verifiziert werden",
        variant: "destructive"
      });
    }
  };

  const getVerificationLevel = (user: any) => {
    if (user.profile?.verification_level === 'full') return 'Vollständig';
    if (user.profile?.verification_level === 'id') return 'Ausweis';
    if (user.profile?.verification_level === 'phone') return 'Telefon';
    if (user.profile?.verification_level === 'email') return 'E-Mail';
    return 'Nicht verifiziert';
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <Card className="gradient-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Lade Nutzerdaten...</p>
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
                <p className="text-sm text-muted-foreground">Gesamt Nutzer</p>
                <p className="text-2xl font-bold text-primary">{totalCount}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verifiziert</p>
                <p className="text-2xl font-bold text-success">
                  {users.filter(u => u.verified).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Trader</p>
                <p className="text-2xl font-bold text-warning">
                  {users.filter(u => u.total_trades > 0).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesperrt</p>
                <p className="text-2xl font-bold text-destructive">
                  {users.filter(u => u.banned).length}
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
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Nutzer-Verwaltung Dashboard
            <Badge variant="outline" className="ml-auto">
              {users.length} von {totalCount} angezeigt
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Promote User Section */}
          <Alert className="mb-6">
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  placeholder="E-Mail des Nutzers zum Admin befördern"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handlePromoteUser} variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Zu Admin befördern
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nutzer durchsuchen..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-success" />
              <span className="text-sm text-muted-foreground">Live-Updates aktiv</span>
            </div>
          </div>

          {/* Enhanced Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nutzer</TableHead>
                  <TableHead>Status & Rolle</TableHead>
                  <TableHead>Verifizierung</TableHead>
                  <TableHead>Aktivität</TableHead>
                  <TableHead>Trading</TableHead>
                  <TableHead>Trust Score</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-background/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-semibold">
                          {user.profile?.avatar_url ? (
                            <img 
                              src={user.profile.avatar_url} 
                              alt="" 
                              className="h-10 w-10 rounded-full object-cover" 
                            />
                          ) : (
                            <span>{user.email.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {user.profile?.full_name && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.profile.full_name}
                              </span>
                            )}
                            {user.profile?.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {user.profile.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? (
                            <><Crown className="h-3 w-3 mr-1" /> Admin</>
                          ) : (
                            <><Users className="h-3 w-3 mr-1" /> Nutzer</>
                          )}
                        </Badge>
                        {user.banned && (
                          <Badge variant="destructive" className="block">
                            <Ban className="h-3 w-3 mr-1" />
                            Gesperrt
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {user.verified ? (
                          <Badge variant="outline" className="text-success border-success">
                            <UserCheck className="h-3 w-3 mr-1" />
                            {getVerificationLevel(user)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Unverifiziert
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Seit {new Date(user.created_at).toLocaleDateString('de-DE')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>Aktiv {new Date(user.last_active).toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {user.total_trades} Trades
                        </div>
                        <div className="text-muted-foreground">
                          €{user.total_trade_volume_eur?.toLocaleString('de-DE') || '0'}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className={`h-4 w-4 ${getTrustScoreColor(user.profile?.trust_score || 0)}`} />
                          <span className={`font-medium ${getTrustScoreColor(user.profile?.trust_score || 0)}`}>
                            {user.profile?.trust_score || 0}
                          </span>
                        </div>
                        <Progress 
                          value={user.profile?.trust_score || 0} 
                          className="w-16 h-2"
                        />
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
                            <Zap className="h-4 w-4 mr-1" />
                            Verwalten
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Nutzer verwalten</DialogTitle>
                            <DialogDescription>
                              Aktionen für {selectedUser?.email}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-background/50 rounded-lg">
                              <div><span className="font-medium">E-Mail:</span> {selectedUser?.email}</div>
                              <div><span className="font-medium">Rolle:</span> {selectedUser?.role}</div>
                              <div><span className="font-medium">Verifiziert:</span> {selectedUser?.verified ? 'Ja' : 'Nein'}</div>
                              <div><span className="font-medium">Gesperrt:</span> {selectedUser?.banned ? 'Ja' : 'Nein'}</div>
                              <div><span className="font-medium">Trades:</span> {selectedUser?.total_trades}</div>
                              <div><span className="font-medium">Volumen:</span> €{selectedUser?.total_trade_volume_eur?.toLocaleString('de-DE') || '0'}</div>
                            </div>

                            {selectedUser?.banned && (
                              <Input
                                placeholder="Grund für Sperrung (optional)"
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                              />
                            )}
                          </div>

                          <DialogFooter className="flex gap-2">
                            {!selectedUser?.verified && (
                              <Button 
                                variant="outline"
                                onClick={() => handleVerifyUser(selectedUser?.id)}
                                className="flex items-center gap-2"
                              >
                                <UserCheck className="h-4 w-4" />
                                Verifizieren
                              </Button>
                            )}
                            
                            {selectedUser?.banned ? (
                              <Button 
                                variant="outline"
                                onClick={() => handleUnbanUser(selectedUser?.id)}
                                className="flex items-center gap-2"
                              >
                                <UserCheck className="h-4 w-4" />
                                Entsperren
                              </Button>
                            ) : (
                              <Button 
                                variant="destructive"
                                onClick={() => handleBanUser(selectedUser?.id)}
                                className="flex items-center gap-2"
                              >
                                <Ban className="h-4 w-4" />
                                Sperren
                              </Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Nutzer gefunden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}