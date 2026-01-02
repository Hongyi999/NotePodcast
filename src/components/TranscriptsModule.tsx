import React, { useState, useEffect } from 'react';
import { TranslationLanguage } from '../types';
import { translateText } from '../services/translation';
import './TranscriptsModule.css';

interface TranscriptsModuleProps {
  transcript: string | null;
  isLoading: boolean;
  error: string | null;
}

const TRANSLATION_LANGUAGES: { value: TranslationLanguage; label: string }[] = [
  { value: 'original', label: 'Original Text' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'english', label: 'English' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
];

export function TranscriptsModule({ transcript, isLoading, error }: TranscriptsModuleProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<TranslationLanguage>('original');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedLanguage === 'original' || !transcript) {
      setTranslatedText(null);
      setTranslationError(null);
      return;
    }

    const performTranslation = async () => {
      setIsTranslating(true);
      setTranslationError(null);

      try {
        const translated = await translateText(transcript, selectedLanguage);
        setTranslatedText(translated);
      } catch (err) {
        setTranslationError('Translation failed, please try again');
        console.error('Translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    };

    performTranslation();
  }, [selectedLanguage, transcript]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value as TranslationLanguage);
  };

  const displayText = selectedLanguage === 'original' ? transcript : translatedText;

  return (
    <div className="transcripts-module">
      <h2 className="module-title">Podcast Transcripts</h2>

      {transcript && (
        <div className="translation-controls">
          <select
            className="translation-dropdown apple-dropdown"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            disabled={isTranslating || isLoading}
          >
            {TRANSLATION_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          {isTranslating && (
            <span className="translating-indicator">Translating...</span>
          )}
        </div>
      )}

      <div className="transcript-content hidden-scrollbar">
        {isLoading && (
          <div className="transcript-loading">
            <p>Transcript loading...</p>
          </div>
        )}

        {error && (
          <div className="transcript-error">
            <p>Transcript loading failed</p>
          </div>
        )}

        {translationError && (
          <div className="translation-error">
            <p>{translationError}</p>
          </div>
        )}

        {!isLoading && !error && displayText && (
          <div className="transcript-text">
            {displayText.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}

        {!isLoading && !error && !transcript && (
          <div className="transcript-empty">
            <p>No transcript available</p>
          </div>
        )}
      </div>
    </div>
  );
}

