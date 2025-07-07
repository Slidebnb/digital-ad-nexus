import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVerificationManagement } from "@/hooks/useVerificationManagement";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Check, 
  X, 
  Eye,
  Clock,
  User,
  Image,
  FileText,
  AlertTriangle,
  CheckCircle,
  Download
} from "lucide-react";

export function AdminVerificationManagement() {
  const { requests, stats, loading, approveVerification, rejectVerification } = useVerificationManagement();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const downloadDocument = async (documentUrl: string, filename: string) => {
    try {
      console.log('Attempting to download:', documentUrl);
      
      if (!documentUrl) {
        throw new Error('Keine URL verfügbar');
      }

      // Extrahiere den Pfad aus der URL falls es eine vollständige URL ist
      let path = documentUrl;
      if (documentUrl.includes('/storage/v1/object/')) {
        path = documentUrl.split('/storage/v1/object/')[1];
        if (path.startsWith('public/')) {
          path = path.substring(7); // Entferne 'public/' prefix
        }
      }
      
      console.log('Downloading from path:', path);
      
      const { data, error } = await supabase.storage
        .from('verification-documents')
        .download(path);

      if (error) {
        console.error('Storage download error:', error);
        throw error;
      }

      if (data) {
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "✅ Download erfolgreich",
          description: "Das Dokument wurde heruntergeladen."
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "❌ Download fehlgeschlagen",
        description: error.message || "Dokument konnte nicht heruntergeladen werden",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async (requestId: string) => {
    if (processing) return;
    
    setProcessing(true);
    const result = await approveVerification(requestId);
    
    if (result.success) {
      toast({
        title: "✅ Verifizierung genehmigt",
        description: "Der Nutzer wurde benachrichtigt und erhält erweiterte Berechtigungen."
      });
      setSelectedRequest(null);
    } else {
      toast({
        title: "❌ Fehler",
        description: result.error || "Verifizierung konnte nicht genehmigt werden",
        variant: "destructive"
      });
    }
    setProcessing(false);
  };

  const handleReject = async (requestId: string) => {
    if (!rejectReason.trim()) {
      toast({
        title: "⚠️ Grund erforderlich",
        description: "Bitte geben Sie einen Grund für die Ablehnung an",
        variant: "destructive"
      });
      return;
    }

    if (processing) return;
    
    setProcessing(true);
    const result = await rejectVerification(requestId, rejectReason);
    
    if (result.success) {
      toast({
        title: "✅ Verifizierung abgelehnt",
        description: "Der Nutzer wurde über die Ablehnung informiert."
      });
      setSelectedRequest(null);
      setRejectReason("");
    } else {
      toast({
        title: "❌ Fehler",
        description: result.error || "Verifizierung konnte nicht abgelehnt werden",
        variant: "destructive"
      });
    }
    setProcessing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning"><Clock className="h-3 w-3 mr-1" />Ausstehend</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-success"><CheckCircle className="h-3 w-3 mr-1" />Genehmigt</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-destructive"><X className="h-3 w-3 mr-1" />Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentTypeName = (type: string) => {
    const types = {
      'passport': 'Reisepass',
      'id_card': 'Personalausweis',
      'drivers_license': 'Führerschein',
      'national_id': 'Personalausweis'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Card className="gradient-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Lade Verifizierungsanfragen...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genehmigt</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgelehnt</CardTitle>
            <X className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Verification Table */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verifizierungs-Management
            <Badge variant="outline" className="ml-auto">
              {stats.pending} ausstehend
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Verifizierungsanfragen</h3>
              <p className="text-muted-foreground">
                Alle Verifizierungsanfragen wurden bearbeitet.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nutzer</TableHead>
                    <TableHead>Dokument-Typ</TableHead>
                    <TableHead>Eingereicht</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bilder</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{request.full_name}</div>
                            <div className="text-sm text-muted-foreground">{request.user_email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getDocumentTypeName(request.document_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {request.document_front_url && (
                            <Badge variant="outline" className="text-xs">
                              <Image className="h-3 w-3 mr-1" />Vorne
                            </Badge>
                          )}
                          {request.document_back_url && (
                            <Badge variant="outline" className="text-xs">
                              <Image className="h-3 w-3 mr-1" />Hinten
                            </Badge>
                          )}
                          {request.selfie_url && (
                            <Badge variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />Selfie
                            </Badge>
                          )}
                        </div>
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
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Verifizierungsantrag detailliert prüfen</DialogTitle>
                              <DialogDescription>
                                Prüfen Sie alle eingereichten Dokumente sorgfältig und entscheiden Sie über die Verifizierung.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* User Information */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Nutzerinformationen</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Vollständiger Name:</span><br />
                                      <span className="text-lg">{selectedRequest?.full_name}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">E-Mail:</span><br />
                                      <span>{selectedRequest?.user_email}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Dokument-Typ:</span><br />
                                      <Badge variant="outline">
                                        {getDocumentTypeName(selectedRequest?.document_type)}
                                      </Badge>
                                    </div>
                                    <div>
                                      <span className="font-medium">Eingereicht am:</span><br />
                                      <span>{selectedRequest && new Date(selectedRequest.created_at).toLocaleString('de-DE')}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">User-ID:</span><br />
                                      <span className="font-mono text-xs">{selectedRequest?.user_id}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Stadt:</span><br />
                                      <span>{selectedRequest?.user_city || 'Nicht angegeben'}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Document Images */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Eingereichte Dokumente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedRequest?.document_front_url && (
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Dokument Vorderseite</h4>
                                         <div className="relative group">
                                           <img 
                                             src={selectedRequest.document_front_url} 
                                             alt="Dokument Vorderseite"
                                             className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                             onClick={() => setImagePreview(selectedRequest.document_front_url)}
                                             onError={(e) => {
                                               e.currentTarget.src = '/placeholder.svg';
                                               e.currentTarget.alt = 'Bild konnte nicht geladen werden';
                                             }}
                                           />
                                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                             <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                           </div>
                                         </div>
                                         <Button 
                                           variant="outline" 
                                           size="sm" 
                                           className="w-full"
                                           onClick={() => downloadDocument(selectedRequest.document_front_url, 'dokument-vorderseite.jpg')}
                                         >
                                           <Download className="h-4 w-4 mr-2" />
                                           Herunterladen
                                         </Button>
                                      </div>
                                    )}

                                    {selectedRequest?.document_back_url && (
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Dokument Rückseite</h4>
                                         <div className="relative group">
                                           <img 
                                             src={selectedRequest.document_back_url} 
                                             alt="Dokument Rückseite"
                                             className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                             onClick={() => setImagePreview(selectedRequest.document_back_url)}
                                             onError={(e) => {
                                               e.currentTarget.src = '/placeholder.svg';
                                               e.currentTarget.alt = 'Bild konnte nicht geladen werden';
                                             }}
                                           />
                                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                             <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                           </div>
                                         </div>
                                         <Button 
                                           variant="outline" 
                                           size="sm" 
                                           className="w-full"
                                           onClick={() => downloadDocument(selectedRequest.document_back_url, 'dokument-rueckseite.jpg')}
                                         >
                                           <Download className="h-4 w-4 mr-2" />
                                           Herunterladen
                                         </Button>
                                      </div>
                                    )}

                                    {selectedRequest?.selfie_url && (
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Selfie mit Dokument</h4>
                                         <div className="relative group">
                                           <img 
                                             src={selectedRequest.selfie_url} 
                                             alt="Selfie mit Dokument"
                                             className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                             onClick={() => setImagePreview(selectedRequest.selfie_url)}
                                             onError={(e) => {
                                               e.currentTarget.src = '/placeholder.svg';
                                               e.currentTarget.alt = 'Bild konnte nicht geladen werden';
                                             }}
                                           />
                                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                             <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                           </div>
                                         </div>
                                         <Button 
                                           variant="outline" 
                                           size="sm" 
                                           className="w-full"
                                           onClick={() => downloadDocument(selectedRequest.selfie_url, 'selfie-dokument.jpg')}
                                         >
                                           <Download className="h-4 w-4 mr-2" />
                                           Herunterladen
                                         </Button>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Verification Guidelines */}
                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  <strong>Prüfrichtlinien:</strong> Stellen Sie sicher, dass alle Dokumente klar lesbar sind, 
                                  die Person auf dem Selfie mit dem Dokument übereinstimmt und alle persönlichen Daten 
                                  konsistent sind. Bei Zweifeln lehnen Sie die Verifizierung ab und geben Sie spezifische Gründe an.
                                </AlertDescription>
                              </Alert>

                              {/* Admin Notes for Rejection */}
                              {selectedRequest?.status === 'pending' && (
                                <div className="space-y-4">
                                  <div className="border-t pt-4">
                                    <h4 className="font-medium mb-2">Ablehnungsgrund (nur bei Ablehnung ausfüllen):</h4>
                                    <Textarea
                                      placeholder="Spezifischer Grund für die Ablehnung der Verifizierung (z.B. unklare Bilder, fehlende Dokumente, Unstimmigkeiten...)..."
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                      rows={4}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Previous Admin Notes */}
                              {selectedRequest?.admin_notes && (
                                <Alert>
                                  <FileText className="h-4 w-4" />
                                  <AlertDescription>
                                    <strong>Admin-Notizen:</strong> {selectedRequest.admin_notes}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>

                            {selectedRequest?.status === 'pending' && (
                              <DialogFooter className="gap-2">
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleReject(selectedRequest?.id)}
                                  disabled={processing}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  {processing ? 'Bearbeitung...' : 'Ablehnen'}
                                </Button>
                                <Button 
                                  variant="default"
                                  onClick={() => handleApprove(selectedRequest?.id)}
                                  disabled={processing}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  {processing ? 'Bearbeitung...' : 'Genehmigen'}
                                </Button>
                              </DialogFooter>
                            )}
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

      {/* Image Preview Modal */}
      {imagePreview && (
        <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Dokument-Vorschau</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={imagePreview} 
                alt="Dokument Vorschau"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}