import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import './LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SignUpStep = 'email' | 'verification';

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Send OTP (One-Time Password) to email
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      });
      
      if (error) throw error;
      
      setSuccessMessage('Verification code sent to your email!');
      setSignUpStep('verification');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email'
      });
      
      if (error) throw error;
      
      // If verification successful, create password for the user
      if (data.user && password) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });
        if (updateError) throw updateError;
      }
      
      setSuccessMessage('Registration successful!');
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please check your code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setVerificationCode('');
    setError(null);
    setSuccessMessage(null);
    setSignUpStep('email');
  };

  const handleToggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleBackToEmail = () => {
    setSignUpStep('email');
    setVerificationCode('');
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose}>
          &times;
        </button>
        
        <h2>
          {isSignUp 
            ? (signUpStep === 'email' ? 'Create Account' : 'Verify Email') 
            : 'Welcome Back'}
        </h2>
        
        {error && <div className="login-error">{error}</div>}
        {successMessage && <div className="login-success">{successMessage}</div>}
        
        {/* Login Form */}
        {!isSignUp && (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={6}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}
        
        {/* Sign Up - Email & Password Step */}
        {isSignUp && signUpStep === 'email' && (
          <form onSubmit={handleSendVerificationCode} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set password (at least 6 characters)"
                minLength={6}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        )}
        
        {/* Sign Up - Verification Code Step */}
        {isSignUp && signUpStep === 'verification' && (
          <form onSubmit={handleVerifyCode} className="login-form">
            <p className="verification-hint">
              We've sent a verification code to <strong>{email}</strong>
            </p>
            
            <div className="form-group">
              <label htmlFor="verification-code">Verification Code</label>
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify and Sign Up'}
            </button>
            
            <button 
              type="button" 
              className="back-button" 
              onClick={handleBackToEmail}
              disabled={loading}
            >
              Back to Edit Email
            </button>
          </form>
        )}
        
        <div className="auth-toggle">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button onClick={handleToggleAuthMode} className="toggle-button">
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button onClick={handleToggleAuthMode} className="toggle-button">
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
