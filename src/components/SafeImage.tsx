'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src: string | undefined | null;
  fallback?: string;
};

export default function SafeImage({ src, fallback = '/images/cars/placeholder.png', alt, ...rest }: SafeImageProps) {
  const [current, setCurrent] = useState<string>(src || fallback);

  // If src changes externally (new car image), update
  React.useEffect(() => {
    setCurrent(src || fallback);
  }, [src, fallback]);

  return (
    <Image
      src={current}
      alt={typeof alt === 'string' ? alt : 'image'}
      onError={() => setCurrent(fallback)}
      {...rest}
    />
  );
}
