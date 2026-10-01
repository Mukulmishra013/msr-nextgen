/**
 * Cloudinary Media Delivery Pipeline
 *
 * Provides auto-format (f_auto) and auto-quality (q_auto) image optimization.
 * If NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured yet, or if a custom asset
 * has not yet been uploaded to Cloudinary, provides clean, high-speed fallback assets.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}

/**
 * Builds an optimized Cloudinary delivery URL
 * @param publicId Public ID or relative path of the asset in Cloudinary
 * @param options Optimization options
 * @param fallbackUrl Fallback URL if Cloudinary asset is not yet uploaded
 */
export function getCloudinaryUrl(
  publicId: string,
  options: CloudinaryOptions = {},
  fallbackUrl?: string
): string {
  // If publicId is already a full URL, return it
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId;
  }

  // If no cloud name is provided yet, or if the asset is an un-uploaded placeholder, use fallback
  if (
    !CLOUD_NAME ||
    publicId.startsWith('msr-hero-growth-bg') ||
    publicId.includes('placeholder') ||
    !publicId.trim()
  ) {
    return fallbackUrl || MEDIA_ASSETS.heroBgImage;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transformations: string[] = [`f_${format}`, `q_${quality}`];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop && (width || height)) transformations.push(`c_${crop}`);

  const transformString = transformations.join(',');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}/${publicId.replace(/^\//, '')}`;
}

/**
 * Generates an ultra-light SVG base64 blur placeholder
 * for next/image blur-up effect (ensures zero layout shift)
 */
export function getBlurPlaceholderSvg(color: string = '#0f6e56'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5"><rect width="8" height="5" fill="${color}" opacity="0.2"/></svg>`;
  if (typeof window === 'undefined') {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  return `data:image/svg+xml;base64,${window.btoa(svg)}`;
}

/**
 * Pre-configured hero background and brand visual assets
 */
export const MEDIA_ASSETS = {
  // High-conversion business ads/growth visual
  heroBgImage:
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop',
  // Placeholder avatar generator for brands
  getBrandAvatar: (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f6e56&color=ffffff&bold=true&size=128`,
};
