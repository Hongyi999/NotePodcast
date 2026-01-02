import React from 'react';
import { formatTimeRange } from '../utils/timeFormatter';
import './AudioPlayer.css';

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  error: string | null;
  isLoading: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export function AudioPlayer({
  isPlaying,
  currentTime,
  duration,
  speed,
  error,
  isLoading,
  onPlayPause,
  onSeek,
  onSpeedChange,
}: AudioPlayerProps) {
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player">
      <div className="audio-player-controls">
        <button
          className="play-pause-button"
          onClick={onPlayPause}
          disabled={isLoading || !!error}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="4" y="2" width="3" height="12" fill="white" />
              <rect x="9" y="2" width="3" height="12" fill="white" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 2 L14 8 L4 14 Z" fill="white" />
            </svg>
          )}
        </button>

        <select
          className="speed-dropdown apple-dropdown"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          disabled={isLoading || !!error}
        >
          {SPEED_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}x Speed
            </option>
          ))}
        </select>

        <div className="progress-container">
          <div className="progress-bar" onClick={handleProgressClick}>
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="time-display">
            {formatTimeRange(currentTime, duration)}
          </span>
        </div>
      </div>

      {error && <div className="audio-error">{error}</div>}
      {isLoading && !error && (
        <div className="audio-loading">Loading audio...</div>
      )}
    </div>
  );
}

