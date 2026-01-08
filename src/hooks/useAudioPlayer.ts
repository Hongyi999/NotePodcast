import { useState, useRef, useEffect } from 'react';

export function useAudioPlayer(audioUrl: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!audioUrl) {
      // Reset state when no URL
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous'; // Allow CORS for audio
    
    // Set source after creating audio element
    audio.src = audioUrl;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    let lastUpdateTime = 0;
    const handleTimeUpdate = () => {
      // Throttle time updates to prevent excessive re-renders
      const now = Date.now();
      if (now - lastUpdateTime >= 100) { // Update at most every 100ms
        setCurrentTime(audio.currentTime);
        lastUpdateTime = now;
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', audio.error, e);
      let errorMsg = 'Podcast audio loading failed, please check if the URL is valid';
      
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMsg = 'Audio loading was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMsg = 'Network error while loading audio';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMsg = 'Audio decoding error';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMsg = 'Audio format not supported';
            break;
          default:
            errorMsg = `Audio error: ${audio.error.message || 'Unknown error'}`;
        }
      }
      
      setError(errorMsg);
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    // Try to load the audio
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.pause();
      audio.src = '';
      audio.load(); // Reset the audio element
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setError(null);
          })
          .catch(err => {
            console.error('Failed to play audio:', err);
            setError('Failed to play audio. Please check if the audio format is supported.');
            setIsPlaying(false);
          });
      } else {
        // Fallback for older browsers
        setIsPlaying(true);
      }
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  return {
    isPlaying,
    currentTime,
    duration,
    speed,
    error,
    isLoading,
    togglePlayPause,
    seek,
    changeSpeed,
  };
}

