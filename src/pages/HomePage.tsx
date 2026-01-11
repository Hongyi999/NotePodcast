import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidUrl } from '../utils/urlValidator';
import { BrandHeader } from '../components/BrandHeader';
import { LoginButton } from '../components/LoginButton';
import { LoginModal } from '../components/LoginModal';
import './HomePage.css';

export function HomePage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
    navigate(`/loading?url=${encodeURIComponent(url.trim())}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };


  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <div className="home-page">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <div className="home-top-bar">
        <div className="top-bar-left">
          <svg className="podcast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Radio/Podcast icon */}
            <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.3"/>
            <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M12 8V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 14V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
          </svg>
        </div>
        <div className="top-bar-right">
          <LoginButton onLoginClick={handleLogin} variant="light" />
        </div>
      </div>
      
      <div className="home-container">
        <BrandHeader variant="home" />
        
        <div className="url-input-section">
          <div className="url-input-wrapper">
            <svg className="link-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M14 11C13.5705 10.4259 13.0226 9.95088 12.3934 9.60707C11.7643 9.26326 11.0685 9.05886 10.3533 9.00766C9.63816 8.95645 8.92037 9.05972 8.24874 9.31028C7.5771 9.56084 6.96705 9.95301 6.46002 10.46L3.46002 13.46C2.54923 14.403 2.04525 15.6661 2.05664 16.977C2.06803 18.288 2.59387 19.5421 3.52091 20.4691C4.44795 21.3962 5.70202 21.922 7.013 21.9334C8.32398 21.9448 9.58699 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <input
              type="text"
              className={`url-input ${error ? 'error' : ''}`}
              placeholder="Paste podcast URL link here..."
              value={url}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <div className="input-actions">
              <button 
                className="lucky-button"
                onClick={() => {
                  // TODO: Implement "I'm feeling lucky" feature
                  console.log('Feeling lucky');
                }}
                title="I'm feeling lucky"
              >
                <svg className="sparkle-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor"/>
                </svg>
                I'm feeling lucky
              </button>
              <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={!!error || !url.trim()}
                title="Submit"
              >
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="description-card">
          <h3 className="card-title">Don't let podcast wisdom fade away.</h3>
          <p className="card-text">
            Notepodcast doesn't just stream audio. We help you lock in takeaways in the moment. Record reflections. Sort knowledge. Revisit anytime. Grow smarter, live better.
          </p>
          <div className="card-graphic">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="flowerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#FF8C42', stopOpacity: 0.25}} />
                  <stop offset="50%" style={{stopColor: '#FFA366', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#FF6B35', stopOpacity: 0.22}} />
                </linearGradient>
                <linearGradient id="treeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#4CAF50', stopOpacity: 0.2}} />
                  <stop offset="50%" style={{stopColor: '#66BB6A', stopOpacity: 0.18}} />
                  <stop offset="100%" style={{stopColor: '#2E7D32', stopOpacity: 0.22}} />
                </linearGradient>
                <filter id="blur">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4"/>
                </filter>
              </defs>
              
              {/* Orange Flower - abstract */}
              <g transform="translate(60, 40)">
                <circle cx="0" cy="0" r="25" fill="url(#flowerGradient)" filter="url(#blur)" opacity="0.4"/>
                <ellipse cx="0" cy="0" rx="20" ry="30" fill="url(#flowerGradient)" filter="url(#blur)" opacity="0.35"/>
                <ellipse cx="0" cy="0" rx="30" ry="20" fill="url(#flowerGradient)" filter="url(#blur)" opacity="0.3"/>
                <circle cx="0" cy="0" r="8" fill="#FF8C42" opacity="0.2"/>
              </g>
              
              {/* Green Tree - abstract */}
              <g transform="translate(140, 120)">
                <ellipse cx="0" cy="0" rx="35" ry="45" fill="url(#treeGradient)" filter="url(#blur)" opacity="0.3"/>
                <ellipse cx="0" cy="-15" rx="28" ry="35" fill="url(#treeGradient)" filter="url(#blur)" opacity="0.25"/>
                <ellipse cx="0" cy="-30" rx="22" ry="28" fill="url(#treeGradient)" filter="url(#blur)" opacity="0.2"/>
                <rect x="-3" y="20" width="6" height="25" fill="#4CAF50" opacity="0.15" rx="2"/>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

