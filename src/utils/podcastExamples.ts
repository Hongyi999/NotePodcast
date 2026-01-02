/**
 * Example podcast URLs for testing
 * These are publicly available RSS feeds that work with the application
 */

export const EXAMPLE_PODCAST_URLS = {
  // Xiaoyuzhoufm.com URLs (小宇宙)
  xiaoyuzhoufm: [
    'https://www.xiaoyuzhoufm.com/episode/6953815414db1df9ef81f6b4', // 岩中花述 example
  ],
  
  // Direct RSS Feeds
  rssFeeds: [
    'https://feeds.npr.org/510289/podcast.xml', // NPR Up First
    'https://rss.cnn.com/rss/edition.rss', // CNN
    'https://feeds.bbci.co.uk/programmes/b006qykl/rss.xml', // BBC Radio 4
  ],
  
  // Direct Audio Files (for testing audio playback)
  audioFiles: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Test audio file
  ],
  
  // Notes for Apple Podcasts
  applePodcastsNote: `
    Apple Podcasts URLs (like podcasts.apple.com) may not work due to CORS restrictions.
    To use an Apple Podcasts podcast:
    1. Find the podcast's official website
    2. Look for their RSS feed URL
    3. Use that RSS feed URL instead
    
    For "岩中花述" podcast:
    - This podcast is produced by GIADA and JustPod
    - Try searching for "GIADA 岩中花述 RSS" or visit JustPod's website
    - The RSS feed URL might be available on their official website
  `,
};

/**
 * Helper function to check if a URL is likely to work
 */
export function isLikelyWorkingUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  
  // Direct audio files usually work
  if (lowerUrl.match(/\.(mp3|m4a|wav|ogg|aac|flac)(\?|$)/)) {
    return true;
  }
  
  // RSS feeds from common podcast platforms usually work
  if (lowerUrl.includes('.rss') || lowerUrl.includes('.xml')) {
    // Apple Podcasts RSS feeds may have CORS issues
    if (lowerUrl.includes('podcasts.apple.com')) {
      return false;
    }
    return true;
  }
  
  // Apple Podcasts page URLs won't work directly
  if (lowerUrl.includes('podcasts.apple.com')) {
    return false;
  }
  
  return true;
}

