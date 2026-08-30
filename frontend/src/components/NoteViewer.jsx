import { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function parseChecklistBlocks(content) {
  const lines = content.split("\n");

  const blocks = [];

  let i = 0;

  while (i < lines.length) {
    const match = lines[i].match(/^(\s*)-\s\[([ x])\]\s*(.*)$/);

    if (match) {
      const items = [];

      const startLine = i;

      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)-\s\[([ x])\]\s*(.*)$/);

        if (m) {
          items.push({
            checked: m[2] === "x",
            text: m[3],
            lineIndex: i,
          });

          i++;
        } else {
          break;
        }
      }

      blocks.push({ type: "checklist", startLine, items });
    } else {
      const startLine = i;

      const normalLines = [];

      while (i < lines.length && !lines[i].match(/^(\s*)-\s\[([ x])\]\s*(.*)$/)) {
        normalLines.push(lines[i]);

        i++;
      }

      blocks.push({ type: "markdown", content: normalLines.join("\n"), startLine });
    }
  }

  return blocks;
}

export function NoteViewer({ content, onLinkClick, onContentChange }) {
  const blocks = parseChecklistBlocks(content);

  const handleToggle = useCallback(
    (item) => {
      if (!onContentChange) return;

      const lines = content.split("\n");

      const line = lines[item.lineIndex];

      const newLine = line.replace(item.checked ? "[x]" : "[ ]", item.checked ? "[ ]" : "[x]");

      lines[item.lineIndex] = newLine;

      onContentChange(lines.join("\n"));
    },
    [content, onContentChange]
  );

  const convertWikiLinks = (text) =>
    text.replace(/\[\[((?:[^\]]|\](?!\]))+)\]\]/g, (_match, title) => `[${title}](#wiki-${encodeURIComponent(title)})`);

  return (
    <div className="markdown-preview">
      {blocks.map((block, idx) => {
        if (block.type === "markdown") {
          const processedContent = convertWikiLinks(block.content);

          return (
            <ReactMarkdown
              key={idx}
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  if (typeof href === "string" && href.startsWith("#wiki-")) {
                    const title = decodeURIComponent(href.replace("#wiki-", ""));
                    return (
                      <button
                        onClick={() => onLinkClick?.(title)}
                        className="inline text-primary underline underline-offset-4 hover:text-primary/80 font-medium cursor-pointer bg-transparent border-0 p-0"
                      >
                        {children}
                      </button>
                    );
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {processedContent}
            </ReactMarkdown>
          );
        } else {
          return (
            <ul key={idx} className="space-y-1">
              {block.items.map((item) => (
                <li key={item.lineIndex} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggle(item)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  />

                  <span className={item.checked ? "line-through text-muted-foreground" : ""}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          );
        }
      })}
    </div>
  );
}
