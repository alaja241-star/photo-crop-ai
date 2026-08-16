'use client';

import { useEffect, useState } from 'react';
import { fetchImageObjectUrl } from '@/lib/api';
import ImagePlaceholder from '@/components/ImagePlaceholder';

interface AnalysisImageProps {
  type: 'crop' | 'soil';
  imageUrl?: string;
  className?: string;
}

export default function AnalysisImage({ type, imageUrl, className = '' }: AnalysisImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;
    let revoked: string | null = null;
    let active = true;
    fetchImageObjectUrl(imageUrl)
      .then((url) => {
        if (active) {
          revoked = url;
          setObjectUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [imageUrl]);

  if (!imageUrl || failed || !objectUrl) {
    // No image, load failure, or still loading: show the placeholder box so
    // layout doesn't jump.
    return <ImagePlaceholder type={type} className={className} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={objectUrl}
      alt={type === 'crop' ? 'Analyzed crop image' : 'Analyzed soil sample'}
      className={`object-cover ${className}`}
    />
  );
}
