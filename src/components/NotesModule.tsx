import React, { useState, useRef } from 'react';
import { Note, SortOption } from '../types';
import { formatTime } from '../utils/timeFormatter';
import { transcribeVoice } from '../services/zhipuApi';
import './NotesModule.css';

interface NotesModuleProps {
  sortedNotes: Note[];
  sortOption: SortOption;
  currentTime: number;
  onAddNote: (timePoint: number, content: string) => void;
  onDeleteNote: (id: string) => void;
  onSortChange: (option: SortOption) => void;
  onTimePointClick: (time: number) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'time', label: 'Sort by Audio Time' },
  { value: 'newest', label: 'Sort by Publish Time - Newest' },
  { value: 'oldest', label: 'Sort by Publish Time - Oldest' },
];

export function NotesModule({
  sortedNotes,
  sortOption,
  currentTime,
  onAddNote,
  onDeleteNote,
  onSortChange,
  onTimePointClick,
}: NotesModuleProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    onAddNote(currentTime, inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setIsTranscribing(true);
        
        try {
          const transcript = await transcribeVoice(audioBlob);
          setInputValue(transcript);
        } catch (error) {
          console.error('Failed to transcribe voice:', error);
          const errorMessage = error instanceof Error ? error.message : 'Voice transcription failed. Please try again.';
          alert(errorMessage);
        } finally {
          setIsTranscribing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleNoteClick = (note: Note) => {
    onTimePointClick(note.timePoint);
  };

  const handleDeleteClick = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    onDeleteNote(noteId);
  };

  return (
    <div className="notes-module">
      <h2 className="module-title">My Notes</h2>

      <div className="sort-controls">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`sort-button apple-button-text ${sortOption === option.value ? 'active' : ''}`}
            onClick={() => onSortChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="notes-list hidden-scrollbar">
        {sortedNotes.length === 0 ? (
          <div className="empty-state">No notes yet. Add your first note below!</div>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className="note-card"
              onClick={() => handleNoteClick(note)}
            >
              <div className="note-content">
                <span className="note-time">[{formatTime(note.timePoint)}]</span>
                <span className="note-text">{note.content}</span>
              </div>
              <button
                className="delete-button"
                onClick={(e) => handleDeleteClick(e, note.id)}
                aria-label="Delete note"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 4 L12 12 M12 4 L4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="note-input-bar">
        <input
          type="text"
          className="note-input apple-input"
          placeholder="Enter your thoughts on the current time point..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isTranscribing}
        />
        <button
          className={`voice-button ${isRecording ? 'recording' : ''} ${isTranscribing ? 'transcribing' : ''}`}
          onClick={handleVoiceButtonClick}
          disabled={isTranscribing}
          aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        >
          {isTranscribing ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="12.566" strokeDashoffset="6.283">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 10 10"
                  to="360 10 10"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2C8.34 2 7 3.34 7 5V9C7 10.66 8.34 12 10 12C11.66 12 13 10.66 13 9V5C13 3.34 11.66 2 10 2Z"
                fill="currentColor"
              />
              <path
                d="M5 9C5 12.31 7.69 15 11 15V17H9V19H11C12.1 19 13 18.1 13 17V15C16.31 15 19 12.31 19 9H17C17 11.76 14.76 14 12 14H8C5.24 14 3 11.76 3 9H5Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
        <button
          className="apple-button-text confirm-note-button"
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isTranscribing}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

