'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  unoptimized?: boolean;
  sizes?: string;
  placeholder?: string;
}

export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority,
  unoptimized,
  sizes,
  placeholder = '/placeholder-profile.svg',
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Update imgSrc when src prop changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && imgSrc !== placeholder) {
      setHasError(true);
      setImgSrc(placeholder);
    }
  };

  const imageProps = {
    src: imgSrc,
    alt,
    className,
    priority,
    unoptimized,
    sizes,
    onError: handleError,
  };

  if (fill) {
    return <Image {...imageProps} fill />;
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 400}
    />
  );
}

