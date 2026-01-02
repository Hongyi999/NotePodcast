import { SummaryItem, AISummary } from '../types';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
// Using Gemini API - adjust endpoint based on your API key type
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`;

/**
 * Generates AI summary for podcast with personalized title using Google Gemini
 */
export async function generateAISummary(
  audioUrl: string,
  _index: number,
  timeout: number = 60000
): Promise<AISummary> {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Note: Transcript generation requires backend - using empty for now
    // You can implement a backend service to get transcript from audio
    const transcript = await generateTranscript(audioUrl).catch(() => '');
    
    // Generate summary with personalized title using Gemini
    // If no transcript, we'll use a simplified prompt
    const prompt = `Analyze this podcast transcript and create a personalized summary category with a custom title.

Instructions:
1. Based on the content of this podcast, identify a unique and meaningful category for summarizing key points
2. Generate a concise, descriptive title for this category (in Chinese or English, matching the podcast language). The title should be specific to this podcast's content, not generic like "Core Views" or "Key Points"
3. Extract key items from the transcript that fit this category, each with its approximate timestamp in MM:SS or HH:MM:SS format
4. Format the response as:
   TITLE: [your personalized title here]
   
   [MM:SS] First item content (under 100 words)
   [MM:SS] Second item content (under 100 words)
   ... (continue for all relevant items)

Example format:
TITLE: 女性主义思想与个人成长

05:20 童年时期的名字没有性别色彩，反映了时代对个体的影响
10:34 随母姓是自然的选择，但许多女性在婚姻中失去自己的姓氏
...`;

    const requestBody = transcript 
      ? `${prompt}\n\nHere is the podcast transcript:\n\n${transcript}`
      : `${prompt}\n\nNote: Transcript is not available. Please analyze based on the podcast audio URL: ${audioUrl}. Generate a personalized summary category title and key points with estimated timestamps.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: requestBody,
          }],
        }],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    const summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!summaryText) {
      throw new Error('No summary generated from Gemini API');
    }
    
    // Parse summary text to extract title and items
    return parseAISummaryText(summaryText);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Summary generation timed out. Please try again.');
    }
    if (error instanceof Error) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
    throw new Error('Failed to generate summary. Please try again.');
  }
}

/**
 * Generates transcript from audio using Google Cloud Speech-to-Text API
 * Note: This requires the audio to be accessible via URL and may need backend proxy
 * For now, we'll return an empty string as placeholder - in production you'd need backend
 */
export async function generateTranscript(_audioUrl: string, _timeout: number = 60000): Promise<string> {
  // Google Cloud Speech-to-Text requires server-side implementation
  // For client-side, we'll return empty string as placeholder
  // In production, you'd need a backend proxy to handle audio transcription
  // This function is called but transcript is not required for summary generation
  // You can implement a backend service to handle this
  return '';
}

/**
 * Summarizes podcast intro text to 2-3 sentences using Google Gemini
 */
export async function summarizeIntro(introText: string, timeout: number = 10000): Promise<string> {
  if (!GOOGLE_API_KEY) {
    // Fallback to simple truncation if no API key
    return introText.split('\n').slice(0, 3).join(' ').substring(0, 200) + '...';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful assistant that summarizes podcast introductions. Summarize the given podcast intro text into 2-3 concise sentences in Chinese, focusing on: 1) The guest(s) and their background, 2) The main topic or theme of this episode. Keep it brief and informative.\n\nPlease summarize this podcast introduction:\n\n${introText}`,
          }],
        }],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || 'Failed to summarize intro');
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || introText;
    return summary;
  } catch (error) {
    clearTimeout(timeoutId);
    // Fallback to simple truncation on error
    if (error instanceof Error && error.name === 'AbortError') {
      return introText.split('\n').slice(0, 3).join(' ').substring(0, 200) + '...';
    }
    return introText.split('\n').slice(0, 3).join(' ').substring(0, 200) + '...';
  }
}

/**
 * Transcribes voice input - placeholder for Google Speech-to-Text
 * Note: Requires backend implementation
 */
export async function transcribeVoice(_audioBlob: Blob, _timeout: number = 10000): Promise<string> {
  // Google Cloud Speech-to-Text requires server-side implementation
  // For now, return empty string - you'd need backend service for this
  throw new Error('Voice transcription requires backend implementation with Google Cloud Speech-to-Text API. Please use a backend service or Web Speech API.');
}

/**
 * Parses AI summary text to extract title and items
 */
function parseAISummaryText(text: string): AISummary {
  const lines = text.split('\n').filter(line => line.trim());
  
  let title = 'AI Summary'; // Default title
  const items: SummaryItem[] = [];
  
  // Extract title (should be on first line or after "TITLE:")
  const titleMatch = text.match(/TITLE:\s*(.+)/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  } else if (lines.length > 0 && !lines[0].match(/^\d{1,2}:/)) {
    // First line might be title if it doesn't start with time
    title = lines[0].trim();
  }
  
  // Parse items (skip title line if found)
  const startIndex = titleMatch ? 1 : (lines[0] === title ? 1 : 0);
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Match time pattern: "MM:SS content" or "HH:MM:SS content"
    const timeMatch = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/);
    if (timeMatch) {
      const timeStr = timeMatch[1];
      const content = timeMatch[2].trim();
      
      // Parse time to seconds
      const timeParts = timeStr.split(':').map(Number);
      let seconds = 0;
      if (timeParts.length === 2) {
        seconds = timeParts[0] * 60 + timeParts[1];
      } else if (timeParts.length === 3) {
        seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      }
      
      if (content) {
        items.push({
          timePoint: seconds,
          content,
        });
      }
    }
  }
  
  return {
    title: title || 'AI Summary',
    items,
  };
}

