import { useState, useCallback } from "react";
import { useFolders } from "@/hooks/useFolders";
import { useNotes } from "@/hooks/useNotes";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { LoginScreen } from "@/components/LoginScreen";
import { MobileConnections } from "@/components/MobileConnections";
import { Note } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Link2, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/utils";

export default function App() {
  const { user, logout, login, register } = useAuth();
  const { tree, notes: folderNotes, createFolder, deleteFolder, refresh } = useFolders();
  const {
    notes, refreshNotes, searchNotes, getNote,
    createNote, updateNote, deleteNote, getLinks, getBacklinks,
  } = useNotes();

  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>();
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [links, setLinks] = useState<{ links: any[]; backlinks: any[] }>({ links: [], backlinks: [] });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileConnectionsOpen, setMobileConnectionsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectNote = useCallback(async (noteId: string) => {
    setSelectedNoteId(noteId);
    setMobileSidebarOpen(false);
    const note = await getNote(noteId);
    setCurrentNote(note);
    const [l, b] = await Promise.all([getLinks(noteId), getBacklinks(noteId)]);
    setLinks({ links: l, backlinks: b });
  }, [getNote, getLinks, getBacklinks]);

  const handleNavigateByTitle = useCallback(async (title: string) => {
    const res = await fetch(`${API_URL}/notes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const allNotes: Note[] = await res.json();
    const found = allNotes.find((n) => n.title.toLowerCase() === title.toLowerCase());
    if (found) {
      await handleSelectNote(found.id);
    }
  }, [handleSelectNote]);

  const handleSaveNote = async (id: string, updates: Partial<Note>) => {
    await updateNote(id, updates);
    await refreshNotes();
    await refresh();
    const updated = await getNote(id);
    setCurrentNote(updated);
    const [l, b] = await Promise.all([getLinks(id), getBacklinks(id)]);
    setLinks({ links: l, backlinks: b });
  };

  const handleCreateNote = async (title: string, content: string, folderId?: string) => {
    const note = await createNote(title, content, folderId);
    await refresh();
    await handleSelectNote(note.id);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    await refresh();
    if (selectedNoteId === id) {
      setSelectedNoteId(undefined);
      setCurrentNote(null);
    }
  };

  const handleCreateFolder = async (name: string, parentId?: string) => {
    await createFolder(name, parentId);
  };

  const handleDeleteFolder = async (id: string) => {
    await deleteFolder(id);
  };

  if (!user) {
    return <LoginScreen onLogin={login} onRegister={register} />;
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar
        tree={tree}
        notes={notes}
        selectedNoteId={selectedNoteId}
        expandedIds={expandedIds}
        onToggleExpand={handleToggleExpand}
        onSelectNote={handleSelectNote}
        onCreateFolder={handleCreateFolder}
        onCreateNote={handleCreateNote}
        onDeleteFolder={handleDeleteFolder}
        onDeleteNote={handleDeleteNote}
        onSearch={searchNotes}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {currentNote ? (
          <div className="flex h-full">
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Mobile header */}
              <div className="lg:hidden flex items-center justify-between gap-2 px-4 py-2 border-b">
                <div className="flex items-center gap-2 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setMobileSidebarOpen(true)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium truncate">{currentNote.title}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setMobileConnectionsOpen(true)}
                    title="Conexões"
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={logout}
                    title="Sair"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <NoteEditor
                  note={currentNote}
                  onSave={handleSaveNote}
                  onLinkClick={handleNavigateByTitle}
                />
              </div>
            </div>

            {/* Desktop connections panel */}
            <div className="w-64 border-l bg-card hidden lg:flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Conexões
                </h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={logout} title="Sair">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {links.links.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Links para
                      </p>
                      <div className="space-y-1">
                        {links.links.map((link) => (
                          <button
                            key={link.id}
                            onClick={() => handleSelectNote(link.id)}
                            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span className="truncate">{link.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {links.backlinks.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Referenciado por
                      </p>
                      <div className="space-y-1">
                        {links.backlinks.map((link) => (
                          <button
                            key={link.id}
                            onClick={() => handleSelectNote(link.id)}
                            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span className="truncate">{link.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {links.links.length === 0 && links.backlinks.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Nenhuma conexão encontrada. Use [[Título]] para linkar notas.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground relative">
            <div className="lg:hidden absolute top-4 left-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium">Selecione uma nota para começar</p>
            <p className="text-xs mt-1">ou crie uma nova nota no menu lateral</p>
          </div>
        )}
      </div>

      {/* Mobile connections bottom sheet */}
      {mobileConnectionsOpen && (
        <MobileConnections
          links={links.links}
          backlinks={links.backlinks}
          onSelectNote={handleSelectNote}
          onClose={() => setMobileConnectionsOpen(false)}
        />
      )}
    </div>
  );
}
