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

  const loadAISummary = async (index: number) => {
    if (!podcastData?.audioUrl) return;

    setLoadingSummaries(true);
    try {
      const summary = await generateAISummary(podcastData.audioUrl, index);
      
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
    } catch (err) {
      console.error('Failed to load AI summary:', err);
      throw err;
    } finally {
      setLoadingSummaries(false);
    }
  };

  const loadTranscript = async () => {
    if (!podcastData?.audioUrl || podcastData.transcript) return;

    setLoadingTranscript(true);
    try {
      const transcript = await generateTranscript(podcastData.audioUrl);
      setPodcastData(prev => prev ? { ...prev, transcript } : null);
    } catch (err) {
      console.error('Failed to load transcript:', err);
    } finally {
      setLoadingTranscript(false);
    }
  };

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

