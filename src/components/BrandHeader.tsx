import './BrandHeader.css';

interface BrandHeaderProps {
  variant?: 'home' | 'podcast';
  subtitle?: string;
  onLogoClick?: () => void;
}

export function BrandHeader({ variant = 'home', subtitle, onLogoClick }: BrandHeaderProps) {
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
  };

  return (
    <div className={`brand-header brand-header-${variant}`}>
      <div className="brand-header-background">
        <svg className="globe-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          {/* Planet with rings - Saturn-like */}
          <defs>
            <linearGradient id="planetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#5BA3F5', stopOpacity: 0.3}} />
              <stop offset="100%" style={{stopColor: '#007AFF', stopOpacity: 0.2}} />
            </linearGradient>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#7BB3F5', stopOpacity: 0.25}} />
              <stop offset="100%" style={{stopColor: '#4A9EFF', stopOpacity: 0.15}} />
            </linearGradient>
          </defs>
          
          {/* Planet sphere */}
          <circle cx="100" cy="100" r="45" fill="url(#planetGradient)" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
          
          {/* Rings - tilted oval */}
          <ellipse cx="100" cy="100" rx="60" ry="20" fill="none" stroke="url(#ringGradient)" strokeWidth="2" opacity="0.3" transform="rotate(-20 100 100)"/>
          <ellipse cx="100" cy="100" rx="70" ry="25" fill="none" stroke="url(#ringGradient)" strokeWidth="1.5" opacity="0.25" transform="rotate(-20 100 100)"/>
          
          {/* Subtle details */}
          <circle cx="85" cy="85" r="3" fill="currentColor" opacity="0.15"/>
          <circle cx="115" cy="115" r="2" fill="currentColor" opacity="0.1"/>
        </svg>
      </div>
      <div className="brand-header-content">
        <div 
          className={`brand-logo ${onLogoClick ? 'brand-logo-clickable' : ''}`}
          onClick={handleLogoClick}
          role={onLogoClick ? 'button' : undefined}
          tabIndex={onLogoClick ? 0 : undefined}
          onKeyDown={(e) => {
            if (onLogoClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleLogoClick();
            }
          }}
          title={onLogoClick ? 'Back to Home' : undefined}
        >
          <svg className="logo-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoPlanetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#5BA3F5', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#007AFF', stopOpacity: 1}} />
              </linearGradient>
              <linearGradient id="logoRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#7BB3F5', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#4A9EFF', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            
            {/* Planet sphere */}
            <circle cx="50" cy="50" r="22" fill="url(#logoPlanetGradient)" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="#0066CC" strokeWidth="1" opacity="0.3"/>
            
            {/* Rings - tilted oval like Saturn */}
            <ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="url(#logoRingGradient)" strokeWidth="2.5" transform="rotate(-20 50 50)"/>
            <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke="url(#logoRingGradient)" strokeWidth="2" opacity="0.7" transform="rotate(-20 50 50)"/>
            
            {/* Subtle highlight */}
            <circle cx="42" cy="42" r="2" fill="white" opacity="0.4"/>
          </svg>
        </div>
        <div className="brand-text">
          <h1 className="brand-name">NotePodcast</h1>
          {subtitle && <p className="brand-subtitle">{subtitle}</p>}
          {!subtitle && variant === 'home' && (
            <p className="brand-subtitle-small">The best way to learn from podcasts</p>
          )}
        </div>
      </div>
    </div>
  );
}
