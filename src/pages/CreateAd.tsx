import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Upload, X, AlertCircle, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

const CRYPTO_OPTIONS = [
  'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'AVAX',
  'MATIC', 'LTC', 'LINK', 'UNI', 'ATOM', 'XLM', 'VET', 'ICP', 'FTT', 'NEAR',
  'ALGO', 'EGLD', 'HBAR', 'FLOW', 'XTZ', 'WAVES', 'KSM', 'DASH', 'ZEC', 'XMR'
];

const CRYPTO_CURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC', 'EUR', 'USD'];

type Category = Tables<'categories'>;

export default function CreateAd() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'BTC',
    category_id: '',
    location: '',
    condition: 'neu',
    accepted_coins: [] as string[],
    tags: ''
  });

  // Load categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true });
        
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Fehler",
          description: "Kategorien konnten nicht geladen werden",
          variant: "destructive"
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCoinToggle = (coin: string) => {
    setFormData(prev => ({
      ...prev,
      accepted_coins: prev.accepted_coins.includes(coin)
        ? prev.accepted_coins.filter(c => c !== coin)
        : [...prev.accepted_coins, coin]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast({
        title: "Zu viele Bilder",
        description: "Maximal 5 Bilder pro Anzeige erlaubt",
        variant: "destructive"
      });
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (adId: string) => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileName = `${adId}_${i}_${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('ad-images')
        .upload(fileName, file);
      
      if (error) {
        console.error('Image upload error:', error);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Kategorie",
        variant: "destructive"
      });
      return;
    }

    if (formData.accepted_coins.length === 0) {
      toast({
        title: "Fehler",
        description: "Wählen Sie mindestens eine akzeptierte Kryptowährung",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create ad with correct category_id
      const { data: ad, error: adError } = await supabase
        .from('ads')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          currency: formData.currency,
          category_id: formData.category_id,
          location: formData.location,
          condition: formData.condition,
          accepted_coins: formData.accepted_coins,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          user_id: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (adError) {
        console.error('Ad creation error:', adError);
        throw adError;
      }

      // Upload images if any
      if (images.length > 0 && ad) {
        const imageUrls = await uploadImages(ad.id);
        
        // Update ad with image URLs
        await supabase
          .from('ads')
          .update({ images: imageUrls })
          .eq('id', ad.id);
      }

      toast({
        title: "Krypto-Anzeige erstellt",
        description: "Ihre Anzeige wurde erfolgreich veröffentlicht und ist jetzt sichtbar"
      });

      navigate('/browse');
    } catch (error) {
      console.error('Error creating ad:', error);
      toast({
        title: "Fehler",
        description: "Anzeige konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sie müssen angemeldet sein, um eine Anzeige zu erstellen.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Coins className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Krypto-Anzeige erstellen</h1>
            </div>
            <p className="text-muted-foreground">
              Handeln Sie sicher mit Kryptowährungen - erstellen Sie Ihre Anzeige und erreichen Sie tausende von Händlern
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Anzeigendetails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Anzeigentitel *</Label>
                  <Input
                    id="title"
                    placeholder="z.B. Bitcoin verkaufen - beste Preise, schnelle Abwicklung"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Detaillierte Beschreibung *</Label>
                  <Textarea
                    id="description"
                    placeholder="Beschreiben Sie Ihr Krypto-Angebot: Zahlungsmethoden, Limits, Konditionen..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Preis *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.00000001"
                      placeholder="0.00000000"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Preiswährung *</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CRYPTO_CURRENCIES.map(currency => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Kategorie *</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => handleInputChange('category_id', value)}
                      disabled={loadingCategories}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCategories ? "Laden..." : "Kategorie wählen"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="condition">Zustand</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neu">Neu</SelectItem>
                        <SelectItem value="wie neu">Wie neu</SelectItem>
                        <SelectItem value="sehr gut">Sehr gut</SelectItem>
                        <SelectItem value="gut">Gut</SelectItem>
                        <SelectItem value="gebraucht">Gebraucht</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Standort (optional)</Label>
                  <Input
                    id="location"
                    placeholder="z.B. Berlin, Deutschland (für lokale Treffen)"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (kommagetrennt)</Label>
                  <Input
                    id="tags"
                    placeholder="z.B. P2P, SEPA, PayPal, schnell, sicher"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Akzeptierte Kryptowährungen *
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Wählen Sie die Kryptowährungen aus, die Sie akzeptieren oder anbieten möchten
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {CRYPTO_OPTIONS.map(coin => (
                    <div key={coin} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-accent/50">
                      <Checkbox
                        id={coin}
                        checked={formData.accepted_coins.includes(coin)}
                        onCheckedChange={() => handleCoinToggle(coin)}
                      />
                      <Label htmlFor={coin} className="text-sm font-medium cursor-pointer">
                        {coin}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.accepted_coins.length === 0 && (
                  <p className="text-sm text-destructive mt-2">
                    Wählen Sie mindestens eine Kryptowährung aus
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bilder hinzufügen (optional)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fügen Sie vertrauensbildende Bilder hinzu (Screenshots, Verifizierungen, etc.)
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="images" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Klicken zum Hochladen</span> oder Dateien hierher ziehen
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG oder GIF (MAX. 5 Bilder)</p>
                      </div>
                      <input
                        id="images"
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={loading || loadingCategories || !formData.category_id || formData.accepted_coins.length === 0}
                className="flex-1"
                variant="gradient"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Krypto-Anzeige veröffentlichen
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}