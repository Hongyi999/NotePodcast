import { useState, useEffect } from 'react';
import { Note, SortOption } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const STORAGE_PREFIX = 'notepodcast_notes_';

/**
 * Hook for managing notes, switching between LocalStorage and Supabase
 * depending on authentication state.
 * Automatically migrates localStorage notes to Supabase on login.
 */
export function useNotes(podcastUrl: string) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMigrated, setHasMigrated] = useState(false);

  const storageKey = `${STORAGE_PREFIX}${podcastUrl}`;

  // Migration function: Move localStorage notes to Supabase
  const migrateLocalNotesToSupabase = async (localNotes: Note[]) => {
    if (!user || localNotes.length === 0) return [];

    console.log(`🔄 Migrating ${localNotes.length} local notes to Supabase...`);
    
    try {
      // Prepare notes for batch insert
      const notesToInsert = localNotes.map(note => ({
        user_id: user.id,
        podcast_url: podcastUrl,
        time_point: note.timePoint,
        content: note.content,
        created_at: new Date(note.createdAt).toISOString(),
      }));

      // Batch insert all notes
      const { data, error } = await supabase
        .from('notes')
        .insert(notesToInsert)
        .select();

      if (error) throw error;

      console.log(`✅ Successfully migrated ${data?.length || 0} notes`);

      // Clear localStorage after successful migration
      localStorage.removeItem(storageKey);
      
      return data || [];
    } catch (err) {
      console.error('❌ Error migrating notes:', err);
      throw err;
    }
  };

  // Fetch notes with automatic migration
  useEffect(() => {
    async function fetchNotes() {
      if (!podcastUrl) return;
      setLoading(true);
      setError(null);

      if (user) {
        try {
          // Step 1: Check if there are local notes to migrate
          const localNotesRaw = localStorage.getItem(storageKey);
          const localNotes: Note[] = localNotesRaw ? JSON.parse(localNotesRaw) : [];

          // Step 2: Migrate local notes if they exist and haven't been migrated yet
          if (localNotes.length > 0 && !hasMigrated) {
            console.log(`📦 Found ${localNotes.length} local notes, migrating...`);
            await migrateLocalNotesToSupabase(localNotes);
            setHasMigrated(true);
          }

          // Step 3: Fetch all notes from Supabase (including newly migrated ones)
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('podcast_url', podcastUrl)
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

          if (error) throw error;

          const mappedNotes: Note[] = (data || []).map((item: any) => ({
            id: item.id,
            timePoint: item.time_point,
            content: item.content,
            createdAt: new Date(item.created_at).getTime(),
          }));

          setNotes(mappedNotes);
          console.log(`📝 Loaded ${mappedNotes.length} notes from Supabase`);
        } catch (err) {
          console.error('Error fetching/migrating notes:', err);
          setError('Failed to load notes from cloud.');
        }
      } else {
        // Not logged in: fetch from LocalStorage
        try {
          const item = localStorage.getItem(storageKey);
          const localNotes = item ? JSON.parse(item) : [];
          setNotes(localNotes);
          console.log(`📝 Loaded ${localNotes.length} notes from localStorage`);
        } catch {
          setNotes([]);
        }
      }
      setLoading(false);
    }

    fetchNotes();
  }, [user, podcastUrl, storageKey, hasMigrated]);

  // Sync to LocalStorage when not logged in
  useEffect(() => {
    if (!user && podcastUrl) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(notes));
      } catch (error) {
        console.error('Failed to save notes to localStorage:', error);
      }
    }
  }, [notes, user, podcastUrl, storageKey]);

  /**
   * Adds a note.
   * Returns 'success' if added, 'limit_reached' if limit exceeded, 'error' if failed.
   */
  const addNote = async (timePoint: number, content: string): Promise<'success' | 'limit_reached' | 'error'> => {
    if (!user) {
      // Check limit for non-logged in users
      if (notes.length >= 10) {
        return 'limit_reached';
      }

      const newNote: Note = {
        id: `${Date.now()}_${Math.random()}`,
        timePoint,
        content,
        createdAt: Date.now(),
      };
      setNotes((prev) => [...prev, newNote]);
      return 'success';
    } else {
      // Add to Supabase
      try {
        const newNotePayload = {
          user_id: user.id,
          podcast_url: podcastUrl,
          time_point: timePoint,
          content: content,
        };

        const { data, error } = await supabase
          .from('notes')
          .insert([newNotePayload])
          .select()
          .single();

        if (error) throw error;

        const newNote: Note = {
          id: data.id,
          timePoint: data.time_point,
          content: data.content,
          createdAt: new Date(data.created_at).getTime(),
        };
        setNotes((prev) => [...prev, newNote]);
        return 'success';
      } catch (err) {
        console.error('Error adding note to Supabase:', err);
        return 'error';
      }
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } else {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        setNotes((prev) => prev.filter((note) => note.id !== id));
      } catch (err) {
        console.error('Error deleting note from Supabase:', err);
      }
    }
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

  const fetchAllHistoryNotes = async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching history:', err);
      return [];
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    deleteNote,
    getSortedNotes,
    fetchAllHistoryNotes
  };
}
