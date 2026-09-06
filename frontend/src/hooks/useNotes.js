import { useState, useEffect, useCallback, useRef } from "react";
import { API_URL, authFetch } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const notesRef = useRef([]);
  notesRef.current = notes;

  const fetchNotes = useCallback(async (folderId) => {
    if (!user) return;
    setLoading(true);
    try {
      const url = folderId
        ? `${API_URL}/notes?folder_id=${folderId}`
        : `${API_URL}/notes`;
      const res = await authFetch(url);
      const data = await res.json();
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshNotes = useCallback(async () => {
    if (!user) return;
    const res = await authFetch(`${API_URL}/notes`);
    const data = await res.json();
    setNotes(data);
  }, [user]);

  const searchNotes = useCallback(async (q) => {
    if (!user || !q.trim()) return [];
    const res = await authFetch(`${API_URL}/notes/search?q=${encodeURIComponent(q)}`);
    return res.json();
  }, [user]);

  const getNote = useCallback(async (id) => {
    const cached = notesRef.current.find((n) => n.id === id);
    if (cached) return cached;
    const res = await authFetch(`${API_URL}/notes/${id}`);
    if (!res.ok) throw new Error("Note not found");
    return res.json();
  }, []);

  const createNote = useCallback(async (title, content, folderId) => {
    const res = await authFetch(`${API_URL}/notes`, {
      method: "POST",
      body: JSON.stringify({ title, content, folder_id: folderId || null }),
    });
    if (!res.ok) throw new Error("Failed to create note");
    const note = await res.json();
    setNotes((prev) => [note, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback(async (id, updates) => {
    const res = await authFetch(`${API_URL}/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update note");
    const updated = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    return updated;
  }, []);

  const deleteNote = useCallback(async (id) => {
    const res = await authFetch(`${API_URL}/notes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete note");
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const getLinks = useCallback(async (id) => {
    const res = await authFetch(`${API_URL}/notes/${id}/links`);
    return res.json();
  }, []);

  const getBacklinks = useCallback(async (id) => {
    const res = await authFetch(`${API_URL}/notes/${id}/backlinks`);
    return res.json();
  }, []);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user, fetchNotes]);

  return {
    notes, loading, fetchNotes, refreshNotes, searchNotes, getNote,
    createNote, updateNote, deleteNote, getLinks, getBacklinks,
  };
}