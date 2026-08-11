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
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1 pr-2 rounded-md group hover:bg-accent/50 transition-colors",
          level > 0 && "ml-4"
        )}
      >
        <button
          onClick={() => hasChildren && onToggleExpand(node.id)}
          className={cn(
            "p-0.5 rounded transition-opacity shrink-0",
            hasChildren ? "opacity-100" : "opacity-0"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
        <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium truncate flex-1">{node.name}</span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <CreateFolderDialog
            parentId={node.id}
            onCreate={onCreateFolder}
            trigger={
              <button className="p-1 rounded hover:bg-accent" title="Nova pasta">
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

      {isExpanded && (
        <div className="mt-0.5">
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
          {node.notes.map((note) => (
            <div key={note.id} className="group flex items-center">
              <button
                onClick={() => onSelectNote(note.id)}
                className={cn(
                  "flex items-center gap-2 flex-1 py-1 pr-2 pl-7 rounded-md text-sm transition-colors",
                  selectedNoteId === note.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
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
  );
}
