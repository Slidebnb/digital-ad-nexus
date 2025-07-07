import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Flag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReportUserModalProps {
  reportedUserId: string;
  reportedUserName: string;
  adId?: string;
  adTitle?: string;
}

const reportReasons = [
  "Spam oder irreführende Anzeige",
  "Betrug oder verdächtige Aktivität", 
  "Unangemessenes Verhalten",
  "Falsche Produktinformationen",
  "Verstößt gegen Nutzungsbedingungen",
  "Sonstiges"
];

export function ReportUserModal({ 
  reportedUserId, 
  reportedUserName, 
  adId, 
  adTitle 
}: ReportUserModalProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmitReport = async () => {
    if (!user || !reason) return;

    setSubmitting(true);
    try {
      const reportData: any = {
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reason: reason,
        description: description || null,
        status: 'pending'
      };

      if (adId) {
        reportData.reported_ad_id = adId;
      }

      const { error } = await supabase
        .from('reports')
        .insert(reportData);

      if (error) throw error;

      toast({
        title: "Meldung eingereicht",
        description: "Vielen Dank für Ihre Meldung. Wir werden den Fall prüfen."
      });

      setReason("");
      setDescription("");
      setOpen(false);

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Fehler bei der Meldung",
        description: "Die Meldung konnte nicht eingereicht werden.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Button variant="secondary" className="w-full" onClick={() => window.location.href = '/login'}>
        <Flag className="h-4 w-4 mr-2" />
        Anmelden um zu melden
      </Button>
    );
  }

  if (user.id === reportedUserId) {
    return null; // User kann sich nicht selbst melden
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          <Flag className="h-4 w-4 mr-2" />
          Verkäufer melden
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {reportedUserName} melden
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {adTitle && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Anzeige:</p>
              <p className="font-medium">{adTitle}</p>
            </div>
          )}
          
          <div>
            <Label htmlFor="reason">Grund der Meldung</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Grund auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reasonOption) => (
                  <SelectItem key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Zusätzliche Informationen (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreiben Sie das Problem..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Hinweis:</strong> Falsche Meldungen können zu Einschränkungen Ihres Accounts führen.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmitReport}
              disabled={!reason || submitting}
              variant="destructive"
              className="flex-1"
            >
              <Flag className="h-4 w-4 mr-2" />
              {submitting ? "Wird gemeldet..." : "Melden"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}