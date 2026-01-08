import { SummaryItem } from '../types';
import { parseTime } from './timeFormatter';

/**
 * Parses shownotes to separate intro and summary notes
 */
export interface ParsedShownotes {
  intro: string; // Content before 【内容提要】
  summaryNotes: SummaryItem[]; // Content after 【内容提要】 with time points
}

/**
 * Parses shownotes text to extract intro and time-stamped summary notes
 */
export function parseShownotes(shownotes: string): ParsedShownotes {
  if (!shownotes) {
    return { intro: '', summaryNotes: [] };
  }

  // Find the 【内容提要】 marker
  const summaryMarker = '【内容提要】';
  const markerIndex = shownotes.indexOf(summaryMarker);
  
  // Split intro and summary sections
  const intro = markerIndex >= 0 
    ? shownotes.substring(0, markerIndex).trim()
    : shownotes.trim();
  
  const summaryText = markerIndex >= 0
    ? shownotes.substring(markerIndex + summaryMarker.length).trim()
    : '';

  // Parse summary notes with time points
  const summaryNotes: SummaryItem[] = [];
  
  if (summaryText) {
    // Find all time points in the text (format: HH:MM:SS or MM:SS)
    // Match patterns like "08:59", "01:02:37", etc.
    const timePattern = /(\d{1,2}:\d{2}(?::\d{2})?)/g;
    const matches: Array<{ time: string; index: number }> = [];
    
    let match;
    while ((match = timePattern.exec(summaryText)) !== null) {
      matches.push({
        time: match[1],
        index: match.index,
      });
    }
    
    // Split content by time points, but exclude the last time point
    // (last time point is usually followed by notes/recommendations, not content)
    if (matches.length > 1) {
      // Only process up to the second-to-last time point
      for (let i = 0; i < matches.length - 1; i++) {
        const currentMatch = matches[i];
        const nextMatch = matches[i + 1];
        
        // Get content between this time point and the next
        const startIndex = currentMatch.index + currentMatch.time.length;
        const endIndex = nextMatch.index;
        const content = summaryText.substring(startIndex, endIndex).trim();
        
        // Parse time to seconds
        const timePoint = parseTime(currentMatch.time);
        
        // Only add if we have valid content
        if (content && timePoint >= 0) {
          summaryNotes.push({
            timePoint,
            content,
          });
        }
      }
    } else if (matches.length === 1) {
      // If only one time point, include it (edge case)
      const currentMatch = matches[0];
      const startIndex = currentMatch.index + currentMatch.time.length;
      const content = summaryText.substring(startIndex).trim();
      const timePoint = parseTime(currentMatch.time);
      
      if (content && timePoint >= 0) {
        summaryNotes.push({
          timePoint,
          content,
        });
      }
    }
  }

  return {
    intro,
    summaryNotes,
  };
}

