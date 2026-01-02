import { TranslationLanguage } from '../types';

const ZHIPU_API_KEY = import.meta.env.VITE_ZHIPU_API_KEY;
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

const LANGUAGE_MAP: Record<TranslationLanguage, string> = {
  original: 'Original',
  chinese: 'Chinese',
  english: 'English',
  japanese: 'Japanese',
  korean: 'Korean',
  spanish: 'Spanish',
  french: 'French',
};

// Cache for translations
const translationCache = new Map<string, string>();

/**
 * Translates text to target language using ZhipuAI
 */
export async function translateText(
  text: string,
  targetLanguage: TranslationLanguage,
  timeout: number = 10000
): Promise<string> {
  if (targetLanguage === 'original') {
    return text;
  }

  const cacheKey = `${text}_${targetLanguage}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  if (!ZHIPU_API_KEY) {
    throw new Error('ZhipuAI API key not configured');
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
            content: `You are a professional translator. Translate the following text to ${LANGUAGE_MAP[targetLanguage]}. Only return the translated text, no explanations.\n\nText to translate:\n${text}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || 'Failed to translate text');
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim() || text;
    
    translationCache.set(cacheKey, translatedText);
    
    return translatedText;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Translation timed out. Please try again.');
    }
    if (error instanceof Error) {
      throw new Error(`Failed to translate text: ${error.message}`);
    }
    throw new Error('Failed to translate text. Please try again.');
  }
}
