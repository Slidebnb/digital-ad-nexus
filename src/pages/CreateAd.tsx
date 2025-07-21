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
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Check if we're editing an existing ad - sichere URL-Parameter-Extraktion
  const getEditAdId = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('edit');
    } catch (error) {
      console.warn('Error parsing URL parameters:', error);
      return null;
    }
  };
  
  const editAdId = getEditAdId();
  const isEditing = !!editAdId;
  
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

  // Load categories and existing ad data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true });
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // If editing, fetch existing ad data
        if (isEditing && editAdId && user) {
          const { data: adData, error: adError } = await supabase
            .from('ads')
            .select('*')
            .eq('id', editAdId)
            .eq('user_id', user.id)
            .single();

          if (adError) {
            toast({
              title: "Fehler",
              description: "Anzeige konnte nicht geladen werden",
              variant: "destructive"
            });
            navigate('/dashboard?tab=ads');
            return;
          }

          if (adData) {
            setFormData({
              title: adData.title || '',
              description: adData.description || '',
              price: adData.price?.toString() || '',
              currency: adData.currency || 'BTC',
              category_id: adData.category_id || '',
              location: adData.location || '',
              condition: adData.condition || 'neu',
              accepted_coins: adData.accepted_coins || [],
              tags: adData.tags?.join(', ') || ''
            });
            
            // Load existing images
            if (adData.images && adData.images.length > 0) {
              setExistingImages(adData.images);
            }
          }
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Fehler",
          description: "Daten konnten nicht geladen werden",
          variant: "destructive"
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, [toast, isEditing, editAdId, user, navigate]);

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

    // Check verification status
    if (!userProfile?.verified || !['id', 'full'].includes(userProfile.verification_level || 'none')) {
      toast({
        title: "Verifizierung erforderlich",
        description: "Um Anzeigen zu erstellen, müssen Sie Ihr Konto verifizieren.",
        variant: "destructive",
        action: <Button onClick={() => navigate('/dashboard?tab=verification')} variant="outline" size="sm">Jetzt verifizieren</Button>
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
      if (isEditing && editAdId) {
        // Update existing ad
        const { error: adError } = await supabase
          .from('ads')
          .update({
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            currency: formData.currency,
            category_id: formData.category_id,
            location: formData.location,
            condition: formData.condition,
            accepted_coins: formData.accepted_coins,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            updated_at: new Date().toISOString()
          })
          .eq('id', editAdId)
          .eq('user_id', user.id);

        if (adError) {
          console.error('Ad update error:', adError);
          throw adError;
        }

        // Upload new images if any
        if (images.length > 0) {
          const imageUrls = await uploadImages(editAdId);
          
          // Combine existing and new images
          const allImages = [...existingImages, ...imageUrls];
          
          // Update ad with combined image URLs
          await supabase
            .from('ads')
            .update({ images: allImages })
            .eq('id', editAdId);
        }

        toast({
          title: "Anzeige aktualisiert",
          description: "Ihre Anzeige wurde erfolgreich aktualisiert"
        });

        navigate('/dashboard?tab=ads');
      } else {
        // Create new ad
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
      }
    } catch (error) {
      console.error('Error handling ad:', error);
      toast({
        title: "Fehler",
        description: isEditing ? "Anzeige konnte nicht aktualisiert werden" : "Anzeige konnte nicht erstellt werden",
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
              <h1 className="text-3xl font-bold">
                {isEditing ? 'Anzeige bearbeiten' : 'Krypto-Anzeige erstellen'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {isEditing 
                ? 'Bearbeiten Sie Ihre Anzeige und aktualisieren Sie die Details'
                : 'Handeln Sie sicher mit Kryptowährungen - erstellen Sie Ihre Anzeige und erreichen Sie tausende von Händlern'
              }
            </p>
          </div>

          {/* Verification Required Banner */}
          {(!userProfile?.verified || !['id', 'full'].includes(userProfile?.verification_level || 'none')) && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Verifizierung erforderlich
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Um Anzeigen zu erstellen, müssen Sie Ihr Konto verifizieren. 
                      <button 
                        onClick={() => navigate('/dashboard?tab=verification')}
                        className="font-medium underline hover:text-yellow-600 ml-1"
                      >
                        Jetzt verifizieren
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Vorhandene Bilder:</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {existingImages.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images */}
                  {images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Neue Bilder:</h4>
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
                    {isEditing ? 'Wird aktualisiert...' : 'Wird erstellt...'}
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    {isEditing ? 'Anzeige aktualisieren' : 'Krypto-Anzeige veröffentlichen'}
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