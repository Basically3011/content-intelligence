import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract image URL from content item
 * Images are stored in ann_raw.image as paths like: /sites/default/files/...
 * Full URL: https://www.monotype.com + path
 */
export function getContentImageUrl(item: any): string | null {
  try {
    // Check if ann_raw exists and has image
    if (item.ann_raw && typeof item.ann_raw === 'object' && item.ann_raw.image) {
      const imagePath = item.ann_raw.image

      // If it's already a full URL, return it
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }

      // Otherwise, prepend the base URL
      return `https://www.monotype.com${imagePath}`
    }

    // Check responsive_images as fallback
    if (item.ann_raw?.responsive_images?.[0]) {
      const responsive = item.ann_raw.responsive_images[0]

      // Try different sizes in order of preference for thumbnails
      const preferredSizes = [
        'desktopTertiary',  // 276x328
        'desktopSecondary', // 472x314
        'mobilePrimary',    // 624x360
      ]

      for (const size of preferredSizes) {
        if (responsive[size]?.url) {
          const url = responsive[size].url
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
          }
          return `https://www.monotype.com${url}`
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error extracting image URL:', error)
    return null
  }
}
