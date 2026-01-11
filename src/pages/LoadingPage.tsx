import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { LoginButton } from '../components/LoginButton';
import { usePodcastData } from '../hooks/usePodcastData';
import './LoadingPage.css';

export function LoadingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get('url')?.trim() || null;
  const [waitTime, setWaitTime] = React.useState(0);

  const { podcastData, loading, error, loadingSummaries, loadingTranscript } = usePodcastData(url);

  const progress = useMemo(() => {
    const total = 5; // metadata + 3 summaries + transcript
    let done = 0;

    if (podcastData?.audioUrl) done += 1; // metadata/audio
    if (podcastData?.summaries?.summary1) done += 1;
    if (podcastData?.summaries?.summary2) done += 1;
    if (podcastData?.summaries?.summary3) done += 1;
    if (podcastData?.transcript && podcastData.transcript.length > 0) done += 1;

    const percent = Math.round((done / total) * 100);
    return { done, total, percent };
  }, [podcastData]);

  // Ready when we have audio URL and either:
  // 1. All AI content is loaded successfully, OR
  // 2. AI generation failed but we have placeholder data (allowing user to continue)
  const hasAllAIContent = 
    !!podcastData?.summaries?.summary1 &&
    !!podcastData?.summaries?.summary2 &&
    !!podcastData?.summaries?.summary3 &&
    !!podcastData?.transcript &&
    podcastData.transcript.length > 0;

  const isReady =
    !!podcastData?.audioUrl &&
    hasAllAIContent &&
    !loading &&
    !loadingSummaries &&
    !loadingTranscript &&
    !error;

  // Track wait time for debugging
  useEffect(() => {
    if (!podcastData?.audioUrl || loading) return;
    
    const interval = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [podcastData?.audioUrl, loading]);

  useEffect(() => {
    if (!url) {
      navigate('/');
      return;
    }
    if (isReady) {
      console.log('[LoadingPage] All data ready, navigating to podcast page');
      navigate(`/podcast?url=${encodeURIComponent(url)}`);
    }
  }, [isReady, navigate, url]);

  // Debug logging
  useEffect(() => {
    if (podcastData && waitTime > 0 && waitTime % 5 === 0) {
      console.log('[LoadingPage] Debug status:', {
        audioUrl: !!podcastData.audioUrl,
        summary1: !!podcastData.summaries?.summary1,
        summary2: !!podcastData.summaries?.summary2,
        summary3: !!podcastData.summaries?.summary3,
        transcript: podcastData.transcript?.length || 0,
        loading,
        loadingSummaries,
        loadingTranscript,
        error,
        waitTime
      });
    }
  }, [waitTime, podcastData, loading, loadingSummaries, loadingTranscript, error]);

  const handleLogin = () => {
    console.log('Login clicked');
  };

  const handleSkipAndContinue = () => {
    if (podcastData?.audioUrl) {
      console.log('[LoadingPage] User chose to skip AI generation and continue');
      navigate(`/podcast?url=${encodeURIComponent(url)}`);
    }
  };

  if (!url) return null;

  // Show skip button after 10 seconds of waiting (faster for API quota issues)
  const canSkip = waitTime >= 10 && podcastData?.audioUrl && !error;

  return (
    <div className="loading-page">
      <div className="loading-top-bar">
        <div className="top-bar-left">
          <BrandHeader variant="podcast" />
        </div>
        <div className="top-bar-right">
          <LoginButton onClick={handleLogin} />
        </div>
      </div>

      <div className="loading-container">
        {error ? (
          <div className="loading-error-card">
            <h2 className="loading-title">Failed to analyze podcast</h2>
            <p className="loading-subtitle">{error}</p>
            <button className="apple-button" onClick={() => navigate('/')}>
              Go Back
            </button>
          </div>
        ) : (
          <>
            <div className="loading-status">
              <div className="loading-spinner" aria-hidden />
              <div className="loading-text">
                <div className="loading-title">Analyzing podcast</div>
                <div className="loading-subtitle">
                  Preparing transcript and AI summaries. This page will auto-redirect when ready.
                  {waitTime > 15 && <><br /><small style={{ opacity: 0.7 }}>This may take 1-2 minutes for long podcasts...</small></>}
                </div>
              </div>
            </div>

            <div className="loading-progress">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
              </div>
              <div className="progress-meta">
                <span>{progress.percent}%</span>
                <span className="progress-hint">
                  {loadingTranscript || loadingSummaries ? 'Generating…' : 'Loading…'}
                </span>
              </div>
            </div>


            <div className="loading-skeleton-card" aria-hidden>
              <div className="skeleton-thumb" />
              <div className="skeleton-lines">
                <div className="skeleton-line w-80" />
                <div className="skeleton-line w-60" />
                <div className="skeleton-block" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


