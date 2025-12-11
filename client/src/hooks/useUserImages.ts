import { useState, useEffect } from 'react';

export interface UploadedImage {
  key: string;
  url: string;
  uploadedAt: Date;
}

export function useUserImages() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/images`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }

        const data = await response.json();
        const formattedImages = data.images.map((img: any) => ({
          key: img.key,
          url: img.url,
          uploadedAt: new Date(img.uploadedAt),
        }));

        setImages(formattedImages);
      } catch (err) {
        console.error('Error fetching user images:', err);
        setError(err instanceof Error ? err.message : 'Failed to load images');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  return { images, isLoading, error };
}
