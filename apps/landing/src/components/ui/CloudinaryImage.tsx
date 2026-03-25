"use client";

import { CldImage, CldImageProps } from "next-cloudinary";
import Image from "next/image";

interface CloudinaryImageProps extends Omit<CldImageProps, "src"> {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
}

/**
 * CloudinaryImage Component
 * 
 * A specialized version of CldImage that provides:
 * 1. Automatic optimization (WebP/Avif)
 * 2. Responsive resizing based on viewport
 * 3. Lazy loading by default
 * 4. Progressive blur-up placeholders
 */
export function CloudinaryImage({ src, alt, width, height, sizes, ...props }: CloudinaryImageProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName || cloudName === "your_cloud_name_here") {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={props.className}
        loading="lazy"
      />
    );
  }

  return (
    <CldImage
      {...props}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      // Automates quality and format optimization
      quality="auto"
      format="auto"
      // Default placeholder while loading
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA6jnSjQAAAABJRU5ErkJggg=="
      // Accessibility & SEO
      loading="lazy"
      className={`transition-opacity duration-300 ${props.className || ""}`}
    />
  );
}
