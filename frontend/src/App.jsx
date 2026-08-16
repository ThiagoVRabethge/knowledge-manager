import { useState, useCallback, useMemo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useFolders } from "@/hooks/useFolders";
import { useNotes } from "@/hooks/useNotes";
import { useCollections } from "@/hooks/useCollections";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { CollectionItemsPanel } from "@/components/CollectionItemsPanel";
import { NoteEditor } from "@/components/NoteEditor";
import { LoginScreen } from "@/components/LoginScreen";
import { MobileConnections } from "@/components/MobileConnections";
import { GithubSyncButton } from "@/components/GithubSyncButton";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Link2, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/utils";
import ShareTargetPage from "@/pages/ShareTargetPage";

function HomePage() {
  const navigate = useNavigate();
  const { user, logout, login, register } = useAuth();
  const { tree, createFolder, deleteFolder, refresh } = useFolders();
  const {
    notes, searchNotes, getNote,
    createNote, updateNote, deleteNote, getLinks, getBacklinks,
  } = useNotes();
  const {
    collections, createCollection, deleteCollection, getCollection, createItem, deleteItem,
  } = useCollections();

  const [selectedNoteId, setSelectedNoteId] = useState();
  const [currentNote, setCurrentNote] = useState(null);
  const [links, setLinks] = useState({ links: [], backlinks: [] });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileConnectionsOpen, setMobileConnectionsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const [selectedCollectionId, setSelectedCollectionId] = useState();
  const [currentCollection, setCurrentCollection] = useState(null);

  const handleToggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNoteId(undefined);
    setCurrentNote(null);
    setSelectedCollectionId(undefined);
    setCurrentCollection(null);
  }, []);

  const handleSelectNote = useCallback(async (noteId) => {
    clearSelection();
    setSelectedNoteId(noteId);
    setMobileSidebarOpen(false);
    const note = await getNote(noteId);
    setCurrentNote(note);
    const [l, b] = await Promise.all([getLinks(noteId), getBacklinks(noteId)]);
    setLinks({ links: l, backlinks: b });
  }, [getNote, getLinks, getBacklinks, clearSelection]);

  const handleNavigateByTitle = useCallback(async (title) => {
    const found = notes.find((n) => n.title.toLowerCase() === title.toLowerCase());
    if (found) {
      await handleSelectNote(found.id);
      return;
    }
    const res = await fetch(`${API_URL}/notes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const allNotes = await res.json();
    const remoteFound = allNotes.find((n) => n.title.toLowerCase() === title.toLowerCase());
    if (remoteFound) {
      await handleSelectNote(remoteFound.id);
    }
  }, [notes, handleSelectNote]);

  const handleSaveNote = useCallback(async (id, updates) => {
    const updated = await updateNote(id, updates);
    setCurrentNote(updated);
    const [l, b] = await Promise.all([getLinks(id), getBacklinks(id)]);
    setLinks({ links: l, backlinks: b });
  }, [updateNote, getLinks, getBacklinks]);

  const handleCreateNote = useCallback(async (title, content, folderId) => {
    const note = await createNote(title, content, folderId);
    await refresh();
    await handleSelectNote(note.id);
    return note;
  }, [createNote, refresh, handleSelectNote]);

  const handleDeleteNote = useCallback(async (id) => {
    await deleteNote(id);
    await refresh();
    if (selectedNoteId === id) {
      clearSelection();
    }
  }, [deleteNote, refresh, selectedNoteId, clearSelection]);

  const handleCreateFolder = useCallback(async (name, parentId) => {
    await createFolder(name, parentId);
  }, [createFolder]);

  const handleDeleteFolder = useCallback(async (id) => {
    await deleteFolder(id);
  }, [deleteFolder]);

  const handleSelectCollection = useCallback(async (collectionId) => {
    clearSelection();
    setSelectedCollectionId(collectionId);
    setMobileSidebarOpen(false);
    const col = await getCollection(collectionId);
    setCurrentCollection(col);
  }, [getCollection, clearSelection]);

  const handleCreateCollection = useCallback(async (name) => {
    await createCollection(name);
  }, [createCollection]);

  const handleDeleteCollection = useCallback(async (id) => {
    await deleteCollection(id);
    if (selectedCollectionId === id) {
      clearSelection();
    }
  }, [deleteCollection, selectedCollectionId, clearSelection]);

  const handleAddLink = useCallback(async (collectionId, title, url, description) => {
    await createItem(collectionId, title, url, description);
    if (selectedCollectionId === collectionId) {
      const col = await getCollection(collectionId);
      setCurrentCollection(col);
    }
  }, [createItem, getCollection, selectedCollectionId]);

  const handleDeleteLink = useCallback(async (itemId) => {
    await deleteItem(itemId);
    if (selectedCollectionId) {
      const col = await getCollection(selectedCollectionId);
      setCurrentCollection(col);
    }
  }, [deleteItem, getCollection, selectedCollectionId]);

  // Wrapper para criar nota a partir do WikiAutocomplete (herda folder_id da nota atual)
  const handleCreateNoteFromWiki = useCallback(async (title, folderId) => {
    const note = await createNote(title, "", folderId);
    await refresh();
    return note;
  }, [createNote, refresh]);

  const allNotes = useMemo(() => notes, [notes]);

  if (!user) {
    return <LoginScreen onLogin={login} onRegister={register} />;
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar
        tree={tree}
        notes={notes}
        collections={collections}
        selectedNoteId={selectedNoteId}
        selectedCollectionId={selectedCollectionId}
        expandedIds={expandedIds}
        onToggleExpand={handleToggleExpand}
        onSelectNote={handleSelectNote}
        onSelectCollection={handleSelectCollection}
        onCreateFolder={handleCreateFolder}
        onCreateNote={handleCreateNote}
        onCreateCollection={handleCreateCollection}
        onDeleteFolder={handleDeleteFolder}
        onDeleteNote={handleDeleteNote}
        onDeleteCollection={handleDeleteCollection}
        onSearch={searchNotes}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {currentNote ? (
          <div className="flex h-full">
            <div className="flex-1 min-w-0 flex flex-col">
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
                  <GithubSyncButton />
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
                  onCreateNote={handleCreateNoteFromWiki}
                  allNotes={allNotes}
                />
              </div>
            </div>

            <div className="w-64 border-l bg-card hidden lg:flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Conexões
                </h3>
                <div className="flex items-center gap-1">
                  <GithubSyncButton />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={logout} title="Sair">
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </div>
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
        ) : currentCollection ? (
          <CollectionItemsPanel
            collection={currentCollection}
            onAddLink={handleAddLink}
            onDeleteLink={handleDeleteLink}
            onMobileMenu={() => setMobileSidebarOpen(true)}
            onLogout={logout}
          />
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
            <p className="text-sm font-medium">Selecione uma nota ou coleção para começar</p>
            <p className="text-xs mt-1">ou crie uma nova no menu lateral</p>
          </div>
        )}
      </div>

      {mobileConnectionsOpen && currentNote && (
        <MobileConnections
          links={links.links}
          backlinks={links.backlinks}
          onSelectNote={handleSelectNote}
          onClose={() => setMobileConnectionsOpen(false)}
        />
      )}

      <PWAInstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/share" element={<ShareTargetPage />} />
    </Routes>
  );
}