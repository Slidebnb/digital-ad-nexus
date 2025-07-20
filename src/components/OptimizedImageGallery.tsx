
import { useState, useCallback } from "react";
import { LazyImage } from "@/components/ui/lazy-image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  X,
  Share,
  Download,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Image {
  src: string;
  alt: string;
  thumbnail?: string;
  blurDataURL?: string;
}

interface OptimizedImageGalleryProps {
  images: Image[];
  className?: string;
  maxHeight?: string;
  enableFullscreen?: boolean;
  enableZoom?: boolean;
  enableShare?: boolean;
}

export function OptimizedImageGallery({
  images,
  className,
  maxHeight = "400px",
  enableFullscreen = true,
  enableZoom = true,
  enableShare = false
}: OptimizedImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const openFullscreen = useCallback((index: number) => {
    if (!enableFullscreen) return;
    setSelectedImage(index);
    setZoomLevel(1);
  }, [enableFullscreen]);

  const closeFullscreen = useCallback(() => {
    setSelectedImage(null);
    setZoomLevel(1);
  }, []);

  const goToPrevious = useCallback(() => {
    if (selectedImage === null) return;
    setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    setZoomLevel(1);
  }, [selectedImage, images.length]);

  const goToNext = useCallback(() => {
    if (selectedImage === null) return;
    setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
    setZoomLevel(1);
  }, [selectedImage, images.length]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  }, []);

  const handleShare = useCallback(async () => {
    if (!enableShare || selectedImage === null) return;
    
    const image = images[selectedImage];
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.alt,
          url: image.src
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(image.src);
    }
  }, [enableShare, selectedImage, images]);

  const handleDownload = useCallback(() => {
    if (selectedImage === null) return;
    
    const image = images[selectedImage];
    const link = document.createElement('a');
    link.href = image.src;
    link.download = image.alt || `image-${selectedImage + 1}`;
    link.click();
  }, [selectedImage, images]);

  // Touch Handling für Swipe-Gesten
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;

    // Horizontal swipe detection
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStart(null);
  }, [touchStart, goToNext, goToPrevious]);

  if (images.length === 0) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-lg", className)}
           style={{ height: maxHeight }}>
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-2">📷</div>
          <p>Keine Bilder verfügbar</p>
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={cn("relative", className)}>
        <LazyImage
          src={images[0].src}
          alt={images[0].alt}
          blurDataURL={images[0].blurDataURL}
          className="w-full rounded-lg cursor-pointer"
          style={{ maxHeight }}
          onClick={() => openFullscreen(0)}
          priority
        />
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className={cn("grid gap-2", className)}>
        {/* Main Image */}
        <div className="relative">
          <LazyImage
            src={images[0].src}
            alt={images[0].alt}
            blurDataURL={images[0].blurDataURL}
            className="w-full rounded-lg cursor-pointer"
            style={{ maxHeight }}
            onClick={() => openFullscreen(0)}
            priority
          />
          
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              1 / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(1, 5).map((image, index) => (
              <div key={index + 1} className="relative">
                <LazyImage
                  src={image.thumbnail || image.src}
                  alt={image.alt}
                  blurDataURL={image.blurDataURL}
                  className="aspect-square rounded cursor-pointer"
                  onClick={() => openFullscreen(index + 1)}
                />
                
                {/* Overlay for additional images */}
                {index === 3 && images.length > 5 && (
                  <div 
                    className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-semibold rounded cursor-pointer"
                    onClick={() => openFullscreen(4)}
                  >
                    +{images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {enableFullscreen && selectedImage !== null && (
        <Dialog open={true} onOpenChange={closeFullscreen}>
          <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
            <div className="relative w-full h-full bg-black">
              {/* Image */}
              <div 
                className="flex items-center justify-center w-full h-full overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={images[selectedImage].src}
                  alt={images[selectedImage].alt}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>

              {/* Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                {enableZoom && (
                  <>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="bg-black/50 text-white border-white/20"
                      onClick={handleZoomIn}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="bg-black/50 text-white border-white/20"
                      onClick={handleZoomOut}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {enableShare && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="bg-black/50 text-white border-white/20"
                    onClick={handleShare}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-black/50 text-white border-white/20"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-black/50 text-white border-white/20"
                  onClick={closeFullscreen}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white border-white/20"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white border-white/20"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded">
                {selectedImage + 1} / {images.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
