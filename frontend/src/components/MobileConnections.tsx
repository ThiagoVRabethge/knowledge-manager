import { X, FileText, Link2 } from "lucide-react";
import { NoteLink } from "@/types";

interface Props {
  links: NoteLink[];
  backlinks: NoteLink[];
  onSelectNote: (noteId: string) => void;
  onClose: () => void;
}

export function MobileConnections({ links, backlinks, onSelectNote, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-card border-t rounded-t-2xl max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Conexões
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4">
          {links.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Links para
              </p>
              <div className="space-y-1">
                {links.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => { onSelectNote(link.id); onClose(); }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="truncate">{link.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {backlinks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Referenciado por
              </p>
              <div className="space-y-1">
                {backlinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => { onSelectNote(link.id); onClose(); }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="truncate">{link.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {links.length === 0 && backlinks.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhuma conexão encontrada. Use [[Título]] para linkar notas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
