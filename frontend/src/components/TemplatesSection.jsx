import { useTemplates } from "@/hooks/useTemplates";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { TemplateEditor } from "./TemplateEditor";

export function TemplatesSection() {
  const { templates, createTemplate, deleteTemplate } = useTemplates();

  const [isCreating, setIsCreating] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formName, setFormName] = useState("");

  const openCreateDialog = () => {
    setIsCreating(true);

    setFormName("");
  };

  const handleCreateSubmit = async () => {
    if (!formName.trim()) return;

    await createTemplate(formName, "");

    setIsCreating(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Excluir template?")) {
      await deleteTemplate(id);
    }
  };

  if (editingTemplate) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onBack={() => setEditingTemplate(null)}
      />
    );
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between px-2 mb-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Templates
        </p>

        <button
          onClick={openCreateDialog}
          className="p-1 rounded hover:bg-accent"
          title="Novo template"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-0.5">
        {
          templates.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-2">
              Nenhum template criado.
            </p>
          )
        }

        {
          templates.map((template) => (
            <div key={template.id} className="group flex items-center">
              <button
                onClick={() => setEditingTemplate(template)}
                className="flex items-center gap-2 flex-1 py-1 px-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />

                <span className="truncate">{template.name}</span>
              </button>

              <button
                onClick={() => handleDelete(template.id)}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 rounded hover:bg-accent transition-opacity"
                title="Excluir template"
              >
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          ))
        }
      </div>

      {
        isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card border rounded-lg shadow-lg w-full max-w-sm p-4 space-y-3">
              <h3 className="text-sm font-semibold">Novo template</h3>

              <input
                placeholder="Nome do template"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                autoFocus
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-md border text-sm hover:bg-accent"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleCreateSubmit}
                  className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}
