import React from 'react';
import './LogoutModal.css';

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutModal({ isOpen, onConfirm, onCancel }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onCancel}>
      <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h2>Sign Out</h2>
        <p>Are you sure you want to sign out?</p>
        
        <div className="logout-modal-actions">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
