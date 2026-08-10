import { useState, useEffect, useCallback } from "react";
import { Search, FileText, Folder, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FolderTreeNode } from "./FolderTree";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { CreateNoteDialog } from "./CreateNoteDialog";
import { ThemeToggle } from "./ThemeToggle";
import { ExportButton } from "./ExportButton";
import { GithubSyncButton } from "./GithubSyncButton";
import { FolderTree, Note } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  tree: FolderTree[];
  notes: Note[];
  selectedNoteId?: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelectNote: (noteId: string) => void;
  onCreateFolder: (name: string, parentId?: string) => Promise<void>;
  onCreateNote: (title: string, content: string, folderId?: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onSearch: (q: string) => Promise<Note[]>;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  tree, notes, selectedNoteId, expandedIds, onToggleExpand,
  onSelectNote, onCreateFolder, onCreateNote, onDeleteFolder, onDeleteNote, onSearch,
  mobileOpen, onMobileClose,
}: Props) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await onSearch(search);
        setSearchResults(results);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, onSearch]);

  const showSearch = search.trim().length >= 2;

  const handleSelect = useCallback((noteId: string) => {
    onSelectNote(noteId);
    onMobileClose();
  }, [onSelectNote, onMobileClose]);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-sm font-semibold tracking-tight">Knowledge</h1>
        <div className="flex items-center gap-1">
          <ExportButton />
          <GithubSyncButton />
          <ThemeToggle />
          <button
            onClick={onMobileClose}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Separator />

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar notas..."
            className="pl-9 h-9 bg-muted/50 border-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-3 pb-2 flex items-center gap-2">
        <CreateFolderDialog
          onCreate={onCreateFolder}
          trigger={
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors">
              <Folder className="h-3.5 w-3.5" />
              Pasta
            </button>
          }
        />
        <CreateNoteDialog
          onCreate={onCreateNote}
          trigger={
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors">
              <FileText className="h-3.5 w-3.5" />
              Nota
            </button>
          }
        />
      </div>

      <ScrollArea className="flex-1 px-3">
        {showSearch ? (
          <div className="space-y-0.5">
            {searchResults.length === 0 && !searching && (
              <p className="text-xs text-muted-foreground px-2 py-4 text-center">
                Nenhum resultado encontrado
              </p>
            )}
            {searchResults.map((note) => (
              <button
                key={note.id}
                onClick={() => handleSelect(note.id)}
                className={cn(
                  "flex items-center gap-2 w-full py-1.5 px-2 rounded-md text-sm transition-colors",
                  selectedNoteId === note.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{note.title}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5 pb-4">
            {notes
              .filter((n) => !n.folder_id)
              .map((note) => (
                <div key={note.id} className="group flex items-center">
                  <button
                    onClick={() => handleSelect(note.id)}
                    className={cn(
                      "flex items-center gap-2 flex-1 py-1 px-2 rounded-md text-sm transition-colors",
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
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            {tree.map((node) => (
              <FolderTreeNode
                key={node.id}
                node={node}
                selectedNoteId={selectedNoteId}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onSelectNote={handleSelect}
                onCreateFolder={onCreateFolder}
                onCreateNote={onCreateNote}
                onDeleteFolder={onDeleteFolder}
                onDeleteNote={onDeleteNote}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );

  return (
    <>
      <div className="hidden lg:flex flex-col h-full w-72 border-r bg-card">
        {sidebarContent}
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 h-full w-72 bg-card border-r flex flex-col shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}