/**
 * Validates if a string is a valid URL with http or https protocol
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks if a URL is likely a direct audio file
 */
export function isDirectAudioUrl(url: string): boolean {
  const audioExtensions = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac'];
  const lowerUrl = url.toLowerCase();
  return audioExtensions.some(ext => lowerUrl.includes(ext));
}

/**
 * Checks if a URL is likely an RSS feed
 */
export function isRssFeed(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('rss') || 
         lowerUrl.includes('feed') || 
         lowerUrl.endsWith('.xml') ||
         lowerUrl.includes('podcast');
}

