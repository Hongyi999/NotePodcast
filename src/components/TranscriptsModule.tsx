import { useEffect, useRef } from 'react';
import { TranscriptItem } from '../types';
import { formatTime } from '../utils/timeFormatter';
import './TranscriptsModule.css';

interface TranscriptsModuleProps {
  transcript: TranscriptItem[] | null;
  isLoading: boolean;
  error: string | null;
  currentTime: number;
  onTimePointClick: (time: number) => void;
}

export function TranscriptsModule({ transcript, isLoading, error, currentTime, onTimePointClick }: TranscriptsModuleProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Find the current active line based on audio time
  const activeIndex = transcript 
    ? transcript.reduce((closest, item, index) => {
        if (item.timePoint <= currentTime && item.timePoint >= (transcript[closest]?.timePoint || 0)) {
          return index;
        }
        return closest;
      }, 0)
    : -1;

  // Auto-scroll logic
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  const handleLineClick = (time: number) => {
    onTimePointClick(time);
  };

  return (
    <div className="transcripts-module">
      <h2 className="module-title">Podcast Transcripts</h2>

      <div className="transcript-content hidden-scrollbar" ref={scrollContainerRef}>
        {isLoading && (
          <div className="transcript-loading">
            <p>Transcript loading...</p>
          </div>
        )}

        {error && (
          <div className="transcript-error">
            <p>Transcript loading failed</p>
          </div>
        )}

        {!isLoading && !error && transcript && transcript.length > 0 && (
          <div className="transcript-list">
            {transcript.map((item, index) => (
              <div 
                key={index} 
                ref={index === activeIndex ? activeLineRef : null}
                className={`transcript-item ${index === activeIndex ? 'active' : ''}`}
                onClick={() => handleLineClick(item.timePoint)}
              >
                <span className="line-time">[{formatTime(item.timePoint)}]</span>
                <span className="line-text">{item.content}</span>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && (!transcript || transcript.length === 0) && (
          <div className="transcript-empty">
            <p>No transcript available</p>
          </div>
        )}
      </div>
    </div>
  );
}
