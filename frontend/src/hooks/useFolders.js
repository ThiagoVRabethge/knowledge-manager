import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function useFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFolders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/folders`, { credentials: "include" });
      const data = await res.json();
      setFolders(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTree = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/folders/tree`, { credentials: "include" });
      const data = await res.json();
      setTree(data);
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const createFolder = useCallback(async (name, parentId) => {
    const res = await fetch(`${API_URL}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, parent_id: parentId || null }),
    });
    if (!res.ok) throw new Error("Failed to create folder");
    await fetchTree();
    await fetchFolders();
    return res.json();
  }, [fetchTree, fetchFolders]);

  const deleteFolder = useCallback(async (id) => {
    const res = await fetch(`${API_URL}/folders/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete folder");
    await fetchTree();
    await fetchFolders();
  }, [fetchTree, fetchFolders]);

  useEffect(() => {
    if (user) {
      fetchFolders();
      fetchTree();
    }
  }, [user, fetchFolders, fetchTree]);

  return { folders, tree, loading, createFolder, deleteFolder, refresh: fetchTree };
}