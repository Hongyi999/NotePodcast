import { SummaryItem, AISummary } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';

/**
 * Generates AI summary for podcast with personalized title
 */
export async function generateAISummary(
  audioUrl: string,
  _index: number, // 1, 2, or 3 for the three AI summary tabs (currently unused but reserved for future use)
  timeout: number = 30000
): Promise<AISummary> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // First, get transcript using Whisper
    const transcript = await generateTranscript(audioUrl);
    
    // Generate summary with personalized title using GPT
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

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: `Here is the podcast transcript:\n\n${transcript}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    const summaryText = data.choices[0]?.message?.content || '';
    
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

/**
 * Generates transcript from audio using Whisper API
 */
export async function generateTranscript(audioUrl: string, timeout: number = 60000): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Fetch audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch audio file');
    }
    
    const audioBlob = await audioResponse.blob();
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('model', 'whisper-1');

    const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: formData,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || 'Failed to generate transcript');
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Transcript generation timed out. Please try again.');
    }
    if (error instanceof Error) {
      throw new Error(`Failed to generate transcript: ${error.message}`);
    }
    throw new Error('Failed to generate transcript. Please try again.');
  }
}

/**
 * Summarizes podcast intro text to 2-3 sentences
 */
export async function summarizeIntro(introText: string, timeout: number = 10000): Promise<string> {
  if (!OPENAI_API_KEY) {
    // Fallback to simple truncation if no API key
    return introText.split('\n').slice(0, 3).join(' ').substring(0, 200) + '...';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes podcast introductions. Summarize the given podcast intro text into 2-3 concise sentences in Chinese, focusing on: 1) The guest(s) and their background, 2) The main topic or theme of this episode. Keep it brief and informative.',
          },
          {
            role: 'user',
            content: `Please summarize this podcast introduction:\n\n${introText}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 150,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || 'Failed to summarize intro');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || introText;
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
 * Transcribes voice input using Whisper API
 */
export async function transcribeVoice(audioBlob: Blob, timeout: number = 10000): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice.wav');
    formData.append('model', 'whisper-1');

    const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: formData,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || 'Failed to transcribe voice');
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Voice transcription timed out. Please try again.');
    }
    if (error instanceof Error) {
      throw new Error(`Failed to transcribe voice: ${error.message}`);
    }
    throw new Error('Failed to transcribe voice. Please try again.');
  }
}


