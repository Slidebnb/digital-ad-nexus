import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Camera,
  X,
  Info,
  Loader2
} from 'lucide-react';

interface VerificationData {
  document_type: string;
  full_name: string;
  document_front_file: File | null;
  document_back_file: File | null;
  selfie_file: File | null;
}

interface VerificationUploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VerificationUploadForm({ onSuccess, onCancel }: VerificationUploadFormProps) {
  const { user } = useAuth();
  const { profile, createVerificationRequest } = useProfile();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<VerificationData>({
    document_type: '',
    full_name: profile?.full_name || '',
    document_front_file: null,
    document_back_file: null,
    selfie_file: null
  });

  const [previewUrls, setPreviewUrls] = useState({
    document_front: '',
    document_back: '',
    selfie: ''
  });

  const updateFormData = useCallback((field: keyof VerificationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileSelect = useCallback((field: 'document_front_file' | 'document_back_file' | 'selfie_file', file: File | null) => {
    if (file && file.size > 10 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Die Datei darf maximal 10MB groß sein.",
        variant: "destructive"
      });
      return;
    }

    updateFormData(field, file);
    
    // Create preview URL
    const previewField = field.replace('_file', '') as keyof typeof previewUrls;
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [previewField]: url }));
    } else {
      setPreviewUrls(prev => ({ ...prev, [previewField]: '' }));
    }
  }, [updateFormData, toast]);

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('verification-documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.document_type || !formData.full_name || !formData.document_front_file) {
      toast({
        title: "Unvollständige Daten",
        description: "Bitte füllen Sie alle Pflichtfelder aus und laden Sie mindestens die Vorderseite Ihres Ausweises hoch.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const uploadPromises: Promise<string>[] = [];
      const fileInfo: { [key: string]: string } = {};

      // Upload document front (required)
      if (formData.document_front_file) {
        const frontPath = `${user.id}/document_front_${timestamp}.${formData.document_front_file.name.split('.').pop()}`;
        uploadPromises.push(
          uploadFile(formData.document_front_file, frontPath).then(url => {
            fileInfo.document_front_url = url;
            return url;
          })
        );
      }

      // Upload document back (optional)
      if (formData.document_back_file) {
        const backPath = `${user.id}/document_back_${timestamp}.${formData.document_back_file.name.split('.').pop()}`;
        uploadPromises.push(
          uploadFile(formData.document_back_file, backPath).then(url => {
            fileInfo.document_back_url = url;
            return url;
          })
        );
      }

      // Upload selfie (optional)
      if (formData.selfie_file) {
        const selfiePath = `${user.id}/selfie_${timestamp}.${formData.selfie_file.name.split('.').pop()}`;
        uploadPromises.push(
          uploadFile(formData.selfie_file, selfiePath).then(url => {
            fileInfo.selfie_url = url;
            return url;
          })
        );
      }

      setUploadProgress(30);

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      setUploadProgress(70);

      // Create verification request
      const { error } = await createVerificationRequest({
        document_type: formData.document_type,
        full_name: formData.full_name,
        document_front_url: fileInfo.document_front_url,
        document_back_url: fileInfo.document_back_url || '',
        selfie_url: fileInfo.selfie_url || ''
      });

      setUploadProgress(100);

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Antrag erfolgreich eingereicht",
        description: "Ihre Verifizierungsunterlagen wurden hochgeladen und werden binnen 24-48 Stunden geprüft."
      });

      onSuccess?.();

    } catch (error: any) {
      console.error('Verification submission error:', error);
      toast({
        title: "❌ Fehler beim Hochladen",
        description: error.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const FileUploadField = ({ 
    label, 
    file, 
    previewUrl, 
    onFileChange, 
    required = false,
    icon: Icon 
  }: {
    label: string;
    file: File | null;
    previewUrl: string;
    onFileChange: (file: File | null) => void;
    required?: boolean;
    icon: any;
  }) => (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <div className="space-y-2">
        <div 
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${file ? 'border-success bg-success/10' : 'border-border hover:border-primary/50'}`}
          onClick={() => document.getElementById(`file-${label.replace(/\s+/g, '-')}`)?.click()}
        >
          {file ? (
            <div className="space-y-2">
              <CheckCircle className="h-6 w-6 mx-auto text-success" />
              <p className="text-sm font-medium text-success">✅ Datei ausgewählt</p>
              <p className="text-xs font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Datei auswählen oder hierher ziehen</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP bis zu 10MB</p>
            </div>
          )}
        </div>

        <input
          id={`file-${label.replace(/\s+/g, '-')}`}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            onFileChange(selectedFile);
          }}
        />

        {file && (
          <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
            <div className="flex items-center gap-3">
              {previewUrl && (
                <img 
                  src={previewUrl} 
                  alt="Vorschau" 
                  className="w-16 h-16 object-cover rounded-lg border border-success/30"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-success truncate">
                  📎 {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Größe: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-success">
                  ✓ Bereit zum Upload
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileChange(null);
                }}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            1
          </div>
          <span className="text-sm font-medium">Grunddaten</span>
        </div>
        
        <div className="flex-1 h-px bg-border mx-4" />
        
        <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            2
          </div>
          <span className="text-sm font-medium">Dokumente</span>
        </div>
      </div>

      {/* Step 1: Basic Data */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Schritt 1: Grunddaten eingeben
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Ihre Daten werden automatisch mit Ihrem Profil synchronisiert, 
                um Doppeleingaben zu vermeiden.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="full_name">Vollständiger Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => updateFormData('full_name', e.target.value)}
                placeholder="Max Mustermann"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Muss exakt mit Ihrem Ausweisdokument übereinstimmen
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_type">Ausweistyp *</Label>
              <Select 
                value={formData.document_type} 
                onValueChange={(value) => updateFormData('document_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie Ihren Ausweistyp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id_card">Personalausweis</SelectItem>
                  <SelectItem value="passport">Reisepass</SelectItem>
                  <SelectItem value="drivers_license">Führerschein</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!formData.full_name || !formData.document_type}
                className="flex-1"
              >
                Weiter zu Schritt 2
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Document Upload */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Schritt 2: Dokumente hochladen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Wichtige Hinweise:</strong>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  <li>Dokumente müssen klar lesbar und vollständig sichtbar sein</li>
                  <li>Alle vier Ecken des Dokuments müssen erkennbar sein</li>
                  <li>Keine Reflexionen oder Schatten auf dem Dokument</li>
                  <li>Dateien werden verschlüsselt und sicher gespeichert</li>
                </ul>
              </AlertDescription>
            </Alert>

            <FileUploadField
              label="Ausweis Vorderseite"
              file={formData.document_front_file}
              previewUrl={previewUrls.document_front}
              onFileChange={(file) => handleFileSelect('document_front_file', file)}
              required={true}
              icon={FileText}
            />

            <FileUploadField
              label="Ausweis Rückseite"
              file={formData.document_back_file}
              previewUrl={previewUrls.document_back}
              onFileChange={(file) => handleFileSelect('document_back_file', file)}
              icon={FileText}
            />

            <FileUploadField
              label="Selfie mit Ausweis"
              file={formData.selfie_file}
              previewUrl={previewUrls.selfie}
              onFileChange={(file) => handleFileSelect('selfie_file', file)}
              icon={Camera}
            />

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={loading}
                className="flex-1"
              >
                Zurück
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.document_front_file}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Wird hochgeladen...
                  </>
                ) : (
                  'Verifizierung einreichen'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}