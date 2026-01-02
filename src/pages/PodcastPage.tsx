import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { usePodcastData } from '../hooks/usePodcastData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AudioPlayer } from '../components/AudioPlayer';
import { PodcastIntro } from '../components/PodcastIntro';
import { TabNavigation } from '../components/TabNavigation';
import { SummaryContent } from '../components/SummaryContent';
import { NotesModule } from '../components/NotesModule';
import { TranscriptsModule } from '../components/TranscriptsModule';
import { CommentsModule } from '../components/CommentsModule';
import { CorsErrorHelper } from '../components/CorsErrorHelper';
import { SummaryTab, RightTab, SortOption } from '../types';
import './PodcastPage.css';

const RIGHT_TABS: { value: RightTab; label: string }[] = [
  { value: 'notes', label: 'Notes' },
  { value: 'transcripts', label: 'Transcripts' },
  { value: 'comments', label: 'Comments' },
];

export function PodcastPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get('url');

  const [leftTab, setLeftTab] = useState<SummaryTab>('original');
  const [rightTab, setRightTab] = useState<RightTab>('notes');
  const [sortOption, setSortOption] = useState<SortOption>('time');
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const { podcastData, loading, error, loadingSummaries, loadingTranscript, loadAISummary, loadTranscript } = usePodcastData(url);
  const { addNote, deleteNote, getSortedNotes } = useLocalStorage(url || '');
  const sortedNotes = getSortedNotes(sortOption);

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

  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  // Get dynamic tab labels from AI summaries
  const getLeftTabs = () => {
    const tabs: { value: SummaryTab; label: string }[] = [
      { value: 'original', label: 'Original Podcast Notes' },
    ];

    // Add AI summary tabs with personalized titles
    for (let i = 1; i <= 3; i++) {
      const summaryKey = `summary${i}` as 'summary1' | 'summary2' | 'summary3';
      const summary = podcastData?.summaries?.[summaryKey];
      if (summary) {
        tabs.push({
          value: summaryKey,
          label: summary.title,
        });
      } else {
        // Show placeholder while loading
        tabs.push({
          value: summaryKey,
          label: `AI Summary ${i}`,
        });
      }
    }

    return tabs;
  };

  // Load transcript when transcripts tab is selected
  useEffect(() => {
    if (rightTab === 'transcripts' && podcastData && !podcastData.transcript && !loadingTranscript) {
      setTranscriptError(null);
      loadTranscript().catch((error) => {
        setTranscriptError(error instanceof Error ? error.message : 'Transcript loading failed');
      });
    }
  }, [rightTab, podcastData, loadingTranscript, loadTranscript]);

  // Load AI summaries when AI tabs are selected
  useEffect(() => {
    if (leftTab.startsWith('summary') && podcastData?.audioUrl) {
      const summaryIndex = parseInt(leftTab.replace('summary', ''));
      const summaryKey = `summary${summaryIndex}` as 'summary1' | 'summary2' | 'summary3';
      
      if (!podcastData.summaries?.[summaryKey]) {
        setSummaryError(null);
        loadAISummary(summaryIndex).catch((error) => {
          setSummaryError(error instanceof Error ? error.message : 'Summary loading failed, please refresh the page and try again');
        });
      }
    }
  }, [leftTab, podcastData, loadAISummary]);

  // Auto-switch to first AI summary if no original notes
  useEffect(() => {
    if (leftTab === 'original' && podcastData && !podcastData.summaryNotes?.length && !podcastData.intro) {
      setLeftTab('summary1');
    }
  }, [podcastData, leftTab]);

  const handleTimePointClick = (time: number) => {
    seek(time);
    if (!isPlaying) {
      togglePlayPause();
    }
  };

  const handleAddNote = (timePoint: number, content: string) => {
    addNote(timePoint, content);
  };

  const getSummaryItems = () => {
    if (!podcastData) return [];

    switch (leftTab) {
      case 'original':
        // Return summary notes from 【内容提要】section
        return podcastData.summaryNotes || [];
      case 'summary1':
        return podcastData.summaries?.summary1?.items || [];
      case 'summary2':
        return podcastData.summaries?.summary2?.items || [];
      case 'summary3':
        return podcastData.summaries?.summary3?.items || [];
      default:
        return [];
    }
  };

  const getSummaryError = () => {
    if (leftTab === 'original' && !podcastData?.summaryNotes?.length) {
      return null; // Will auto-switch
    }
    if (leftTab.startsWith('summary') && loadingSummaries) {
      return null; // Still loading
    }
    return summaryError;
  };

  // Mock comments for now (UI ready, API integration later)
  const comments: any[] = [];
  const leftTabs = getLeftTabs();

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

  return (
    <div className="podcast-page">
      <div className="podcast-container">
        <div className="left-column">
          <PodcastIntro intro={podcastData?.intro || ''} title={podcastData?.title} />
          
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

          <TabNavigation
            tabs={leftTabs.map(t => t.label)}
            activeTab={leftTabs.find(t => t.value === leftTab)?.label || leftTabs[0].label}
            onTabChange={(label) => {
              const tab = leftTabs.find(t => t.label === label);
              if (tab) setLeftTab(tab.value);
            }}
            showHint={leftTab === 'original' && !podcastData?.summaryNotes?.length}
            hintText={leftTab === 'original' && !podcastData?.summaryNotes?.length ? 'No Original Podcast Notes' : undefined}
          />

          <SummaryContent
            items={getSummaryItems()}
            onTimePointClick={handleTimePointClick}
            isLoading={leftTab.startsWith('summary') && loadingSummaries}
            error={getSummaryError() || undefined}
          />
        </div>

        <div className="divider" />

        <div className="right-column">
          <TabNavigation
            tabs={RIGHT_TABS.map(t => t.label)}
            activeTab={RIGHT_TABS.find(t => t.value === rightTab)?.label || RIGHT_TABS[0].label}
            onTabChange={(label) => {
              const tab = RIGHT_TABS.find(t => t.label === label);
              if (tab) setRightTab(tab.value);
            }}
          />

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

          {rightTab === 'transcripts' && (
            <TranscriptsModule
              transcript={podcastData?.transcript || null}
              isLoading={loadingTranscript}
              error={transcriptError}
            />
          )}

          {rightTab === 'comments' && (
            <CommentsModule
              comments={comments}
              onTimePointClick={handleTimePointClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
