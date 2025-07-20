import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Euro,
  Bitcoin,
  Wallet,
  ArrowLeftRight,
  FileText,
  MessageCircle,
  Star,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EscrowTransaction {
  id: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency: string;
  status: "pending" | "escrowed" | "released" | "disputed" | "refunded";
  created_at: string;
  expires_at: string;
  escrow_fee: number;
  ad_title: string;
  buyer_name: string;
  seller_name: string;
  chat_id?: string;
}

interface PaymentMethod {
  id: string;
  type: "bank_transfer" | "crypto" | "paypal";
  name: string;
  details: any;
  is_verified: boolean;
}

export function PaymentEscrowSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<EscrowTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load transactions
      const { data: transactionsData } = await supabase
        .from("trades")
        .select("*")
        .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });

      if (transactionsData) {
        const formattedTransactions: EscrowTransaction[] = transactionsData.map(t => ({
          id: t.id,
          ad_id: t.ad_id,
          buyer_id: t.buyer_id,
          seller_id: t.seller_id,
          amount: t.amount,
          currency: t.currency,
          status: mapTradeStatusToEscrow(t.status),
          created_at: t.created_at,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          escrow_fee: t.amount * 0.015, // 1.5% fee
          ad_title: "Crypto Trade",
          buyer_name: "Käufer",
          seller_name: "Verkäufer"
        }));
        setTransactions(formattedTransactions);
      }

      // Load payment methods
      const { data: paymentMethodsData } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user!.id);

      if (paymentMethodsData) {
        const formattedMethods: PaymentMethod[] = paymentMethodsData.map(pm => ({
          id: pm.id,
          type: pm.method_type as "bank_transfer" | "crypto" | "paypal",
          name: pm.method_type === "crypto" ? "Crypto Wallet" : "Bank Transfer",
          details: pm.details,
          is_verified: pm.is_verified
        }));
        setPaymentMethods(formattedMethods);
      }

    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const mapTradeStatusToEscrow = (status: string): EscrowTransaction["status"] => {
    switch (status) {
      case "pending": return "pending";
      case "active": return "escrowed";
      case "completed": return "released";
      case "cancelled": return "refunded";
      case "disputed": return "disputed";
      default: return "pending";
    }
  };

  const getStatusIcon = (status: EscrowTransaction["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "escrowed":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "released":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "disputed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "refunded":
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: EscrowTransaction["status"]) => {
    switch (status) {
      case "pending": return "Wartend";
      case "escrowed": return "Treuhand";
      case "released": return "Freigegeben";
      case "disputed": return "Streitfall";
      case "refunded": return "Erstattet";
      default: return "Unbekannt";
    }
  };

  const getStatusColor = (status: EscrowTransaction["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "escrowed": return "bg-blue-500";
      case "released": return "bg-green-500";
      case "disputed": return "bg-red-500";
      case "refunded": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getProgressPercentage = (status: EscrowTransaction["status"]) => {
    switch (status) {
      case "pending": return 25;
      case "escrowed": return 50;
      case "released": return 100;
      case "disputed": return 75;
      case "refunded": return 100;
      default: return 0;
    }
  };

  const handleReleaseEscrow = async (transaction: EscrowTransaction) => {
    try {
      const { error } = await supabase
        .from("trades")
        .update({ status: "completed" })
        .eq("id", transaction.id);

      if (error) throw error;

      toast({
        title: "Zahlung freigegeben",
        description: "Das Geld wurde erfolgreich an den Verkäufer übertragen.",
      });

      loadUserData();
    } catch (error) {
      console.error("Error releasing escrow:", error);
      toast({
        title: "Fehler",
        description: "Freigabe fehlgeschlagen.",
        variant: "destructive"
      });
    }
  };

  const handleDisputeTransaction = async (transaction: EscrowTransaction) => {
    try {
      const { error } = await supabase
        .from("trades")
        .update({ status: "disputed" })
        .eq("id", transaction.id);

      if (error) throw error;

      toast({
        title: "Streitfall eröffnet",
        description: "Ein Administrator wird sich um Ihren Fall kümmern.",
      });

      loadUserData();
    } catch (error) {
      console.error("Error disputing transaction:", error);
      toast({
        title: "Fehler",
        description: "Streitfall konnte nicht eröffnet werden.",
        variant: "destructive"
      });
    }
  };

  const TransactionCard = ({ transaction }: { transaction: EscrowTransaction }) => {
    const isUserBuyer = transaction.buyer_id === user?.id;
    const canRelease = isUserBuyer && transaction.status === "escrowed";
    const canDispute = transaction.status === "escrowed";

    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedTransaction(transaction)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(transaction.status)}
              <h3 className="font-medium">{transaction.ad_title}</h3>
            </div>
            <Badge className={getStatusColor(transaction.status)}>
              {getStatusLabel(transaction.status)}
            </Badge>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Betrag:</span>
              <span className="font-medium">
                {transaction.amount.toFixed(2)} {transaction.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Treuhand-Gebühr:</span>
              <span>{transaction.escrow_fee.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span>{isUserBuyer ? "Verkäufer:" : "Käufer:"}</span>
              <span>{isUserBuyer ? transaction.seller_name : transaction.buyer_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Erstellt:</span>
              <span>{new Date(transaction.created_at).toLocaleDateString("de-DE")}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Fortschritt</span>
              <span>{getProgressPercentage(transaction.status)}%</span>
            </div>
            <Progress value={getProgressPercentage(transaction.status)} className="h-2" />
          </div>

          {(canRelease || canDispute) && (
            <div className="flex gap-2 mt-4">
              {canRelease && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReleaseEscrow(transaction);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Freigeben
                </Button>
              )}
              {canDispute && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisputeTransaction(transaction);
                  }}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Streitfall
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeTransactions = transactions.filter(t => 
    t.status === "pending" || t.status === "escrowed"
  );
  const completedTransactions = transactions.filter(t => 
    t.status === "released" || t.status === "refunded"
  );
  const disputedTransactions = transactions.filter(t => 
    t.status === "disputed"
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktive Transaktionen</p>
                <p className="text-2xl font-bold">{activeTransactions.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abgeschlossen</p>
                <p className="text-2xl font-bold">{completedTransactions.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Streitfälle</p>
                <p className="text-2xl font-bold">{disputedTransactions.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gesamtvolumen</p>
                <p className="text-2xl font-bold">
                  {transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}€
                </p>
              </div>
              <Euro className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escrow Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Treuhand-Service:</strong> Ihre Zahlungen sind durch unseren Escrow-Service geschützt. 
          Das Geld wird erst freigegeben, wenn beide Parteien zufrieden sind. Gebühr: 1,5% pro Transaktion.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Aktiv ({activeTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Abgeschlossen ({completedTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="disputed">
            Streitfälle ({disputedTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="methods">
            Zahlungsmethoden
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeTransactions.length > 0 ? (
              activeTransactions.map(transaction => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keine aktiven Transaktionen</h3>
                  <p className="text-muted-foreground">
                    Alle Ihre Transaktionen sind abgeschlossen oder es sind noch keine vorhanden.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedTransactions.map(transaction => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="disputed">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {disputedTransactions.length > 0 ? (
              disputedTransactions.map(transaction => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keine Streitfälle</h3>
                  <p className="text-muted-foreground">
                    Alle Ihre Transaktionen verliefen reibungslos.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="methods">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Zahlungsmethoden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.length > 0 ? (
                  paymentMethods.map(method => (
                    <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {method.type === "crypto" ? (
                          <Bitcoin className="h-5 w-5 text-orange-500" />
                        ) : (
                          <Wallet className="h-5 w-5 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.type === "bank_transfer" ? "Banküberweisung" :
                             method.type === "crypto" ? "Kryptowährung" : "PayPal"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={method.is_verified ? "default" : "secondary"}>
                        {method.is_verified ? "Verifiziert" : "Nicht verifiziert"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Keine Zahlungsmethoden hinzugefügt</p>
                  </div>
                )}
                
                <Button className="w-full" variant="outline">
                  <Wallet className="h-4 w-4 mr-2" />
                  Zahlungsmethode hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Escrow-Informationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Service-Gebühr:</span>
                    <span className="text-sm">1,5% pro Transaktion</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Schutz-Zeitraum:</span>
                    <span className="text-sm">7 Tage</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Automatische Freigabe:</span>
                    <span className="text-sm">Nach 7 Tagen</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Streitfall-Support:</span>
                    <span className="text-sm">24/7 verfügbar</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">So funktioniert es:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Käufer überweist Geld in Treuhand</li>
                    <li>2. Verkäufer wird über Zahlung informiert</li>
                    <li>3. Verkäufer liefert Ware/Dienstleistung</li>
                    <li>4. Käufer bestätigt Erhalt und gibt Zahlung frei</li>
                    <li>5. Geld wird an Verkäufer übertragen</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Modal would go here */}
      {selectedTransaction && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-background">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaktionsdetails</CardTitle>
              <Button variant="ghost" onClick={() => setSelectedTransaction(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Detailed transaction view would be implemented here */}
            <p>Detailansicht für Transaktion {selectedTransaction.id}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}