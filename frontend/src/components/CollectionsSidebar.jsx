import { useState } from "react";
import { Bookmark, Trash2, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CreateCollectionDialog } from "./CreateCollectionDialog";
import { cn } from "@/lib/utils";

export function CollectionsSidebar({
  collections, selectedCollectionId, onSelectCollection,
  onCreateCollection, onDeleteCollection, mobileOpen, onMobileClose,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-sm font-semibold tracking-tight flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          Coleções
        </h1>
        <div className="flex items-center gap-1">
          <CreateCollectionDialog
            onCreate={onCreateCollection}
            trigger={
              <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent" title="Nova coleção">
                <Bookmark className="h-4 w-4 text-muted-foreground" />
              </button>
            }
          />
          <button
            onClick={onMobileClose}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Separator />

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-0.5 py-2 pb-4">
          {collections.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">
              Nenhuma coleção ainda. Crie uma para começar.
            </p>
          )}
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="group flex items-center"
              onMouseEnter={() => setHoveredId(collection.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                onClick={() => onSelectCollection(collection.id)}
                className={cn(
                  "flex items-center gap-2 flex-1 py-1.5 px-2 rounded-md text-sm transition-colors",
                  selectedCollectionId === collection.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Bookmark className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{collection.name}</span>
              </button>
              <button
                onClick={() => onDeleteCollection(collection.id)}
                className={cn(
                  "p-1 rounded hover:bg-accent transition-opacity",
                  hoveredId === collection.id ? "opacity-100" : "opacity-0"
                )}
                title="Excluir coleção"
              >
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
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
