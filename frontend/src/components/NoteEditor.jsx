import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, Eye, ListTodo, Pencil, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AIGenerateDialog } from "./AIGenerateDialog";
import { NoteViewer } from "./NoteViewer";
import { WikiAutocomplete } from "./WikiAutocomplete";
import { useTemplates } from "@/hooks/useTemplates";
import { LayoutTemplate } from "lucide-react"; // ou outro ícone adequado

export function NoteEditor({ note, onSave, onLinkClick, onCreateNote, allNotes }) {
  const [title, setTitle] = useState(note.title);

  const [content, setContent] = useState(note.content);

  const [mode, setMode] = useState("preview");

  const [saving, setSaving] = useState(false);

  const [lastSaved, setLastSaved] = useState(note.updated_at);

  const textareaRef = useRef(null);

  const onSaveRef = useRef(onSave);

  onSaveRef.current = onSave;

  const { templates } = useTemplates();

  const [templatesOpen, setTemplatesOpen] = useState(false);

  useEffect(() => {
    setTitle(note.title);

    setContent(note.content);

    setLastSaved(note.updated_at);
  }, [note.id]);

  useEffect(() => {
    if (title === note.title && content === note.content) return;

    const timer = setTimeout(async () => {
      setSaving(true);

      try {
        await onSaveRef.current(note.id, { title, content });

        setLastSaved(new Date().toISOString());
      } finally {
        setSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content, note.id, note.title, note.content]);

  const handleManualSave = useCallback(async () => {
    if (title === note.title && content === note.content) return;

    setSaving(true);

    try {
      await onSave(note.id, { title, content });

      setLastSaved(new Date().toISOString());
    } finally {
      setSaving(false);
    }
  }, [note.id, title, content, note.title, note.content, onSave]);

  const handleInsertAI = useCallback(
    (text) => {
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
    },
    [content]
  );

  const handleInsertChecklistItem = useCallback(() => {
    const ta = textareaRef.current;

    if (!ta) {
      setContent((prev) => prev + (prev.endsWith("\n") ? "" : "\n") + "- [ ] ");

      return;
    }

    const start = ta.selectionStart;

    const before = content.substring(0, start);

    const after = content.substring(start);

    const newContent = before + "- [ ] " + after;

    setContent(newContent);

    setTimeout(() => {
      const newPos = start + 6;

      ta.setSelectionRange(newPos, newPos);

      ta.focus();
    }, 0);
  }, [content]);

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      const ta = textareaRef.current;

      if (!ta || e.key !== "Enter" || e.shiftKey) return;

      const start = ta.selectionStart;

      const end = ta.selectionEnd;

      if (start !== end) return;

      const lineStart = content.lastIndexOf("\n", start - 1) + 1;

      const line = content.slice(lineStart, start);

      const match = line.match(/^(\s*)-\s\[([ x])\]\s(.*)$/);

      if (!match) return;

      const indentation = match[1] || "";

      const itemText = match[3] || "";

      e.preventDefault();

      let newContent;

      let newCursorPos;

      if (itemText.length === 0) {
        const before = content.slice(0, lineStart);

        const after = content.slice(end);

        newContent = before + "\n" + after;

        newCursorPos = lineStart + 1;
      } else {
        const before = content.slice(0, start);

        const after = content.slice(end);

        newContent = before + "\n" + indentation + "- [ ] " + after;

        newCursorPos = start + 1 + indentation.length + 6;
      }

      setContent(newContent);

      setTimeout(() => {
        ta.setSelectionRange(newCursorPos, newCursorPos);

        ta.focus();
      }, 0);
    },
    [content]
  );

  const formatDate = (d) => {
    return new Date(d).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleInsertTemplate = useCallback((templateContent) => {
    const ta = textareaRef.current;
    if (!ta) {
      setContent((prev) => prev + "\n\n" + templateContent);
      return;
    }
    const start = ta.selectionStart;
    const before = content.substring(0, start);
    const after = content.substring(start);
    const newContent = before + "\n\n" + templateContent + after;
    setContent(newContent);
    setMode("edit");
    setTimeout(() => {
      const newPos = start + templateContent.length + 2;
      ta.setSelectionRange(newPos, newPos);
      ta.focus();
    }, 0);
    setTemplatesOpen(false);
  }, [content]);

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

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Inserir template"
              onClick={() => setTemplatesOpen(!templatesOpen)}
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
            </Button>
            {templatesOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setTemplatesOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-56 rounded-md border bg-popover shadow-md z-20">
                  <div className="p-1">
                    {templates.length === 0 && (
                      <p className="text-xs text-muted-foreground px-2 py-1.5">
                        Nenhum template criado.
                      </p>
                    )}
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleInsertTemplate(template.content)}
                        className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleInsertChecklistItem}
            className="h-7 w-7"
            title="Inserir item de checklist"
          >
            <ListTodo className="h-3.5 w-3.5" />
          </Button>

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

          <Button size="sm" className="h-7" onClick={handleManualSave} disabled={saving}>
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
              onKeyDown={handleKeyDown}
              className="w-full h-full resize-none outline-none p-4 sm:p-6 markdown-editor bg-transparent text-sm"
              placeholder="Escreva em Markdown... Use [[Título da Nota]] para criar links."
              spellCheck={false}
            />

            <WikiAutocomplete
              textareaRef={textareaRef}
              onSelect={setContent}
              onCreateNote={onCreateNote}
              allNotes={allNotes}
              folderId={note.folder_id}
            />
          </>
        ) : (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <NoteViewer
              content={content}
              onLinkClick={onLinkClick}
              onContentChange={handleContentChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
