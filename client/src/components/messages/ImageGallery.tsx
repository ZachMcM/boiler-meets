import { useState } from 'react';
import { useUserImages } from '@/hooks/useUserImages';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

interface ImageGalleryProps {
  onSelectImage: (imageUrl: string) => void;
  onUploadClick: () => void;
}

export function ImageGallery({ onSelectImage, onUploadClick }: ImageGalleryProps) {
  const { images, isLoading, error } = useUserImages();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading images...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        Error loading images: {error}
      </div>
    );
  }

  return (
    <div className="w-96 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Previous Images</h3>
        <Button
          onClick={onUploadClick}
          size="sm"
          variant="outline"
          className="text-xs"
        >
          <Upload className="h-3 w-3 mr-1" />
          New
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <p>No images yet</p>
          <p className="text-xs mt-1">Upload an image to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
          {images.map((image, index) => (
            <button
              key={image.key}
              onClick={() => {
                onSelectImage(image.url);
                setSelectedIndex(index);
              }}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all hover:border-primary ${
                selectedIndex === index ? 'border-primary' : 'border-muted'
              }`}
            >
              <img
                src={image.url}
                alt="uploaded"
                className="w-full h-full object-cover hover:opacity-80 transition-opacity"
              />
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
