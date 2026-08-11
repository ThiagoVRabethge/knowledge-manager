import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function useCollections() {
  const { token } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchCollections = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/collections`, { headers: headers() });
      const data = await res.json();
      setCollections(data);
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  const createCollection = useCallback(async (name) => {
    const res = await fetch(`${API_URL}/collections`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create collection");
    const created = await res.json();
    setCollections((prev) => [created, ...prev]);
    return created;
  }, [headers]);

  const deleteCollection = useCallback(async (id) => {
    const res = await fetch(`${API_URL}/collections/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to delete collection");
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, [headers]);

  const updateCollection = useCallback(async (id, name) => {
    const res = await fetch(`${API_URL}/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to update collection");
    const updated = await res.json();
    setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, [headers]);

  const createItem = useCallback(async (collectionId, title, url, description) => {
    const res = await fetch(`${API_URL}/collections/${collectionId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify({ title, url, description }),
    });
    if (!res.ok) throw new Error("Failed to create item");
    return res.json();
  }, [headers]);

  const deleteItem = useCallback(async (itemId) => {
    const res = await fetch(`${API_URL}/collections/items/${itemId}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to delete item");
  }, [headers]);

  const getCollection = useCallback(async (id) => {
    const res = await fetch(`${API_URL}/collections/${id}`, { headers: headers() });
    if (!res.ok) throw new Error("Collection not found");
    return res.json();
  }, [headers]);

  useEffect(() => {
    if (token) fetchCollections();
  }, [token, fetchCollections]);

  return {
    collections, loading, fetchCollections,
    createCollection, deleteCollection, updateCollection,
    createItem, deleteItem, getCollection,
  };
}
