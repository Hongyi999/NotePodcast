import { useState, useEffect } from 'react';
import { PodcastData } from '../types';
import { extractPodcastData } from '../services/rssParser';
import { generateAISummary, generateTranscript } from '../services/zhipuApi';

export function usePodcastData(url: string | null) {
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  useEffect(() => {
    if (!url) return;

    const fetchPodcastData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await extractPodcastData(url);
        setPodcastData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load podcast');
      } finally {
        setLoading(false);
      }
    };

    fetchPodcastData();
  }, [url]);

  const loadAISummary = async (index: number, context?: any) => {
    if (!podcastData?.audioUrl) return;

    // Use current data if context not provided
    const summaryContext = context || {
      title: podcastData.title,
      description: podcastData.description,
      shownotes: podcastData.shownotes
    };

    setLoadingSummaries(true);
    try {
      const summary = await generateAISummary(podcastData.audioUrl, index, summaryContext);
      
      setPodcastData(prev => {
        if (!prev) return prev;
        const summaryKey = `summary${index}` as 'summary1' | 'summary2' | 'summary3';
        return {
          ...prev,
          summaries: {
            ...prev.summaries,
            [summaryKey]: summary,
          },
        };
      });
      return summary;
    } catch (err) {
      console.error(`Failed to load AI summary ${index}:`, err);
      throw err;
    } finally {
      setLoadingSummaries(false);
    }
  };

  const loadTranscript = async (context?: any) => {
    if (!podcastData?.audioUrl || podcastData.transcript) return;

    const transcriptContext = context || {
      title: podcastData.title,
      shownotes: podcastData.shownotes
    };

    setLoadingTranscript(true);
    try {
      const transcript = await generateTranscript(podcastData.audioUrl, transcriptContext);
      setPodcastData(prev => prev ? { ...prev, transcript } : null);
    } catch (err) {
      console.error('Failed to load transcript:', err);
    } finally {
      setLoadingTranscript(false);
    }
  };

  // Automatically load all AI summaries and transcript when podcast data is ready
  useEffect(() => {
    if (podcastData && podcastData.audioUrl && !podcastData.summaries?.summary1 && !loadingSummaries) {
      const context = {
        title: podcastData.title,
        description: podcastData.description,
        shownotes: podcastData.shownotes
      };
      
      // Load all 3 summaries in parallel
      Promise.all([
        loadAISummary(1, context),
        loadAISummary(2, context),
        loadAISummary(3, context)
      ]).catch(err => console.error('Error pre-loading AI summaries:', err));

      // Also pre-load transcript if it's missing
      if (!podcastData.transcript && !loadingTranscript) {
        loadTranscript(context).catch(err => console.error('Error pre-loading transcript:', err));
      }
    }
  }, [podcastData?.audioUrl]);

  return {
    podcastData,
    loading,
    error,
    loadingSummaries,
    loadingTranscript,
    loadAISummary,
    loadTranscript,
  };
}

