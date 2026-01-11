import React, { useState } from 'react';
import './LoginButton.css';
import { useAuth } from '../context/AuthContext';
import { LogoutModal } from './LogoutModal';

interface LoginButtonProps {
  onLoginClick: () => void;
  label?: string;
  variant?: 'light' | 'dark'; // light for light background (dark text), dark for dark background (light text)
}

export function LoginButton({ onLoginClick, label = 'Sign In', variant = 'light' }: LoginButtonProps) {
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleClick = () => {
    if (user) {
      setShowLogoutModal(true);
    } else {
      onLoginClick();
    }
  };

  const handleConfirmLogout = () => {
    signOut();
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className={`login-button-container ${variant}`}>
        {user && <span className="user-greeting">Hi, {user.email?.split('@')[0]}</span>}
        <button className={`login-button ${variant}`} onClick={handleClick}>
          {user ? 'Sign Out' : label}
        </button>
      </div>
      
      <LogoutModal 
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
