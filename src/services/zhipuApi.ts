import { SummaryItem, AISummary } from '../types';

const ZHIPU_API_KEY = import.meta.env.VITE_ZHIPU_API_KEY;
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

/**
 * Generates AI summary for podcast with personalized title using ZhipuAI
 */
export async function generateAISummary(
  audioUrl: string,
  _index: number,
  timeout: number = 60000
): Promise<AISummary> {
  if (!ZHIPU_API_KEY) {
    throw new Error('ZhipuAI API key not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Note: ZhipuAI doesn't have audio transcription API
    // For now, we'll generate summary without transcript
    // You may need to use a separate service for transcription
    const transcript = await generateTranscript(audioUrl).catch(() => '');
    
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

    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'user',
            content: requestBody,
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
    const summaryText = data.choices?.[0]?.message?.content || '';
    
    if (!summaryText) {
      throw new Error('No summary generated from ZhipuAI API');
    }
    
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
 * Generates transcript from audio - placeholder for ZhipuAI
 * Note: ZhipuAI doesn't provide audio transcription API
 * You may need to use OpenAI Whisper or another service
 */
export async function generateTranscript(_audioUrl: string, _timeout: number = 60000): Promise<string> {
  // ZhipuAI doesn't have audio transcription API
  // Return empty string as placeholder
  // You can integrate OpenAI Whisper or another transcription service here
  return '';
}

/**
 * Summarizes podcast intro text to 2-3 sentences using ZhipuAI
 */
export async function summarizeIntro(introText: string, timeout: number = 10000): Promise<string> {
  if (!ZHIPU_API_KEY) {
    return introText.split('\n').slice(0, 3).join(' ').substring(0, 200) + '...';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'glm-3-turbo',
        messages: [
          {
            role: 'user',
            content: `You are a helpful assistant that summarizes podcast introductions. Summarize the given podcast intro text into 2-3 concise sentences in Chinese, focusing on: 1) The guest(s) and their background, 2) The main topic or theme of this episode. Keep it brief and informative.\n\nPlease summarize this podcast introduction:\n\n${introText}`,
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
    const summary = data.choices?.[0]?.message?.content?.trim() || introText;
    return summary;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return introText.split('\n').slice(0, 3).join(' ').substring(0, 200) + '...';
    }
    return introText.split('\n').slice(0, 3).join(' ').substring(0, 200) + '...';
  }
}

/**
 * Transcribes voice input - placeholder for ZhipuAI
 * Note: ZhipuAI doesn't provide voice transcription API
 * Uses Web Speech API as fallback
 */
export async function transcribeVoice(_audioBlob: Blob, _timeout: number = 10000): Promise<string> {
  // ZhipuAI doesn't have voice transcription API
  // Use Web Speech API as fallback
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Voice transcription is not supported in this browser. ZhipuAI does not provide audio transcription API.'));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      // Recognition ended
    };

    recognition.start();
  });
}

/**
 * Parses AI summary text to extract title and items
 */
function parseAISummaryText(text: string): AISummary {
  const lines = text.split('\n').filter(line => line.trim());
  
  let title = 'AI Summary';
  const items: SummaryItem[] = [];
  
  const titleMatch = text.match(/TITLE:\s*(.+)/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  } else if (lines.length > 0 && !lines[0].match(/^\d{1,2}:/)) {
    title = lines[0].trim();
  }
  
  const startIndex = titleMatch ? 1 : (lines[0] === title ? 1 : 0);
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const timeMatch = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/);
    if (timeMatch) {
      const timeStr = timeMatch[1];
      const content = timeMatch[2].trim();
      
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

