import { useState, useEffect, useCallback, useRef } from "react";
import { Note, NoteLink } from "@/types";
import { API_URL } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function useNotes() {
  const { token } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const notesRef = useRef<Note[]>([]);
  notesRef.current = notes;

  const headers = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchNotes = useCallback(async (folderId?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const url = folderId
        ? `${API_URL}/notes?folder_id=${folderId}`
        : `${API_URL}/notes`;
      const res = await fetch(url, { headers: headers() });
      const data = await res.json();
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  const refreshNotes = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/notes`, { headers: headers() });
    const data = await res.json();
    setNotes(data);
  }, [token, headers]);

  const searchNotes = useCallback(async (q: string): Promise<Note[]> => {
    if (!token || !q.trim()) return [];
    const res = await fetch(
      `${API_URL}/notes/search?q=${encodeURIComponent(q)}`,
      { headers: headers() }
    );
    return res.json();
  }, [token, headers]);

  const getNote = useCallback(async (id: string): Promise<Note> => {
    const cached = notesRef.current.find((n) => n.id === id);
    if (cached) return cached;
    const res = await fetch(`${API_URL}/notes/${id}`, { headers: headers() });
    if (!res.ok) throw new Error("Note not found");
    return res.json();
  }, [headers]);

  const createNote = useCallback(async (title: string, content: string, folderId?: string) => {
    const res = await fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify({ title, content, folder_id: folderId || null }),
    });
    if (!res.ok) throw new Error("Failed to create note");
    const note = await res.json();
    setNotes((prev) => [note, ...prev]);
    return note;
  }, [headers]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    const res = await fetch(`${API_URL}/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update note");
    const updated = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    return updated;
  }, [headers]);

  const deleteNote = useCallback(async (id: string) => {
    const res = await fetch(`${API_URL}/notes/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to delete note");
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, [headers]);

  const getLinks = useCallback(async (id: string): Promise<NoteLink[]> => {
    const res = await fetch(`${API_URL}/notes/${id}/links`, { headers: headers() });
    return res.json();
  }, [headers]);

  const getBacklinks = useCallback(async (id: string): Promise<NoteLink[]> => {
    const res = await fetch(`${API_URL}/notes/${id}/backlinks`, { headers: headers() });
    return res.json();
  }, [headers]);

  useEffect(() => {
    if (token) fetchNotes();
  }, [token, fetchNotes]);

  return {
    notes, loading, fetchNotes, refreshNotes, searchNotes, getNote,
    createNote, updateNote, deleteNote, getLinks, getBacklinks,
  };
}