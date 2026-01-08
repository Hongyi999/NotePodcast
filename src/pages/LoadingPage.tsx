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

  const { podcastData, loading, error, loadingSummaries, loadingTranscript } = usePodcastData(url);

  const progress = useMemo(() => {
    const total = 5; // metadata + 3 summaries + transcript
    let done = 0;

    if (podcastData?.audioUrl) done += 1; // metadata/audio
    if (podcastData?.summaries?.summary1) done += 1;
    if (podcastData?.summaries?.summary2) done += 1;
    if (podcastData?.summaries?.summary3) done += 1;
    if (podcastData?.transcript) done += 1;

    const percent = Math.round((done / total) * 100);
    return { done, total, percent };
  }, [podcastData]);

  const isReady =
    !!podcastData?.audioUrl &&
    !!podcastData?.summaries?.summary1 &&
    !!podcastData?.summaries?.summary2 &&
    !!podcastData?.summaries?.summary3 &&
    !!podcastData?.transcript &&
    !loading &&
    !loadingSummaries &&
    !loadingTranscript &&
    !error;

  useEffect(() => {
    if (!url) {
      navigate('/');
      return;
    }
    if (isReady) {
      navigate(`/podcast?url=${encodeURIComponent(url)}`);
    }
  }, [isReady, navigate, url]);

  const handleLogin = () => {
    console.log('Login clicked');
  };

  if (!url) return null;

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


