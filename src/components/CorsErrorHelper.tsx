import './CorsErrorHelper.css';

interface CorsErrorHelperProps {
  originalUrl: string;
}

export function CorsErrorHelper({ originalUrl }: CorsErrorHelperProps) {
  const isApplePodcasts = originalUrl.includes('podcasts.apple.com');
  
  return (
    <div className="cors-error-helper">
      <div className="cors-error-icon">⚠️</div>
      <h3>CORS Error: Cannot Access Podcast Feed</h3>
      <p className="cors-error-description">
        Browser security restrictions prevent accessing this podcast feed directly.
      </p>
      
      {isApplePodcasts && (
        <div className="cors-solution-section">
          <h4>Why This Happens:</h4>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            Apple Podcasts URLs cannot be accessed directly from web browsers due to CORS (Cross-Origin Resource Sharing) security restrictions. This is a browser security feature that prevents websites from accessing resources on other domains.
          </p>
          
          <h4>Solutions:</h4>
          <ol className="cors-solutions-list">
            <li>
              <strong>Find the Podcast's Direct RSS Feed URL (Recommended):</strong>
              <ul>
                <li>Visit the podcast's official website (e.g., JustPod for "岩中花述")</li>
                <li>Look for an RSS feed link (usually in the footer, "Subscribe" section, or podcast info page)</li>
                <li>The RSS feed URL typically ends with <code>.rss</code> or <code>.xml</code></li>
                <li>Copy and paste that RSS feed URL into NotePodcast</li>
              </ul>
            </li>
            <li>
              <strong>Use Podcast Directories:</strong>
              <ul>
                <li>Search for the podcast on <strong>Listen Notes</strong> (listennotes.com)</li>
                <li>Search for the podcast on <strong>Podchaser</strong> (podchaser.com)</li>
                <li>These platforms often provide direct RSS feed URLs</li>
              </ul>
            </li>
            <li>
              <strong>Contact the Podcast Producer:</strong>
              <ul>
                <li>For "岩中花述", contact JustPod or GIADA</li>
                <li>Ask them for the podcast's RSS feed URL</li>
                <li>Most podcast producers are happy to share this information</li>
              </ul>
            </li>
          </ol>
          
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--color-highlight)', borderRadius: 'var(--border-radius-sm)' }}>
            <strong>Note:</strong> This is a browser security limitation, not a bug in NotePodcast. Apple Podcasts URLs work in native apps but not in web browsers due to CORS restrictions.
          </div>
        </div>
      )}
      
      <div className="cors-solution-section">
        <h4>General Solutions:</h4>
        <ul className="cors-solutions-list">
          <li>Use the podcast's <strong>direct RSS feed URL</strong> (preferred)</li>
          <li>Use a <strong>direct audio file URL</strong> (.mp3, .m4a, etc.)</li>
          <li>Try podcasts from platforms that allow CORS (many podcast hosting services do)</li>
        </ul>
      </div>
      
      <div className="cors-example-urls">
        <h4>Example URL Formats That Work:</h4>
        <div className="example-url">
          <strong>RSS Feed:</strong>
          <code>https://feeds.example.com/podcast.rss</code>
        </div>
        <div className="example-url">
          <strong>Direct Audio:</strong>
          <code>https://example.com/episode.mp3</code>
        </div>
      </div>
    </div>
  );
}

