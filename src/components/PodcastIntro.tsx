import { useState, useEffect } from 'react';
import { summarizeIntro } from '../services/zhipuApi';
import './PodcastIntro.css';

interface PodcastIntroProps {
  intro: string;
  title?: string;
}

export function PodcastIntro({ intro, title }: PodcastIntroProps) {
  const [summarizedIntro, setSummarizedIntro] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    if (!intro) {
      setSummarizedIntro('');
      return;
    }

    const fetchSummary = async () => {
      setIsSummarizing(true);
      try {
        const summary = await summarizeIntro(intro);
        setSummarizedIntro(summary);
      } catch (error) {
        console.error('Failed to summarize intro:', error);
        // Fallback to showing first few sentences
        const fallback = intro.split('\n').slice(0, 3).join(' ').substring(0, 200);
        setSummarizedIntro(fallback + (fallback.length < intro.length ? '...' : ''));
      } finally {
        setIsSummarizing(false);
      }
    };

    fetchSummary();
  }, [intro]);

  if (!intro) {
    return null;
  }

  return (
    <div className="podcast-intro">
      {title && <h2 className="podcast-intro-title">{title}</h2>}
      <div className="podcast-intro-content">
        {isSummarizing ? (
          <p className="podcast-intro-loading">正在总结播客简介...</p>
        ) : (
          <p>{summarizedIntro || intro.split('\n').slice(0, 3).join(' ').substring(0, 200)}</p>
        )}
      </div>
    </div>
  );
}

