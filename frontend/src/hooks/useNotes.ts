import { useState, useEffect, useCallback } from "react";
import { Note, NoteLink } from "@/types";
import { API_URL } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function useNotes() {
  const { token } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async (folderId?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const url = folderId
        ? `${API_URL}/notes?folder_id=${folderId}`
        : `${API_URL}/notes`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refreshNotes = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/notes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotes(data);
  }, [token]);

  const searchNotes = async (q: string): Promise<Note[]> => {
    const res = await fetch(
      `${API_URL}/notes/search?q=${encodeURIComponent(q)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json();
  };

  const getNote = async (id: string): Promise<Note> => {
    const res = await fetch(`${API_URL}/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Note not found");
    return res.json();
  };

  const createNote = async (title: string, content: string, folderId?: string) => {
    const res = await fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content, folder_id: folderId || null }),
    });
    if (!res.ok) throw new Error("Failed to create note");
    const note = await res.json();
    await refreshNotes();
    return note;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const res = await fetch(`${API_URL}/notes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update note");
    const updated = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    return updated;
  };

  const deleteNote = async (id: string) => {
    const res = await fetch(`${API_URL}/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete note");
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const getLinks = async (id: string): Promise<NoteLink[]> => {
    const res = await fetch(`${API_URL}/notes/${id}/links`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  };

  const getBacklinks = async (id: string): Promise<NoteLink[]> => {
    const res = await fetch(`${API_URL}/notes/${id}/backlinks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  };

  useEffect(() => {
    if (token) fetchNotes();
  }, [token, fetchNotes]);

  return {
    notes, loading, fetchNotes, refreshNotes, searchNotes, getNote,
    createNote, updateNote, deleteNote, getLinks, getBacklinks,
  };
}
