import { useState, useEffect } from 'react';
import { Note, SortOption } from '../types';

const STORAGE_PREFIX = 'notepodcast_notes_';

/**
 * Hook for managing notes in localStorage
 */
export function useLocalStorage(podcastUrl: string) {
  const storageKey = `${STORAGE_PREFIX}${podcastUrl}`;
  
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
    }
  }, [notes, storageKey]);

  const addNote = (timePoint: number, content: string) => {
    const newNote: Note = {
      id: `${Date.now()}_${Math.random()}`,
      timePoint,
      content,
      createdAt: Date.now(),
    };
    setNotes(prev => [...prev, newNote]);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const getSortedNotes = (sortOption: SortOption): Note[] => {
    const sorted = [...notes];
    
    switch (sortOption) {
      case 'time':
        return sorted.sort((a, b) => a.timePoint - b.timePoint);
      case 'newest':
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      default:
        return sorted;
    }
  };

  return {
    notes,
    addNote,
    deleteNote,
    getSortedNotes,
  };
}

