import { useState, useRef, useEffect } from 'react';
import { SummaryItem } from '../types';
import { formatTime } from '../utils/timeFormatter';
import './SummaryContent.css';

interface SummaryContentProps {
  items: SummaryItem[];
  onTimePointClick: (time: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function SummaryContent({ items, onTimePointClick, isLoading, error }: SummaryContentProps) {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleItemClick = (item: SummaryItem, index: number) => {
    onTimePointClick(item.timePoint);
    setHighlightedIndex(index);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setHighlightedIndex(null);
      timeoutRef.current = null;
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="summary-content loading">
        <p>Summary loading, please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="summary-content error">
        <p>{error || 'Summary loading failed, please refresh the page and try again'}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="summary-content empty">
        <p>No summary available</p>
      </div>
    );
  }

  return (
    <div className="summary-content hidden-scrollbar">
      {items.map((item, index) => (
        <div
          key={index}
          className={`summary-item ${highlightedIndex === index ? 'highlighted' : ''}`}
          onClick={() => handleItemClick(item, index)}
        >
          <span className="time-point">{formatTime(item.timePoint)}</span>
          <span className="summary-text">{item.content}</span>
        </div>
      ))}
    </div>
  );
}

