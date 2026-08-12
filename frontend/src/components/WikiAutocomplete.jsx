import { useState, useEffect, useCallback } from "react";
import { FileText, Plus } from "lucide-react";

const WIKI_LINK_REGEX = /\[\[((?:[^\]]|\](?!\]))*)$/;

export function WikiAutocomplete({ textareaRef, onSelect, onCreateNote, allNotes }) {
  const [suggestions, setSuggestions] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [searchTerm, setSearchTerm] = useState("");

  const getCursorPosition = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return { top: 0, left: 0 };

    const style = window.getComputedStyle(ta);
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.style.overflowWrap = "break-word";
    div.style.font = style.font;
    div.style.lineHeight = style.lineHeight;
    div.style.padding = style.padding;
    div.style.width = style.width;
    div.style.letterSpacing = style.letterSpacing;

    const textBeforeCursor = ta.value.substring(0, ta.selectionStart);
    div.textContent = textBeforeCursor;
    const span = document.createElement("span");
    span.textContent = "|";
    div.appendChild(span);

    document.body.appendChild(div);
    const rect = ta.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    const divRect = div.getBoundingClientRect();
    document.body.removeChild(div);

    return {
      top: rect.top + (spanRect.top - divRect.top) + parseFloat(style.lineHeight),
      left: rect.left + (spanRect.left - divRect.left),
    };
  }, [textareaRef]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const handleInput = () => {
      const cursor = ta.selectionStart;
      const text = ta.value;
      const beforeCursor = text.substring(0, cursor);
      const match = beforeCursor.match(WIKI_LINK_REGEX);

      if (match) {
        const search = match[1] || "";
        setSearchTerm(search);
        const filtered = allNotes
          .filter((n) => n.title.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 8);

        const hasCreateOption = onCreateNote && search.trim().length > 0;
        const totalItems = filtered.length + (hasCreateOption ? 1 : 0);

        if (totalItems > 0) {
          setSuggestions(filtered);
          setVisible(true);
          setSelectedIndex(0);
          const pos = getCursorPosition();
          setPosition({ top: pos.top + 4, left: pos.left });
        } else {
          setVisible(false);
        }
      } else {
        setVisible(false);
      }
    };

    const handleKeyDown = (e) => {
      if (!visible) return;

      const hasCreateOption = onCreateNote && searchTerm.trim().length > 0;
      const totalItems = suggestions.length + (hasCreateOption ? 1 : 0);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % totalItems);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + totalItems) % totalItems);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (hasCreateOption && selectedIndex === suggestions.length) {
          handleCreateNewNote(searchTerm.trim());
        } else if (suggestions[selectedIndex]) {
          insertWikiLink(suggestions[selectedIndex].title);
        }
      } else if (e.key === "Escape") {
        setVisible(false);
      }
    };

    ta.addEventListener("input", handleInput);
    ta.addEventListener("keydown", handleKeyDown);
    return () => {
      ta.removeEventListener("input", handleInput);
      ta.removeEventListener("keydown", handleKeyDown);
    };
  }, [textareaRef, visible, suggestions, selectedIndex, getCursorPosition, allNotes, onCreateNote, searchTerm]);

  const insertWikiLink = (title) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart;
    const text = ta.value;
    const beforeCursor = text.substring(0, cursor);
    const match = beforeCursor.match(WIKI_LINK_REGEX);
    if (!match) return;

    const wikiStart = match.index;
    // Se o caractere imediatamente antes do [[ for "[", removemos ele.
    // Isso acontece quando o título começa com "[" (ex: "[estrutura] filosofia")
    const hasExtraBracket = wikiStart > 0 && text[wikiStart - 1] === "[";
    const startPos = hasExtraBracket ? wikiStart - 1 : wikiStart;

    const newText = text.substring(0, startPos) + `[[${title}]]` + text.substring(cursor);
    onSelect(newText);
    setVisible(false);
    setTimeout(() => {
      const newCursor = startPos + title.length + 4;
      ta.setSelectionRange(newCursor, newCursor);
      ta.focus();
    }, 0);
  };

  const handleCreateNewNote = async (title) => {
    if (!onCreateNote) return;
    try {
      const newNote = await onCreateNote(title);
      if (newNote && newNote.title) {
        insertWikiLink(newNote.title);
      }
    } catch (err) {
      console.error("Failed to create note from wiki autocomplete:", err);
    }
  };

  if (!visible) return null;

  const hasCreateOption = onCreateNote && searchTerm.trim().length > 0;
  const totalItems = suggestions.length + (hasCreateOption ? 1 : 0);
  if (totalItems === 0) return null;

  return (
    <div
      className="fixed z-50 min-w-[240px] max-w-[360px] bg-popover border rounded-lg shadow-lg py-1"
      style={{ top: position.top, left: position.left }}
    >
      {suggestions.map((note, idx) => (
        <button
          key={note.id}
          onClick={() => insertWikiLink(note.title)}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors ${
            idx === selectedIndex
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50"
          }`}
        >
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{note.title}</span>
        </button>
      ))}

      {hasCreateOption && (
        <button
          onClick={() => handleCreateNewNote(searchTerm.trim())}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors border-t ${
            selectedIndex === suggestions.length
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50 text-muted-foreground"
          }`}
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Criar nota "{searchTerm.trim()}"</span>
        </button>
      )}
    </div>
  );
}