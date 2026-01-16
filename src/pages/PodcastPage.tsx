import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { usePodcastData } from '../hooks/usePodcastData';
import { useNotes } from '../hooks/useNotes';
import { AudioPlayer } from '../components/AudioPlayer';
import { PodcastIntro } from '../components/PodcastIntro';
import { BrandHeader } from '../components/BrandHeader';
import { LoginButton } from '../components/LoginButton';
import { LoginModal } from '../components/LoginModal';
import { LimitReachedModal } from '../components/LimitReachedModal';
import { TabNavigation } from '../components/TabNavigation';
import { SummaryContent } from '../components/SummaryContent';
import { NotesModule } from '../components/NotesModule';
import { TranscriptsModule } from '../components/TranscriptsModule';
import { CommentsModule } from '../components/CommentsModule';
import { CorsErrorHelper } from '../components/CorsErrorHelper';
import { SortOption } from '../types';
import './PodcastPage.css';

export function PodcastPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get('url');

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [leftTab, setLeftTab] = useState<string>('transcripts');
  const [rightTab, setRightTab] = useState<string>('notes');
  const [sortOption, setSortOption] = useState<SortOption>('time');
  const [leftWidth, setLeftWidth] = useState(60); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { podcastData, loading, error, loadingSummaries, loadingTranscript } = usePodcastData(url);
  const { addNote, deleteNote, getSortedNotes } = useNotes(url || '');
  const sortedNotes = getSortedNotes(sortOption);

  const handleAddNote = async (time: number, content: string) => {
    const result = await addNote(time, content);
    if (result === 'limit_reached') {
      setIsLimitModalOpen(true);
    } else if (result === 'error') {
      alert('Failed to add note. Please try again.');
    }
  };

  const {
    isPlaying,
    currentTime,
    duration,
    speed,
    error: audioError,
    isLoading: audioLoading,
    togglePlayPause,
    seek,
    changeSpeed,
  } = useAudioPlayer(podcastData?.audioUrl || null);

  // Removed unused transcriptError state

  // Resizing logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const containerEl = containerRef.current;
      if (!containerEl) return;

      const rect = containerEl.getBoundingClientRect();
      const minSidePx = 360; // hard limit so neither side becomes too small

      const rawLeftPx = e.clientX - rect.left;
      const clampedLeftPx = Math.min(Math.max(rawLeftPx, minSidePx), rect.width - minSidePx);
      const newWidth = (clampedLeftPx / rect.width) * 100;

      // soft limit in percentages for extra safety
      if (newWidth >= 30 && newWidth <= 75) setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.button !== 0) return; // only left-click drags
    setIsResizing(true);
  };

  const getRightTabs = () => {
    const tabs: { value: string; label: string }[] = [
      { value: 'notes', label: 'Notes' },
    ];

    for (let i = 1; i <= 3; i++) {
      const summaryKey = `summary${i}` as 'summary1' | 'summary2' | 'summary3';
      const summary = podcastData?.summaries?.[summaryKey];
      tabs.push({
        value: summaryKey,
        label: summary ? summary.title : `AI关键词 ${i}`,
      });
    }
    return tabs;
  };

  const LEFT_TABS = [
    { value: 'transcripts', label: 'Transcripts' },
    { value: 'comments', label: 'Comments' },
  ];

  const getSummaryItems = (tabValue: string) => {
    if (!podcastData) return [];
    const summaryKey = tabValue as 'summary1' | 'summary2' | 'summary3';
    return podcastData.summaries?.[summaryKey]?.items || [];
  };

  const handleTimePointClick = (time: number) => {
    seek(time);
    if (!isPlaying) {
      togglePlayPause();
    }
  };

  if (!url) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="podcast-page loading">
        <div className="loading-message">Loading podcast...</div>
      </div>
    );
  }

  if (error) {
    const isCorsError = error.includes('CORS') || error.includes('Failed to fetch');
    return (
      <div className="podcast-page error">
        <div className="error-message">{error}</div>
        {isCorsError && url && <CorsErrorHelper originalUrl={url} />}
        <button className="apple-button" onClick={() => navigate('/')}>
          Go Back
        </button>
      </div>
    );
  }

  const rightTabs = getRightTabs();

  return (
    <div className={`podcast-page ${isResizing ? 'is-resizing' : ''}`}>
      {/* Modals - rendered at top level for proper positioning */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <LimitReachedModal 
        isOpen={isLimitModalOpen} 
        onClose={() => setIsLimitModalOpen(false)} 
        onLoginClick={() => setIsLoginModalOpen(true)}
      />
      
      <div className="podcast-top-bar">
        <div className="top-bar-left">
          <BrandHeader 
            variant="podcast" 
            onLogoClick={() => navigate('/')}
          />
        </div>
        <div className="top-bar-right">
          <LoginButton onLoginClick={() => setIsLoginModalOpen(true)} variant="light" />
        </div>
      </div>
      
      <div className="podcast-container" ref={containerRef}>
        <div className="left-column" style={{ width: `${leftWidth}%` }}>
          <div className="podcast-header-area">
            {podcastData?.title && (
              <div className="podcast-title-header">
                <h2 className="podcast-title">{podcastData.title}</h2>
              </div>
            )}
            <PodcastIntro intro={podcastData?.intro || ''} />
          </div>
          
          <AudioPlayer
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            speed={speed}
            error={audioError}
            isLoading={audioLoading}
            onPlayPause={togglePlayPause}
            onSeek={seek}
            onSpeedChange={changeSpeed}
          />

          <div className="left-content-area">
            <TabNavigation
              tabs={LEFT_TABS.map(t => t.label)}
              activeTab={LEFT_TABS.find(t => t.value === leftTab)?.label || LEFT_TABS[0].label}
              onTabChange={(label) => {
                const tab = LEFT_TABS.find(t => t.label === label);
                if (tab) setLeftTab(tab.value);
              }}
            />

            <div className="left-module-wrapper hidden-scrollbar">
              {leftTab === 'transcripts' && (
                <TranscriptsModule
                  transcript={podcastData?.transcript || null}
                  isLoading={loadingTranscript}
                  error={null}
                  currentTime={currentTime}
                  onTimePointClick={handleTimePointClick}
                />
              )}
              {leftTab === 'comments' && (
                <CommentsModule
                  comments={podcastData?.comments || []}
                  onTimePointClick={handleTimePointClick}
                />
              )}
            </div>
          </div>
        </div>

        <div
          className="divider-resizable"
          onMouseDown={startResizing}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
        >
          <div className="divider-handle">
            <div className="handle-dot" />
            <div className="handle-dot" />
            <div className="handle-dot" />
          </div>
        </div>

        <div className="right-column" style={{ width: `${100 - leftWidth}%` }}>
          <TabNavigation
            tabs={rightTabs.map(t => t.label)}
            activeTab={rightTabs.find(t => t.value === rightTab)?.label || rightTabs[0].label}
            onTabChange={(label) => {
              const tab = rightTabs.find(t => t.label === label);
              if (tab) setRightTab(tab.value);
            }}
          />

          <div className="right-module-wrapper hidden-scrollbar">
            {rightTab === 'notes' && (
              <NotesModule
                sortedNotes={sortedNotes}
                sortOption={sortOption}
                currentTime={currentTime}
                onAddNote={handleAddNote}
                onDeleteNote={deleteNote}
                onSortChange={setSortOption}
                onTimePointClick={handleTimePointClick}
              />
            )}
            {rightTab.startsWith('summary') && (
              <SummaryContent
                items={getSummaryItems(rightTab)}
                onTimePointClick={handleTimePointClick}
                isLoading={loadingSummaries}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
