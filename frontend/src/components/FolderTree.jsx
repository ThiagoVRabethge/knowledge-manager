import { Folder, FileText, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { CreateNoteDialog } from "./CreateNoteDialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FolderTreeNode({
  node, level = 0, selectedNoteId, expandedIds, onToggleExpand,
  onSelectNote, onCreateFolder, onCreateNote, onDeleteFolder, onDeleteNote,
}) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0 || node.notes.length > 0;

  return (
    <div className={cn("relative", level > 0 && "mt-0.5")}>
      {/* Linha guia vertical para níveis aninhados */}
      {level > 0 && (
        <div
          className="absolute left-[9px] top-0 bottom-0 w-px bg-border/60"
          style={{ left: `${level * 20 - 11}px` }}
        />
      )}

      {/* Cabeçalho da pasta */}
      <div
        className={cn(
          "flex items-center gap-1.5 py-1.5 pr-2 rounded-md group transition-colors",
          level === 0
            ? "hover:bg-accent/40"
            : "hover:bg-accent/30",
          level > 0 && "ml-5"
        )}
      >
        <button
          onClick={() => hasChildren && onToggleExpand(node.id)}
          className={cn(
            "p-0.5 rounded transition-opacity shrink-0",
            hasChildren ? "opacity-100 hover:bg-accent" : "opacity-0"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        <Folder
          className={cn(
            "h-4 w-4 shrink-0",
            level === 0 ? "text-foreground/80" : "text-muted-foreground/70"
          )}
        />

        <span
          className={cn(
            "text-sm truncate flex-1",
            level === 0 ? "font-semibold text-foreground" : "font-medium text-foreground/80"
          )}
        >
          {node.name}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <CreateFolderDialog
            parentId={node.id}
            onCreate={onCreateFolder}
            trigger={
              <button className="p-1 rounded hover:bg-accent" title="Nova subpasta">
                <Folder className="h-3 w-3 text-muted-foreground" />
              </button>
            }
          />
          <CreateNoteDialog
            folderId={node.id}
            onCreate={onCreateNote}
            trigger={
              <button className="p-1 rounded hover:bg-accent" title="Nova nota">
                <FileText className="h-3 w-3 text-muted-foreground" />
              </button>
            }
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-accent" title="Excluir pasta">
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteFolder(node.id)}
              >
                Excluir pasta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Conteúdo expandido: subpastas + notas */}
      {isExpanded && (
        <div className="relative">
          {/* Subpastas */}
          {node.children.length > 0 && (
            <div className="pb-1">
              {node.children.map((child) => (
                <FolderTreeNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  selectedNoteId={selectedNoteId}
                  expandedIds={expandedIds}
                  onToggleExpand={onToggleExpand}
                  onSelectNote={onSelectNote}
                  onCreateFolder={onCreateFolder}
                  onCreateNote={onCreateNote}
                  onDeleteFolder={onDeleteFolder}
                  onDeleteNote={onDeleteNote}
                />
              ))}
            </div>
          )}

          {/* Separador sutil entre subpastas e notas */}
          {node.children.length > 0 && node.notes.length > 0 && (
            <div className="mx-5 my-1 h-px bg-border/40" />
          )}

          {/* Notas da pasta */}
          {node.notes.length > 0 && (
            <div className="space-y-0.5 pb-1">
              {node.notes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    "group flex items-center relative",
                    level > 0 ? "ml-5" : "ml-5"
                  )}
                >
                  {/* Conector visual da nota à hierarquia */}
                  <div className="absolute left-[9px] top-1/2 -translate-y-1/2 w-2.5 h-px bg-border/50" />

                  <button
                    onClick={() => onSelectNote(note.id)}
                    className={cn(
                      "flex items-center gap-2 flex-1 py-1.5 pr-2 pl-6 rounded-md text-sm transition-colors",
                      selectedNoteId === note.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                    <span className="truncate">{note.title}</span>
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent transition-opacity"
                    title="Excluir nota"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}