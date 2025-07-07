import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { useToast } from "@/hooks/use-toast";

const POPULAR_COINS = [
  'BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'MATIC', 'LINK', 'UNI', 'LTC', 'XRP'
];

export function PriceAlertsManager() {
  const { alerts, loading, createAlert, deleteAlert, toggleAlert } = usePriceAlerts();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    coin: '',
    target_price: '',
    condition: 'above' as 'above' | 'below'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.coin || !formData.target_price) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive"
      });
      return;
    }

    const result = await createAlert({
      coin: formData.coin.toUpperCase(),
      target_price: parseFloat(formData.target_price),
      condition: formData.condition
    });

    if (!result.error) {
      setFormData({ coin: '', target_price: '', condition: 'above' });
      setShowForm(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preisalarme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preisalarme ({alerts.length})
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)} 
            size="sm"
            className="ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Alarm erstellen
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coin">Kryptowährung</Label>
                <Select 
                  value={formData.coin} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, coin: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Coin auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_COINS.map(coin => (
                      <SelectItem key={coin} value={coin}>{coin}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Zielpreis (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="z.B. 45000"
                  value={formData.target_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_price: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="condition">Bedingung</Label>
                <Select 
                  value={formData.condition} 
                  onValueChange={(value: 'above' | 'below') => setFormData(prev => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Über dem Preis</SelectItem>
                    <SelectItem value="below">Unter dem Preis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Alarm erstellen
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        )}

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Sie haben noch keine Preisalarme erstellt.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Erstellen Sie Alarme, um über Preisänderungen informiert zu werden.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {alert.condition === 'above' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">{alert.coin}</span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {alert.condition === 'above' ? 'über' : 'unter'} {Number(alert.target_price).toLocaleString('de-DE')}€
                  </div>
                  
                  <Badge variant={alert.is_active ? "default" : "secondary"}>
                    {alert.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                  
                  {alert.triggered_at && (
                    <Badge variant="outline">
                      Ausgelöst
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alert.is_active || false}
                    onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {alerts.some(alert => alert.triggered_at) && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Einige Ihrer Preisalarme wurden bereits ausgelöst. Sie können diese löschen oder neue erstellen.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}