/**
 * Formats seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parses MM:SS or HH:MM:SS format to seconds
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  
  return 0;
}

/**
 * Formats time range as "current / total"
 */
export function formatTimeRange(current: number, total: number): string {
  return `${formatTime(current)} / ${formatTime(total)}`;
}

