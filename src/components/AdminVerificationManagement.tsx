import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Check, 
  X, 
  Eye,
  Clock,
  User
} from "lucide-react";

export function AdminVerificationManagement() {
  const { verificationRequests, approveVerification, rejectVerification, loading } = useAdminData();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async (requestId: string) => {
    const result = await approveVerification(requestId);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: "Verifizierung wurde genehmigt"
      });
      setSelectedRequest(null);
    } else {
      toast({
        title: "Fehler",
        description: "Verifizierung konnte nicht genehmigt werden",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Grund für die Ablehnung an",
        variant: "destructive"
      });
      return;
    }

    const result = await rejectVerification(requestId, rejectReason);
    if (result.success) {
      toast({
        title: "Erfolg",
        description: "Verifizierung wurde abgelehnt"
      });
      setSelectedRequest(null);
      setRejectReason("");
    } else {
      toast({
        title: "Fehler",
        description: "Verifizierung konnte nicht abgelehnt werden",
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
            <Shield className="h-5 w-5" />
            Verifizierungs-Verwaltung
            <Badge variant="outline" className="ml-auto">
              {verificationRequests.length} ausstehend
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verificationRequests.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine ausstehenden Verifizierungen</h3>
              <p className="text-muted-foreground">
                Alle Verifizierungsanfragen wurden bearbeitet.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Dokument-Typ</TableHead>
                    <TableHead>Eingereicht</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verificationRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {request.full_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {request.document_type === 'passport' ? 'Reisepass' : 
                           request.document_type === 'id_card' ? 'Personalausweis' : 
                           request.document_type === 'drivers_license' ? 'Führerschein' : 
                           request.document_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString('de-DE')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-warning">
                          <Clock className="h-3 w-3 mr-1" />
                          Ausstehend
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Prüfen
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Verifizierungsantrag prüfen</DialogTitle>
                              <DialogDescription>
                                Prüfen Sie die eingereichten Dokumente und entscheiden Sie über die Verifizierung.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Name:</span> {selectedRequest?.full_name}
                                </div>
                                <div>
                                  <span className="font-medium">Dokument-Typ:</span> {selectedRequest?.document_type}
                                </div>
                                <div>
                                  <span className="font-medium">Eingereicht:</span> {selectedRequest && new Date(selectedRequest.created_at).toLocaleDateString('de-DE')}
                                </div>
                                <div>
                                  <span className="font-medium">User-ID:</span> {selectedRequest?.user_id}
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <h4 className="font-medium mb-2">Ablehnungsgrund (falls zutreffend):</h4>
                                <Textarea
                                  placeholder="Grund für die Ablehnung der Verifizierung..."
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  rows={3}
                                />
                              </div>
                            </div>

                            <DialogFooter className="gap-2">
                              <Button 
                                variant="destructive"
                                onClick={() => handleReject(selectedRequest?.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Ablehnen
                              </Button>
                              <Button 
                                variant="default"
                                onClick={() => handleApprove(selectedRequest?.id)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Genehmigen
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}