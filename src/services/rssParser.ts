import { PodcastData } from '../types';
import { parseShownotes } from '../utils/shownotesParser';

/**
 * Parses RSS feed XML to extract podcast data
 */
export async function parseRssFeed(rssUrl: string, episodeId?: string): Promise<PodcastData> {
  try {
    const response = await fetch(rssUrl, {
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid RSS feed format');
    }
    
    // Get channel info
    const channel = xmlDoc.querySelector('channel');
    const channelTitle = channel?.querySelector('title')?.textContent?.trim() || '';
    const channelDescription = channel?.querySelector('description')?.textContent?.trim() || '';
    
    // Get all items
    const items = xmlDoc.querySelectorAll('item');
    
    // If episodeId is provided, try to find that specific episode
    let targetItem: Element | null = null;
    
    if (episodeId && items.length > 0) {
      // Try to find episode by GUID or title matching
      for (const item of Array.from(items)) {
        const guid = item.querySelector('guid')?.textContent?.trim() || '';
        const title = item.querySelector('title')?.textContent?.trim() || '';
        if (guid.includes(episodeId) || title.includes(episodeId)) {
          targetItem = item;
          break;
        }
      }
    }
    
    // If no specific episode found, use the first item (latest episode)
    if (!targetItem && items.length > 0) {
      targetItem = items[0];
    }
    
    if (!targetItem) {
      throw new Error('No episodes found in RSS feed');
    }
    
    // Extract audio URL from enclosure or media:content
    let audioUrl = '';
    const enclosure = targetItem.querySelector('enclosure');
    if (enclosure) {
      audioUrl = enclosure.getAttribute('url') || '';
    } else {
      const mediaContent = targetItem.querySelector('media\\:content, content');
      if (mediaContent) {
        audioUrl = mediaContent.getAttribute('url') || '';
      }
    }
    
    // Extract episode title
    const episodeTitle = targetItem.querySelector('title')?.textContent?.trim() || channelTitle;
    
    // Extract episode description
    const episodeDescription = targetItem.querySelector('description')?.textContent?.trim() || channelDescription;
    
    // Extract shownotes (usually in description or content:encoded)
    let shownotes = episodeDescription;
    const contentEncoded = targetItem.querySelector('content\\:encoded, encoded');
    if (contentEncoded) {
      shownotes = contentEncoded.textContent?.trim() || shownotes;
    }
    
    if (!audioUrl) {
      throw new Error('No audio URL found in RSS feed');
    }
    
    // Parse shownotes to separate intro and summary notes
    const { intro, summaryNotes } = parseShownotes(shownotes);
    
    return {
      audioUrl,
      title: episodeTitle,
      description: episodeDescription,
      shownotes,
      intro,
      summaryNotes,
    };
  } catch (error) {
    if (error instanceof Error) {
      // Check for CORS errors
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        throw new Error('CORS error: Cannot fetch RSS feed directly. Please use a CORS proxy or the podcast\'s direct RSS feed URL.');
      }
      throw new Error(`Failed to parse RSS feed: ${error.message}`);
    }
    throw new Error('Failed to parse RSS feed: Unknown error');
  }
}

/**
 * Checks if URL is an Apple Podcasts URL
 */
function isApplePodcastsUrl(url: string): boolean {
  return url.includes('podcasts.apple.com');
}

/**
 * Checks if URL is a xiaoyuzhoufm.com (小宇宙) URL
 */
function isXiaoyuzhoufmUrl(url: string): boolean {
  return url.includes('xiaoyuzhoufm.com');
}

/**
 * Parses xiaoyuzhoufm.com (小宇宙) HTML page to extract audio URL and metadata
 */
async function parseXiaoyuzhoufmPage(url: string): Promise<PodcastData> {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch xiaoyuzhoufm page: ${response.status} ${response.statusText}`);
    }
    
    const htmlText = await response.text();
    
    let audioUrl = '';
    let title = '';
    let description = '';
    let shownotes = '';
    
    // Method 1: Look for JSON-LD structured data
    const jsonLdMatches = htmlText.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gs);
    for (const match of jsonLdMatches) {
      try {
        const jsonLd = JSON.parse(match[1]);
        if (jsonLd['@type'] === 'PodcastEpisode' || jsonLd['@type'] === 'Article') {
          if (jsonLd.associatedMedia?.contentUrl) {
            audioUrl = jsonLd.associatedMedia.contentUrl;
          }
          if (jsonLd.name || jsonLd.headline) {
            title = jsonLd.name || jsonLd.headline;
          }
          if (jsonLd.description) {
            description = jsonLd.description;
          }
        }
      } catch (e) {
        // Continue to next JSON-LD block
      }
    }
    
    // Method 2: Look for audio URL in script tags (xiaoyuzhoufm embeds data in scripts)
    if (!audioUrl) {
      const scriptMatches = htmlText.matchAll(/<script[^>]*>(.*?)<\/script>/gs);
      for (const scriptMatch of scriptMatches) {
        const scriptContent = scriptMatch[1];
        
        // Look for audio URLs in various patterns
        const urlPatterns = [
          /"audioUrl"\s*:\s*"([^"]+)"/i,
          /"url"\s*:\s*"([^"]+\.(mp3|m4a|mpeg|aac))"/i,
          /"src"\s*:\s*"([^"]+\.(mp3|m4a|mpeg|aac))"/i,
          /audio.*?url.*?["']([^"']+\.(mp3|m4a|mpeg|aac))["']/i,
          /"playUrl"\s*:\s*"([^"]+)"/i,
          /"mediaUrl"\s*:\s*"([^"]+)"/i,
        ];
        
        for (const pattern of urlPatterns) {
          const urlMatch = scriptContent.match(pattern);
          if (urlMatch && urlMatch[1] && urlMatch[1].startsWith('http')) {
            audioUrl = urlMatch[1];
            break;
          }
        }
        if (audioUrl) break;
      }
    }
    
    // Method 3: Look for audio elements
    if (!audioUrl) {
      const audioMatch = htmlText.match(/<audio[^>]+src=["']([^"']+)["']/i) ||
                        htmlText.match(/<source[^>]+src=["']([^"']+\.(mp3|m4a|wav|ogg|aac))["']/i);
      if (audioMatch) {
        audioUrl = audioMatch[1];
      }
    }
    
    // Extract title
    if (!title) {
      const titleMatch = htmlText.match(/<title[^>]*>(.*?)<\/title>/i) ||
                        htmlText.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                        htmlText.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (titleMatch) {
        title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      }
    }
    
    // Extract description
    if (!description) {
      const descMatch = htmlText.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                       htmlText.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      if (descMatch) {
        description = descMatch[1].trim();
      }
    }
    
    // Extract shownotes/description text
    shownotes = description;
    const contentMatches = htmlText.match(/<div[^>]*class=["'][^"']*description[^"']*["'][^>]*>(.*?)<\/div>/is) ||
                          htmlText.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>(.*?)<\/div>/is) ||
                          htmlText.match(/<article[^>]*>(.*?)<\/article>/is);
    if (contentMatches) {
      const contentText = contentMatches[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (contentText.length > (description.length || 0)) {
        shownotes = contentText;
      }
    }

    // NEW: Extract Comments and Transcript from Xiaoyuzhoufm INITIAL_STATE
    const comments: any[] = [];
    let transcriptItems: any[] = [];
    
    try {
      // Use a more robust match for INITIAL_STATE which can be very large
      const stateMatch = htmlText.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});\s*<\/script>/);
      if (stateMatch) {
        const state = JSON.parse(stateMatch[1]);
        
        // Extract comments from state
        // Xiaoyuzhou state structure can vary, try multiple paths
        const commentsData = state.episode?.comments || state.comments || state.comment?.comments || [];
        if (commentsData && Array.isArray(commentsData)) {
          commentsData.forEach((c: any) => {
            // Find time point in text if not explicitly provided
            let timePoint = Math.floor((c.time || 0) / 1000);
            if (timePoint === 0 && c.text) {
              const timeInText = c.text.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
              if (timeInText) {
                const parts = timeInText[1].split(':').map(Number);
                if (parts.length === 2) timePoint = parts[0] * 60 + parts[1];
                else if (parts.length === 3) timePoint = parts[0] * 3600 + parts[1] * 60 + parts[2];
              }
            }

            comments.push({
              id: c.id || Math.random().toString(36).substr(2, 9),
              author: c.author?.nickname || '听众',
              avatar: c.author?.avatar?.url || c.author?.avatar,
              content: c.text || '',
              timePoint: timePoint,
              createdAt: c.createdAt || Date.now(),
              likeCount: c.likeCount || 0
            });
          });
        }

        // Extract transcript if exists in state
        const transcriptData = state.episode?.transcript || state.transcript || [];
        if (transcriptData && Array.isArray(transcriptData) && transcriptData.length > 0) {
          transcriptItems = transcriptData.map((t: any) => ({
            timePoint: Math.floor((t.start || 0) / 1000),
            content: t.text || ''
          }));
        }
      }

      // Fallback: If no comments in state, try parsing common patterns in HTML
      if (comments.length === 0) {
        // Look for any JSON-like objects that look like comments
        const commentPattern = /\{"id":"([^"]+)","text":"([^"]+)","time":(\d+)/g;
        let commentMatch;
        while ((commentMatch = commentPattern.exec(htmlText)) !== null) {
          comments.push({
            id: commentMatch[1],
            content: commentMatch[2],
            timePoint: Math.floor(parseInt(commentMatch[3]) / 1000),
            createdAt: Date.now()
          });
        }
      }
    } catch (e) {
      console.error('Failed to extract data from Xiaoyuzhou state:', e);
    }

    if (!audioUrl) {
      throw new Error('Could not find audio URL in xiaoyuzhoufm page.');
    }
    
    // Parse shownotes to separate intro and summary notes
    const { intro, summaryNotes } = parseShownotes(shownotes);
    
    return {
      audioUrl,
      title: title || 'Xiaoyuzhoufm Episode',
      description,
      shownotes,
      intro,
      summaryNotes,
      comments: comments.length > 0 ? comments : undefined,
      transcript: transcriptItems.length > 0 ? transcriptItems : undefined,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        throw new Error(`Cannot access xiaoyuzhoufm page due to CORS restrictions. Please try using the podcast's direct RSS feed URL or audio file URL instead.`);
      }
      throw new Error(`Failed to parse xiaoyuzhoufm page: ${error.message}`);
    }
    throw new Error('Failed to parse xiaoyuzhoufm page: Unknown error');
  }
}

/**
 * Constructs RSS feed URL from Apple Podcasts URL
 */
function getApplePodcastsRssUrl(url: string): string | null {
  const applePodcastsPattern = /podcasts\.apple\.com\/([^\/]+)\/podcast\/[^\/]+\/id(\d+)/;
  const match = url.match(applePodcastsPattern);
  
  if (match) {
    const country = match[1];
    const podcastId = match[2];
    return `https://podcasts.apple.com/${country}/podcast/id${podcastId}.rss`;
  }
  
  return null;
}

/**
 * Parses Apple Podcasts URL - tries RSS feed first, then HTML parsing
 */
async function parseApplePodcastsPage(url: string): Promise<PodcastData> {
  // First, try RSS feed approach (RSS feeds sometimes have more permissive CORS)
  const rssUrl = getApplePodcastsRssUrl(url);
  if (rssUrl) {
    const episodeIdMatch = url.match(/[?&]i=(\d+)/);
    const episodeId = episodeIdMatch ? episodeIdMatch[1] : undefined;
    
    try {
      return await parseRssFeed(rssUrl, episodeId);
    } catch (rssError) {
      // RSS failed, try HTML parsing as fallback
      const rssErrorMessage = rssError instanceof Error ? rssError.message : 'Unknown error';
      console.log('RSS feed approach failed, trying HTML parsing:', rssErrorMessage);
    }
  }
  
  // Try HTML parsing as fallback (but this will likely also fail due to CORS)
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Apple Podcasts page: ${response.status} ${response.statusText}`);
    }
    
    const htmlText = await response.text();
    
    // Try to extract audio URL from various possible locations in the HTML
    let audioUrl = '';
    let title = '';
    let description = '';
    
    // Method 1: Look for JSON-LD structured data
    const jsonLdMatch = htmlText.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/s);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        if (jsonLd['@type'] === 'PodcastEpisode' || jsonLd['@type'] === 'PodcastSeries') {
          if (jsonLd.associatedMedia?.contentUrl) {
            audioUrl = jsonLd.associatedMedia.contentUrl;
          }
          if (jsonLd.name) {
            title = jsonLd.name;
          }
          if (jsonLd.description) {
            description = jsonLd.description;
          }
        }
      } catch (e) {
        // JSON parse failed, continue with other methods
      }
    }
    
    // Method 2: Look for audio source in meta tags or data attributes
    if (!audioUrl) {
      // Look for data-episode-url or similar attributes
      const dataUrlMatch = htmlText.match(/data-episode-url=["']([^"']+)["']/i) ||
                          htmlText.match(/data-audio-url=["']([^"']+)["']/i) ||
                          htmlText.match(/audioUrl["']?\s*[:=]\s*["']([^"']+)["']/i);
      if (dataUrlMatch) {
        audioUrl = dataUrlMatch[1];
      }
    }
    
    // Method 3: Look for audio elements
    if (!audioUrl) {
      const audioMatch = htmlText.match(/<audio[^>]+src=["']([^"']+)["']/i) ||
                        htmlText.match(/<source[^>]+src=["']([^"']+\.(mp3|m4a|wav|ogg))["']/i);
      if (audioMatch) {
        audioUrl = audioMatch[1];
      }
    }
    
    // Method 4: Look for JSON data in script tags (Apple Podcasts often embeds data)
    if (!audioUrl) {
      const scriptMatches = htmlText.matchAll(/<script[^>]*>(.*?)<\/script>/gs);
      for (const match of scriptMatches) {
        const scriptContent = match[1];
        // Look for audio URLs in JSON-like structures
        const urlPatterns = [
          /"url"\s*:\s*"([^"]+\.(mp3|m4a|mpeg))"/i,
          /"src"\s*:\s*"([^"]+\.(mp3|m4a|mpeg))"/i,
          /"audioUrl"\s*:\s*"([^"]+\.(mp3|m4a|mpeg))"/i,
          /audio.*?url.*?["']([^"']+\.(mp3|m4a|mpeg))["']/i,
        ];
        
        for (const pattern of urlPatterns) {
          const urlMatch = scriptContent.match(pattern);
          if (urlMatch && urlMatch[1].startsWith('http')) {
            audioUrl = urlMatch[1];
            break;
          }
        }
        if (audioUrl) break;
      }
    }
    
    // Extract title
    if (!title) {
      const titleMatch = htmlText.match(/<title[^>]*>(.*?)<\/title>/i) ||
                        htmlText.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
    }
    
    // Extract description
    if (!description) {
      const descMatch = htmlText.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                       htmlText.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      if (descMatch) {
        description = descMatch[1].trim();
      }
    }
    
    // Extract shownotes/description text
    let shownotes = description;
    const contentMatches = htmlText.match(/<div[^>]*class=["'][^"']*description[^"']*["'][^>]*>(.*?)<\/div>/is) ||
                          htmlText.match(/<div[^>]*id=["'][^"']*description[^"']*["'][^>]*>(.*?)<\/div>/is);
    if (contentMatches) {
      const contentText = contentMatches[1].replace(/<[^>]+>/g, ' ').trim();
      if (contentText.length > description.length) {
        shownotes = contentText;
      }
    }
    
    if (!audioUrl) {
      throw new Error('Could not find audio URL in Apple Podcasts page. The page structure may have changed or the episode may not be available.');
    }
    
    // Parse shownotes to separate intro and summary notes
    const { intro, summaryNotes } = parseShownotes(shownotes);
    
    return {
      audioUrl,
      title: title || 'Apple Podcasts Episode',
      description,
      shownotes,
      intro,
      summaryNotes,
    };
  } catch (htmlError) {
    // If HTML parsing also fails, provide helpful error
    const errorMessage = htmlError instanceof Error ? htmlError.message : 'Unknown error';
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS')) {
      throw new Error(`Cannot access Apple Podcasts directly due to browser security restrictions (CORS). The RSS feed approach also failed. Please try:\n1. Using the podcast's direct RSS feed URL from their official website\n2. Using a direct audio file URL if available\n3. Contacting the podcast producer for the RSS feed URL`);
    }
    throw new Error(`Failed to parse Apple Podcasts page: ${errorMessage}`);
  }
}

/**
 * Extracts podcast data from a URL (either direct audio or RSS feed)
 */
export async function extractPodcastData(url: string): Promise<PodcastData> {
  // Check if it's a direct audio URL
  const audioExtensions = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac'];
  const lowerUrl = url.toLowerCase();
  const isDirectAudio = audioExtensions.some(ext => lowerUrl.includes(ext));
  
  if (isDirectAudio) {
    return {
      audioUrl: url,
    };
  }
  
  // Check if it's a xiaoyuzhoufm.com URL and parse the HTML page
  if (isXiaoyuzhoufmUrl(url)) {
    return await parseXiaoyuzhoufmPage(url);
  }
  
  // Check if it's an Apple Podcasts URL and parse the HTML page
  if (isApplePodcastsUrl(url)) {
    return await parseApplePodcastsPage(url);
  }
  
  // Try to parse as RSS feed
  return parseRssFeed(url);
}

