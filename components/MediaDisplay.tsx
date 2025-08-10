'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface MediaDisplayProps {
  src: string;
  alt: string;
  layout?: "fill" | "responsive" | "intrinsic" | "fixed";
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

export function isVideoSource(src: string): boolean {
  // Check data URL
  if (src.startsWith('data:')) {
    return src.includes('data:video/');
  }
  // Check file extension
  const extension = src.split('.').pop()?.toLowerCase();
  return ['mp4', 'webm', 'ogg', 'mov'].includes(extension || '');
}

export default function MediaDisplay({
  src,
  alt,
  layout = "fill",
  objectFit = "cover",
  className = "",
  priority = false,
  sizes,
  width,
  height
}: MediaDisplayProps) {
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  
  useEffect(() => {
    // Reset state when source changes
    setImageError(false);
    
    // Try to guess media type from the URL
    const maybeVideo = isVideoSource(src);
    setIsVideo(maybeVideo);
  }, [src]);

  // Return loading state while determining media type
  if (isVideo === null) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700" style={width && height ? {width, height} : {width: '100%', height: '100%'}}></div>;
  }

  // Return video element for video sources
  if (isVideo || imageError) {
    return (
      <div className={`relative ${className}`} style={width && height ? {width, height} : {width: '100%', height: '100%'}}>      
        <video 
          src={src}
          controls
          className='object-contain w-full h-full'
          playsInline
          muted
          preload="metadata"
          onError={() => console.error("Video failed to load:", src)}
          controlsList="nodownload"
          webkit-playsinline="true"
        >
          {alt && <track kind="captions" label={alt} />}
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Return Image component for image sources
  return (
    <Image
      src={src}
      alt={alt}
      fill={layout === "fill"}
      className={className}
      priority={priority}
      sizes={sizes}
      width={width}
      height={height}
      style={layout === "fill" ? {objectFit} : undefined}
      onError={() => {
        console.log('Image failed to load, trying as video:', src);
        setImageError(true);
      }}
    />
  );
}
