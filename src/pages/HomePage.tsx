import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidUrl } from '../utils/urlValidator';
import { EXAMPLE_PODCAST_URLS } from '../utils/podcastExamples';
import './HomePage.css';

export function HomePage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    if (value.trim() === '') {
      setError('');
    } else if (!isValidUrl(value)) {
      setError('Please enter a valid podcast URL');
    } else {
      setError('');
    }
  };

  const handleSubmit = () => {
    if (!url.trim()) {
      setError('Please enter a valid podcast URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid podcast URL');
      return;
    }

    // Navigate to podcast page with URL
    navigate(`/podcast?url=${encodeURIComponent(url)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setError('');
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <input
          type="text"
          className={`apple-input ${error ? 'error' : ''}`}
          placeholder="Enter RSS feed URL, xiaoyuzhoufm.com URL, or audio file URL"
          value={url}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        {error && <div className="error-message">{error}</div>}
        <button
          className="apple-button confirm-button"
          onClick={handleSubmit}
          disabled={!!error || !url.trim()}
        >
          Confirm & Enter
        </button>
        
        <div className="example-urls">
          <div className="example-label">Try example URLs:</div>
          <div className="example-buttons">
            {EXAMPLE_PODCAST_URLS.xiaoyuzhoufm.map((exampleUrl, index) => (
              <button
                key={`xyzh-${index}`}
                className="example-button apple-button-text"
                onClick={() => handleExampleClick(exampleUrl)}
                title={exampleUrl}
              >
                Example: 小宇宙
              </button>
            ))}
            {EXAMPLE_PODCAST_URLS.rssFeeds.slice(0, 1).map((exampleUrl, index) => (
              <button
                key={`rss-${index}`}
                className="example-button apple-button-text"
                onClick={() => handleExampleClick(exampleUrl)}
                title={exampleUrl}
              >
                Example RSS
              </button>
            ))}
          </div>
          <div className="cors-notice">
            <strong>Supported:</strong> RSS feeds, xiaoyuzhoufm.com (小宇宙) URLs, and direct audio files.<br/>
            <strong>Note:</strong> Apple Podcasts URLs don't work due to CORS restrictions. See <a href="#" onClick={(e) => { e.preventDefault(); alert('See PODCAST_URL_GUIDE.md for help finding RSS feeds'); }}>PODCAST_URL_GUIDE.md</a> for more info.
          </div>
        </div>
      </div>
    </div>
  );
}

