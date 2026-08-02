import { useState, useEffect, useCallback } from "react";
import { Folder, FolderTree } from "@/types";
import { API_URL } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function useFolders() {
  const { token } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tree, setTree] = useState<FolderTree[]>([]);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchFolders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/folders`, { headers });
      const data = await res.json();
      setFolders(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchTree = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/folders/tree`, { headers });
      const data = await res.json();
      setTree(data);
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const createFolder = async (name: string, parentId?: string) => {
    const res = await fetch(`${API_URL}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, parent_id: parentId || null }),
    });
    if (!res.ok) throw new Error("Failed to create folder");
    await fetchTree();
    await fetchFolders();
    return res.json();
  };

  const deleteFolder = async (id: string) => {
    const res = await fetch(`${API_URL}/folders/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete folder");
    await fetchTree();
    await fetchFolders();
  };

  useEffect(() => {
    if (token) {
      fetchFolders();
      fetchTree();
    }
  }, [token, fetchFolders, fetchTree]);

  return { folders, tree, loading, createFolder, deleteFolder, refresh: fetchTree };
}
