import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize image URL for display
 * Handles both relative paths and absolute URLs
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return '/placeholder-profile.svg';
  
  // If it's already a full URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path starting with /, return as is (for local files)
  if (url.startsWith('/')) {
    return url;
  }
  
  // Otherwise, treat as relative path and add leading slash
  return `/${url}`;
}
