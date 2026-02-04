/**
 * Video URL validation and processing utilities
 */

// Supported video platforms
export type VideoPlatform = 'youtube' | 'tiktok' | 'instagram' | 'unknown';

// Video URL patterns
const VIDEO_URL_PATTERNS = {
  youtube: [
    /(?:youtube\.com\/shorts\/)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
  ],
  tiktok: [
    /(?:tiktok\.com\/@[\w.-]+\/video\/)([\d]+)/,
    /(?:tiktok\.com\/v\/)([\d]+)/,
    /(?:vm\.tiktok\.com\/)([\w]+)/,
  ],
  instagram: [
    /(?:instagram\.com\/reel\/)([\w-]+)/,
    /(?:instagram\.com\/p\/)([\w-]+)/,
  ],
};

/**
 * Detect the platform from a video URL
 */
export function detectVideoPlatform(url: string): VideoPlatform {
  const normalizedUrl = url.toLowerCase().trim();
  
  if (VIDEO_URL_PATTERNS.youtube.some(pattern => pattern.test(normalizedUrl))) {
    return 'youtube';
  }
  
  if (VIDEO_URL_PATTERNS.tiktok.some(pattern => pattern.test(normalizedUrl))) {
    return 'tiktok';
  }
  
  if (VIDEO_URL_PATTERNS.instagram.some(pattern => pattern.test(normalizedUrl))) {
    return 'instagram';
  }
  
  return 'unknown';
}

/**
 * Validate if a URL is a supported video URL
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url || url.trim().length === 0) return false;
  
  const platform = detectVideoPlatform(url);
  return platform !== 'unknown';
}

/**
 * Extract video ID from URL
 */
export function extractVideoId(url: string): string | null {
  const platform = detectVideoPlatform(url);
  
  if (platform === 'unknown') return null;
  
  const patterns = VIDEO_URL_PATTERNS[platform];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Get a friendly platform name
 */
export function getPlatformDisplayName(platform: VideoPlatform): string {
  const names: Record<VideoPlatform, string> = {
    youtube: 'YouTube',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    unknown: 'Unknown',
  };
  
  return names[platform];
}

/**
 * Validate video file
 */
export function isValidVideoFile(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload MP4, MOV, or WebM files.',
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 100MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
    };
  }
  
  return { valid: true };
}
