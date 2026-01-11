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
      // Don't throw - return a placeholder instead
      const placeholder = {
        title: 'AI 摘要生成失败',
        items: [{ timePoint: 0, content: 'API配额不足或请求过多，请稍后重试' }]
      };
      
      setPodcastData(prev => {
        if (!prev) return prev;
        const summaryKey = `summary${index}` as 'summary1' | 'summary2' | 'summary3';
        return {
          ...prev,
          summaries: {
            ...prev.summaries,
            [summaryKey]: placeholder,
          },
        };
      });
      
      return placeholder;
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
      // Set placeholder transcript so page can continue
      const placeholder = [{ 
        timePoint: 0, 
        content: 'AI 转录生成失败。可能原因：API配额不足或请求过多。您仍然可以收听音频并添加笔记。' 
      }];
      setPodcastData(prev => prev ? { ...prev, transcript: placeholder } : null);
    } finally {
      setLoadingTranscript(false);
    }
  };

  // Automatically load AI summaries when podcast data is ready
  useEffect(() => {
    if (!podcastData?.audioUrl) return;
    if (loadingSummaries) return;

    const missing: number[] = [];
    if (!podcastData.summaries?.summary1) missing.push(1);
    if (!podcastData.summaries?.summary2) missing.push(2);
    if (!podcastData.summaries?.summary3) missing.push(3);
    if (missing.length === 0) return;

    console.log('[usePodcastData] Loading missing AI summaries:', missing);

    const context = {
      title: podcastData.title,
      description: podcastData.description,
      shownotes: podcastData.shownotes,
    };

    // Use allSettled instead of all so individual failures don't block everything
    Promise.allSettled(missing.map((i) => loadAISummary(i, context)))
      .then((results) => {
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          console.warn('[usePodcastData] Some AI summaries failed:', failed.length);
          
          // Set placeholder for failed summaries
          setPodcastData(prev => {
            if (!prev) return prev;
            const newSummaries = { ...prev.summaries };
            
            results.forEach((result, idx) => {
              if (result.status === 'rejected') {
                const summaryIndex = missing[idx];
                const summaryKey = `summary${summaryIndex}` as 'summary1' | 'summary2' | 'summary3';
                newSummaries[summaryKey] = { 
                  title: 'AI 摘要生成失败', 
                  items: [{ timePoint: 0, content: 'API配额不足，请充值后重试或稍后在播客页面重新生成' }] 
                };
              }
            });
            
            return { ...prev, summaries: newSummaries };
          });
        } else {
          console.log('[usePodcastData] All AI summaries loaded successfully');
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    podcastData?.audioUrl,
    podcastData?.summaries?.summary1,
    podcastData?.summaries?.summary2,
    podcastData?.summaries?.summary3,
    podcastData?.title,
    podcastData?.description,
    podcastData?.shownotes,
    loadingSummaries,
  ]);

  // Automatically load transcript when podcast data is ready
  useEffect(() => {
    if (!podcastData?.audioUrl) return;
    if (podcastData.transcript && podcastData.transcript.length > 0) return;
    if (loadingTranscript) return;

    console.log('[usePodcastData] Loading transcript...');

    const context = {
      title: podcastData.title,
      description: podcastData.description,
      shownotes: podcastData.shownotes,
    };

    // loadTranscript now handles errors internally and sets placeholder
    loadTranscript(context).then(() => 
      console.log('[usePodcastData] Transcript loading completed')
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    podcastData?.audioUrl,
    podcastData?.transcript,
    podcastData?.title,
    podcastData?.description,
    podcastData?.shownotes,
    loadingTranscript,
  ]);

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

