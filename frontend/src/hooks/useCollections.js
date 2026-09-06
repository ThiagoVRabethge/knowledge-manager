import { useState, useEffect, useCallback } from "react";
import { API_URL, authFetch } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function useCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCollections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/collections`);
      const data = await res.json();
      setCollections(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCollection = useCallback(async (name) => {
    const res = await authFetch(`${API_URL}/collections`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create collection");
    const created = await res.json();
    setCollections((prev) => [created, ...prev]);
    return created;
  }, []);

  const deleteCollection = useCallback(async (id) => {
    const res = await authFetch(`${API_URL}/collections/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete collection");
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCollection = useCallback(async (id, name) => {
    const res = await authFetch(`${API_URL}/collections/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to update collection");
    const updated = await res.json();
    setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const createItem = useCallback(async (collectionId, title, url, description) => {
    const res = await authFetch(`${API_URL}/collections/${collectionId}/items`, {
      method: "POST",
      body: JSON.stringify({ title, url, description }),
    });
    if (!res.ok) throw new Error("Failed to create item");
    return res.json();
  }, []);

  const deleteItem = useCallback(async (itemId) => {
    const res = await authFetch(`${API_URL}/collections/items/${itemId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete item");
  }, []);

  const getCollection = useCallback(async (id) => {
    const res = await authFetch(`${API_URL}/collections/${id}`);
    if (!res.ok) throw new Error("Collection not found");
    return res.json();
  }, []);

  useEffect(() => {
    if (user) fetchCollections();
  }, [user, fetchCollections]);

  return {
    collections, loading, fetchCollections,
    createCollection, deleteCollection, updateCollection,
    createItem, deleteItem, getCollection,
  };
}