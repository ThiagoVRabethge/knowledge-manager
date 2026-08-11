import { useState } from "react";
import { ExternalLink, Trash2, Bookmark, Menu, Link as LinkIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AddLinkDialog } from "./AddLinkDialog";

export function CollectionItemsPanel({
  collection, onAddLink, onDeleteLink, onMobileMenu, onLogout,
}) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (itemId) => {
    setDeletingId(itemId);
    try {
      await onDeleteLink(itemId);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 lg:hidden"
            onClick={onMobileMenu}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Bookmark className="h-4 w-4 text-muted-foreground shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold tracking-tight truncate">
              {collection.name}
            </h2>
            <span className="text-xs text-muted-foreground shrink-0">
              {collection.items.length} link{collection.items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <AddLinkDialog
            collectionId={collection.id}
            onAdd={onAddLink}
            trigger={
              <Button size="sm" className="h-8 gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Adicionar</span>
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden lg:flex"
            onClick={onLogout}
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6">
          {collection.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                <LinkIcon className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium">Nenhum link nesta coleção</p>
              <p className="text-xs mt-1">Adicione seu primeiro link acima</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {collection.items.map((item) => (
                <div
                  key={item.id}
                  className="group relative border rounded-xl p-4 bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-medium line-clamp-2 flex-1">{item.title}</h3>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0"
                      title="Excluir link"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline underline-offset-4"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="truncate max-w-[200px]">{item.url}</span>
                  </a>
                  <p className="text-[10px] text-muted-foreground mt-3">
                    Adicionado em {formatDate(item.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}