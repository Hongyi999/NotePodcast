import { SummaryItem, AISummary, TranscriptItem } from '../types';

const ZHIPU_API_KEY = import.meta.env.VITE_ZHIPU_API_KEY;
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

/**
 * Generates AI summary for podcast with personalized title using ZhipuAI
 */
export async function generateAISummary(
  audioUrl: string,
  index: number,
  context?: { title?: string; description?: string; shownotes?: string },
  timeout: number = 90000
): Promise<AISummary> {
  if (!ZHIPU_API_KEY) {
    throw new Error('ZhipuAI API key not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Define different focus areas for each summary tab
    const focusAreas = [
      { 
        theme: '核心观点与主要论述',
        description: '分析播客中嘉宾表达的核心观点、主要论点和思想体系。',
        example: 'TITLE: [具体的主题标题]\n\n[MM:SS] 核心观点描述...'
      },
      {
        theme: '关键人物与故事',
        description: '提取播客中提到的重要人物、人物故事、案例分析和具体事件。',
        example: 'TITLE: [人物与经历标题]\n\n[MM:SS] 关键情节描述...'
      },
      {
        theme: '知识点与深度解析',
        description: '归纳播客中涉及的专业知识、理论框架、学术概念和深度分析。',
        example: 'TITLE: [知识要点标题]\n\n[MM:SS] 知识点详细解析...'
      }
    ];
    
    const currentFocus = focusAreas[index - 1];
    
    const contextInfo = context ? `
播客标题: ${context.title || '未知'}
内容简介: ${context.description || '无'}
详细介绍 (Shownotes): 
${context.shownotes || '无'}
` : '';

    const prompt = `你是一位专业的播客内容分析师。请基于以下提供的播客上下文信息，生成一个针对"${currentFocus.theme}"维度的深度定制化总结。

【播客上下文信息】
${contextInfo}
音频链接: ${audioUrl}

任务要求：
1. **深度定制化标题**：根据播客的实际内容，为"${currentFocus.theme}"这一主题生成一个具体的、有吸引力的标题（5-12个字）。禁止使用通用标题。
   - ❌ 不要使用通用标题如"核心观点"、"人物故事"
   - ✅ 要使用具体标题如"鲁豫与鸟鸟：社交恐惧与文本创作"、"从地质学到脱口秀的身份重塑"

2. **内容提取**：${currentFocus.description}。必须紧扣播客的实际内容。

3. **格式要求**：
   - 第一行必须是：TITLE: [你的个性化标题]
   - 之后每一行是一个时点条目，格式：[时间] 内容描述（50-120字）
   - 时间格式：MM:SS 或 HH:MM:SS
   - 提取 5-8 个关键时点

4. **示例格式**：
${currentFocus.example}

请注意：
- 标题要与播客内容极其紧密相关
- 每个时点的内容要具体、有深度，不要泛泛而谈
- 时间戳尽量基于 Shownotes 内容进行准确对应
- 内容要用中文表述，简洁清晰

现在请开始分析并生成总结：`;

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
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const summaryText = data.choices?.[0]?.message?.content || '';
    
    if (!summaryText) {
      throw new Error('No summary generated from ZhipuAI API');
    }
    
    const parsedSummary = parseAISummaryText(summaryText);
    
    // Fallback title if parsing failed
    if (!parsedSummary.title || parsedSummary.title === 'AI Summary') {
      const fallbackTitles = ['AI关键词 - 核心观点', 'AI关键词 - 重要人物', 'AI关键词 - 知识要点'];
      parsedSummary.title = fallbackTitles[index - 1];
    }
    
    return parsedSummary;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI 总结生成超时，请重试');
    }
    if (error instanceof Error) {
      throw new Error(`AI 总结生成失败: ${error.message}`);
    }
    throw new Error('AI 总结生成失败，请重试');
  }
}

/**
 * Generates transcript from audio - using ZhipuAI to "reconstruct" a transcript
 * based on the podcast context (shownotes, etc.) if real transcription is unavailable.
 */
export async function generateTranscript(
  _audioUrl: string, 
  context?: { title?: string; shownotes?: string },
  timeout: number = 90000
): Promise<TranscriptItem[]> {
  if (!ZHIPU_API_KEY) {
    throw new Error('ZhipuAI API key not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const contextInfo = context ? `
播客标题: ${context.title || '未知'}
详细介绍 (Shownotes): 
${context.shownotes || '无'}
` : '';

    const prompt = `你是一位顶尖的播客内容分析师和文字记录员。

任务：
请根据我提供的播客信息，生成一份极其详尽、还原度极高的“虚拟逐字稿文字记录”。

要求：
1. **内容深度还原**：不要只写标题！必须根据 Shownotes 中的每一项，脑补还原出播客中可能出现的对话细节。每一段内容要求在 100-200 字左右，包含主持人与嘉宾的互动感。
2. **严格的时点标记**：每个段落必须以 [MM:SS] 或 [HH:MM:SS] 格式开头。
3. **分段频率**：必须每隔约 1-2 分钟生成一个时点条目，确保覆盖整个播客的时长。
4. **输出格式**：
   [MM:SS] 内容正文
   [MM:SS] 内容正文
   ...
5. **禁止项**：禁止只输出时点而没有内容，禁止输出空行。

播客背景信息：
${contextInfo}

请生成这份带有精准时点的详尽逐字稿：`;

    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'glm-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4095, // Maximize output
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse the generated content into TranscriptItems with more robust regex
    const items: TranscriptItem[] = [];
    const lines = content.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    
    for (const line of lines) {
      // Improved regex to handle cases like "[03:20] ]" or "[03:20] Content" or "03:20 Content"
      const match = line.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?[\s\]]*(.+)$/);
      if (match) {
        const timeStr = match[1];
        let textContent = match[2].trim();
        
        // Final cleaning: if textContent starts with a stray bracket, remove it
        if (textContent.startsWith(']')) textContent = textContent.substring(1).trim();
        
        if (textContent) {
          const timeParts = timeStr.split(':').map(Number);
          let seconds = 0;
          if (timeParts.length === 2) seconds = timeParts[0] * 60 + timeParts[1];
          else if (timeParts.length === 3) seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
          
          items.push({
            timePoint: seconds,
            content: textContent
          });
        }
      }
    }
    
    // If parsing failed to get any meaningful items, try one more simple fallback
    if (items.length === 0 && content.length > 50) {
      return [{ timePoint: 0, content: content }];
    }
    
    return items;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Failed to generate transcript:', error);
    return [{ timePoint: 0, content: '文字记录生成失败，请稍后重试' }];
  }
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
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  let title = 'AI Summary';
  const items: SummaryItem[] = [];
  
  // Try to extract title from TITLE: prefix
  const titleMatch = text.match(/TITLE:\s*(.+?)(?:\n|$)/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  } else if (lines.length > 0) {
    // If no TITLE: prefix, check if first line looks like a title (no time stamp)
    const firstLine = lines[0];
    if (!firstLine.match(/^\[?\d{1,2}:\d{2}/)) {
      title = firstLine;
    }
  }
  
  // Parse time-stamped items
  for (const line of lines) {
    // Skip the title line
    if (line === title || line.startsWith('TITLE:')) continue;
    
    // Match patterns like "[05:20]" or "05:20" at the start
    const timeMatch = line.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+(.+)$/);
    if (timeMatch) {
      const timeStr = timeMatch[1];
      const content = timeMatch[2].trim();
      
      // Parse time string to seconds
      const timeParts = timeStr.split(':').map(Number);
      let seconds = 0;
      if (timeParts.length === 2) {
        // MM:SS format
        seconds = timeParts[0] * 60 + timeParts[1];
      } else if (timeParts.length === 3) {
        // HH:MM:SS format
        seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      }
      
      if (content && seconds >= 0) {
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

