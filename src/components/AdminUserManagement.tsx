import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Shield, 
  Ban, 
  UserCheck, 
  Search,
  Crown,
  AlertTriangle
} from "lucide-react";

export function AdminUserManagement() {
  const { users, promoteUserToAdmin, banUser, loading } = useAdminData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [promoteEmail, setPromoteEmail] = useState("");

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    const result = await banUser(userId);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: "Nutzer wurde gesperrt"
      });
      setSelectedUser(null);
    } else {
      toast({
        title: "Fehler", 
        description: "Nutzer konnte nicht gesperrt werden",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="gradient-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Nutzer-Verwaltung
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
                placeholder="Nutzer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {filteredUsers.length} Nutzer
            </Badge>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registriert</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'Nutzer'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.verified && (
                          <Badge variant="outline" className="text-success">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Verifiziert
                          </Badge>
                        )}
                        {user.banned && (
                          <Badge variant="destructive">
                            <Ban className="h-3 w-3 mr-1" />
                            Gesperrt
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            Verwalten
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Nutzer verwalten</DialogTitle>
                            <DialogDescription>
                              Aktionen für {selectedUser?.email}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
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
                            </div>
                          </div>

                          <DialogFooter>
                            {!selectedUser?.banned && (
                              <Button 
                                variant="destructive" 
                                onClick={() => handleBanUser(selectedUser?.id)}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Nutzer sperren
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
        </CardContent>
      </Card>
    </div>
  );
}