import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTemplates } from "@/hooks/useTemplates";
import { Clock, Eye, ListTodo, Pencil, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NoteViewer } from "./NoteViewer";

export function TemplateEditor({ template, onBack }) {
  const { updateTemplate } = useTemplates();

  const [name, setName] = useState(template.name);

  const [content, setContent] = useState(template.content);

  const [mode, setMode] = useState("preview");

  const [saving, setSaving] = useState(false);

  const [lastSaved, setLastSaved] = useState(template.updated_at);

  const textareaRef = useRef(null);

  const onUpdateRef = useRef(updateTemplate);

  onUpdateRef.current = updateTemplate;

  useEffect(() => {
    setName(template.name);

    setContent(template.content);

    setLastSaved(template.updated_at);
  }, [template.id]);

  useEffect(() => {
    if (name === template.name && content === template.content) return;

    const timer = setTimeout(async () => {
      setSaving(true);

      try {
        await onUpdateRef.current(template.id, { name, content });

        setLastSaved(new Date().toISOString());
      } finally {
        setSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [name, content, template.id, template.name, template.content]);

  const handleManualSave = useCallback(async () => {
    if (name === template.name && content === template.content) return;

    setSaving(true);

    try {
      await updateTemplate(template.id, { name, content });

      setLastSaved(new Date().toISOString());
    } finally {
      setSaving(false);
    }
  }, [name, content, template.id, template.name, template.content, updateTemplate]);

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

  const formatDate = (d) => {
    return new Date(d).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-7 w-7"
            title="Voltar"
          >
            <X className="h-4 w-4" />
          </Button>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-base sm:text-lg font-semibold tracking-tight bg-transparent border-0 outline-none placeholder:text-muted-foreground w-full"
            placeholder="Nome do template"
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mr-2">
            <Clock className="h-3 w-3" />

            {saving ? "Salvando..." : `Salvo ${formatDate(lastSaved)}`}
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
        {
          mode === "edit" ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full resize-none outline-none p-4 sm:p-6 markdown-editor bg-transparent text-sm"
              placeholder="Conteúdo em Markdown..."
              spellCheck={false}
            />
          ) : (
            <div className="h-full overflow-y-auto p-4 sm:p-6">
              <NoteViewer content={content} onLinkClick={() => { }} />
            </div>
          )
        }
      </div>
    </div>
  );
}
