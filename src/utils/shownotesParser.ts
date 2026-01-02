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
    // Split by lines and parse time-stamped entries
    const lines = summaryText.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for time patterns like "05:20 content" or "01:00:49 content"
      const timePatterns = [
        /^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/, // MM:SS or HH:MM:SS at start
        /^(\d{1,2}:\d{2})\s+(.+)$/, // MM:SS at start
      ];
      
      for (const pattern of timePatterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
          const timeStr = match[1];
          const content = match[2].trim();
          
          // Parse time to seconds
          const timePoint = parseTime(timeStr);
          
          if (content && timePoint >= 0) {
            summaryNotes.push({
              timePoint,
              content,
            });
            break;
          }
        }
      }
      
      // If no time pattern found but line has content, try to extract time from anywhere in the line
      if (!summaryNotes.length || summaryNotes[summaryNotes.length - 1].content !== trimmedLine) {
        const anyTimePattern = /(\d{1,2}:\d{2}(?::\d{2})?)/;
        const timeMatch = trimmedLine.match(anyTimePattern);
        if (timeMatch) {
          const timeStr = timeMatch[1];
          const content = trimmedLine.replace(timeMatch[0], '').trim();
          const timePoint = parseTime(timeStr);
          
          if (content && timePoint >= 0) {
            summaryNotes.push({
              timePoint,
              content,
            });
          }
        }
      }
    }
  }

  return {
    intro,
    summaryNotes,
  };
}

