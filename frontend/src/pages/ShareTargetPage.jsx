import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useNotes } from "@/hooks/useNotes";
import { useCollections } from "@/hooks/useCollections";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, FileText, FolderHeart } from "lucide-react";

const SHARE_STORAGE_KEY = "share_target_pending";

export default function ShareTargetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createNote } = useNotes();
  const { collections, createItem } = useCollections();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("note");
  const [selectedCollection, setSelectedCollection] = useState("");

  // Persiste/recupera dados do share para sobreviver a recarregamentos/login
  useEffect(() => {
    const t = searchParams.get("title") || "";
    const u = searchParams.get("url") || "";
    const txt = searchParams.get("text") || "";

    if (t || u || txt) {
      let cleanText = txt;
      if (u && txt.includes(u)) {
        cleanText = txt.replace(u, "").trim();
      }

      const shareData = {
        title: t || u || "Conteúdo compartilhado",
        url: u,
        text: cleanText,
      };

      sessionStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(shareData));
      setTitle(shareData.title);
      setUrl(shareData.url);
      setText(shareData.text);
    } else {
      // Tenta recuperar do sessionStorage (ex: após login/recarregamento)
      const stored = sessionStorage.getItem(SHARE_STORAGE_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setTitle(data.title || "");
          setUrl(data.url || "");
          setText(data.text || "");
        } catch {
          sessionStorage.removeItem(SHARE_STORAGE_KEY);
        }
      }
    }
  }, [searchParams]);

  const clearShareData = () => {
    sessionStorage.removeItem(SHARE_STORAGE_KEY);
  };

  const handleSaveNote = async () => {
    setSaving(true);
    try {
      const content = url ? `${url}\n\n${text}` : text;
      await createNote(title, content, null);
      clearShareData();
      navigate("/");
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveToCollection = async () => {
    if (!selectedCollection) return;
    setSaving(true);
    try {
      await createItem(selectedCollection, title, url, text);
      clearShareData();
      navigate("/");
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Knowledge Manager</h1>
          <p className="text-muted-foreground">
            Faça login para salvar conteúdo compartilhado.
          </p>
          <Button onClick={() => navigate("/")}>
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">
            Salvar conteúdo
          </h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          {url && (
            <div>
              <label className="block text-sm font-medium mb-1.5">URL</label>
              <input
                type="text"
                value={url}
                readOnly
                className="w-full px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground text-sm"
              />
            </div>
          )}

          {text && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Texto</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode("note")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border text-sm font-medium transition-colors ${
              mode === "note"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-input text-foreground hover:bg-accent"
            }`}
          >
            <FileText className="h-4 w-4" />
            Nota
          </button>
          <button
            onClick={() => setMode("collection")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border text-sm font-medium transition-colors ${
              mode === "collection"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-input text-foreground hover:bg-accent"
            }`}
          >
            <FolderHeart className="h-4 w-4" />
            Coleção
          </button>
        </div>

        {mode === "collection" && (
          <div>
            <label className="block text-sm font-medium mb-1.5">Coleção</label>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              <option value="">Selecione uma coleção</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button
          onClick={mode === "note" ? handleSaveNote : handleSaveToCollection}
          disabled={saving || (mode === "collection" && !selectedCollection)}
          className="w-full"
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}