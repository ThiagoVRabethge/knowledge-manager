import { useState, useEffect, useCallback, useRef } from "react";
import { Save, Eye, Pencil, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Note } from "@/types";
import { NoteViewer } from "./NoteViewer";
import { WikiAutocomplete } from "./WikiAutocomplete";
import { AIGenerateDialog } from "./AIGenerateDialog";

interface Props {
  note: Note;
  onSave: (id: string, updates: Partial<Note>) => Promise<void>;
  onLinkClick?: (title: string) => void;
}

export function NoteEditor({ note, onSave, onLinkClick }: Props) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(note.updated_at);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setLastSaved(note.updated_at);
  }, [note.id]);

  const handleSave = useCallback(async () => {
    if (title === note.title && content === note.content) return;
    setSaving(true);
    try {
      await onSave(note.id, { title, content });
      setLastSaved(new Date().toISOString());
    } finally {
      setSaving(false);
    }
  }, [note.id, title, content, note.title, note.content, onSave]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, content, handleSave]);

  const handleInsertAI = (text: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setContent((prev) => prev + "\n\n" + text);
      return;
    }
    const start = ta.selectionStart;
    const before = content.substring(0, start);
    const after = content.substring(start);
    const newContent = before + "\n\n" + text + after;
    setContent(newContent);
    setTimeout(() => {
      const newPos = start + text.length + 2;
      ta.setSelectionRange(newPos, newPos);
      ta.focus();
    }, 0);
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base sm:text-lg font-semibold tracking-tight bg-transparent border-0 outline-none placeholder:text-muted-foreground w-full"
            placeholder="Título da nota"
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mr-2">
            <Clock className="h-3 w-3" />
            {saving ? "Salvando..." : `Salvo ${formatDate(lastSaved)}`}
          </div>
          <AIGenerateDialog context={content} onInsert={handleInsertAI} />
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <Button
              variant={mode === "edit" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 sm:px-2.5"
              onClick={() => setMode("edit")}
            >
              <Pencil className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button
              variant={mode === "preview" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 sm:px-2.5"
              onClick={() => setMode("preview")}
            >
              <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Visualizar</span>
            </Button>
          </div>
          <Button size="sm" className="h-7" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Salvar</span>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-hidden relative">
        {mode === "edit" ? (
          <>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full resize-none outline-none p-4 sm:p-6 markdown-editor bg-transparent text-sm"
              placeholder="Escreva em Markdown... Use [[Título da Nota]] para criar links."
              spellCheck={false}
            />
            <WikiAutocomplete
              textareaRef={textareaRef}
              content={content}
              onSelect={setContent}
            />
          </>
        ) : (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <NoteViewer content={content} onLinkClick={onLinkClick} />
          </div>
        )}
      </div>
    </div>
  );
}
