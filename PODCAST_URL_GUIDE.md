# Podcast URL Guide

## ⚠️ Important: Apple Podcasts URLs Not Supported

**Apple Podcasts URLs (like `podcasts.apple.com/...`) cannot be used directly in web browsers due to CORS (Cross-Origin Resource Sharing) security restrictions.** This is a browser security feature, not a limitation of NotePodcast.

**You must use the podcast's direct RSS feed URL instead.**

## Supported URL Types

### ✅ Direct RSS Feed URLs (Recommended)
These work best and provide full podcast metadata:
- `https://feeds.example.com/podcast.rss`
- `https://example.com/podcast.xml`
- `https://podcast.example.com/feed.xml`

### ✅ Xiaoyuzhoufm.com (小宇宙) URLs
You can use xiaoyuzhoufm.com episode page URLs directly:
- `https://www.xiaoyuzhoufm.com/episode/6953815414db1df9ef81f6b4`
- The app will automatically extract the audio and metadata from the page

### ✅ Direct Audio File URLs
Direct links to audio files:
- `https://example.com/episode.mp3`
- `https://example.com/episode.m4a`
- `https://example.com/episode.wav`

### ❌ Apple Podcasts URLs (Not Supported)
Apple Podcasts page URLs like `https://podcasts.apple.com/...` **do not work** in web browsers due to CORS restrictions.

## How to Find RSS Feed URLs

### For "岩中花述" (Yan Zhong Hua Shu) Podcast

This podcast is produced by **GIADA** and **JustPod**. Here's how to find the RSS feed:

**Method 1: JustPod Website**
1. Visit JustPod's website or search for "JustPod 岩中花述"
2. Find the podcast's page on their website
3. Look for an RSS feed link (usually labeled "RSS", "订阅", or in a "Subscribe" section)
4. Copy the RSS feed URL

**Method 2: Podcast Directories**
- **Listen Notes**: https://www.listennotes.com (search for "岩中花述")
- **Podchaser**: https://www.podchaser.com
- **Podcast Index**: https://podcastindex.org

**Method 3: Contact the Producer**
- Contact JustPod or GIADA directly
- Ask them for the podcast's RSS feed URL
- Most podcast producers are happy to provide this

### General Method: Finding Any Podcast's RSS Feed

**Step 1: Visit the Podcast's Official Website**
- Most podcasts have an official website
- Look for the podcast name + "official website" or "官网"

**Step 2: Look for RSS Feed Links**
Common locations:
- **Footer** of the website
- **"Subscribe" or "订阅" section**
- **Podcast info/About page**
- **Episode pages** (often in the sidebar)

**Step 3: Check Podcast Directories**
If you can't find it on the official website:
- **Listen Notes** (listennotes.com) - Often has RSS feeds
- **Podchaser** (podchaser.com) - Comprehensive podcast database
- **Podcast Index** (podcastindex.org) - Open podcast database

**Step 4: Check Hosting Platforms**
If you know where the podcast is hosted:
- **Anchor** - RSS feeds available
- **Buzzsprout** - RSS feeds in podcast settings
- **Libsyn** - RSS feeds available
- **Spreaker** - RSS feeds available

## Example Working URLs

### RSS Feeds (Test these):
```
https://feeds.npr.org/510289/podcast.xml
https://rss.cnn.com/rss/edition.rss
https://feeds.bbci.co.uk/programmes/b006qykl/rss.xml
```

### Direct Audio (Test playback):
```
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
```

## Why Apple Podcasts URLs Don't Work

**Technical Explanation:**
- Browsers enforce CORS (Cross-Origin Resource Sharing) policies
- Apple Podcasts servers don't allow cross-origin requests from web browsers
- This is a security feature that prevents websites from accessing resources on other domains
- Native apps (like the Apple Podcasts app) don't have this restriction
- **This cannot be bypassed in a web browser**

**Solution:**
Use the podcast's direct RSS feed URL, which:
- Usually doesn't have CORS restrictions
- Provides the same content
- Works reliably in web browsers
- Is the standard way podcasts are distributed

## Troubleshooting

### "CORS Error" or "Failed to fetch"
- **Cause:** You're trying to use an Apple Podcasts URL or a feed with CORS restrictions
- **Solution:** Find and use the podcast's direct RSS feed URL instead

### "No audio URL found"
- The RSS feed might not have proper audio enclosures
- **Solution:** Try a different episode or use a direct audio file URL

### "Invalid RSS feed format"
- The URL might not be a valid RSS feed
- **Solution:** Verify the URL is correct and is actually an RSS feed

### "Failed to fetch" (Network Error)
- Network issue or the feed is down
- **Solution:** Check your internet connection and try again later

## Tips

1. **Always use RSS feed URLs** - They're designed to work across platforms
2. **RSS feeds are publicly available** - Most podcasts provide them freely
3. **Check the podcast's website first** - It's usually the quickest way to find the RSS feed
4. **Use podcast directories as backup** - They often have RSS feeds listed
5. **Contact the producer if needed** - They can provide the RSS feed URL directly

## Quick Reference: RSS Feed URL Format

RSS feed URLs typically look like:
- `https://feeds.[hosting-platform].com/[podcast-name]`
- `https://[podcast-name].com/feed.xml`
- `https://[podcast-name].com/rss`
- `https://[podcast-name].com/podcast.rss`

They usually end with `.rss` or `.xml`, but not always.
