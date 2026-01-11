import './LimitReachedModal.css';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export function LimitReachedModal({ isOpen, onClose, onLoginClick }: LimitReachedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay limit-modal-overlay" onClick={onClose}>
      <div className="limit-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="limit-modal-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className="limit-modal-icon">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="url(#limitGradient)" opacity="0.1"/>
            <circle cx="32" cy="32" r="24" stroke="url(#limitGradient)" strokeWidth="2.5"/>
            <path d="M32 20V34" stroke="url(#limitGradient)" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="32" cy="42" r="2" fill="url(#limitGradient)"/>
            <defs>
              <linearGradient id="limitGradient" x1="0" y1="0" x2="64" y2="64">
                <stop offset="0%" stopColor="#007AFF"/>
                <stop offset="100%" stopColor="#0066CC"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="limit-modal-content">
          <h2 className="limit-modal-title">You've Hit the Free Limit</h2>
          <p className="limit-modal-description">
            You've reached 10 notes for this podcast. Sign in to unlock unlimited notes and sync across all your devices.
          </p>
        </div>

        <div className="limit-modal-features">
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" fill="currentColor"/>
            </svg>
            <span>Unlimited notes</span>
          </div>
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 3C13.866 3 17 6.134 17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Sync across devices</span>
          </div>
          <div className="feature-item">
            <svg className="feature-icon" viewBox="0 0 20 20" fill="none">
              <path d="M4 10H16M16 10L12 6M16 10L12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Access full history</span>
          </div>
        </div>
        
        <div className="limit-modal-actions">
          <button 
            className="limit-button limit-button-secondary" 
            onClick={onClose}
          >
            Maybe Later
          </button>
          <button 
            className="limit-button limit-button-primary" 
            onClick={() => {
              onClose();
              onLoginClick();
            }}
          >
            Sign In or Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
