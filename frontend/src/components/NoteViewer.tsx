import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
  onLinkClick?: (noteTitle: string) => void;
}

export function NoteViewer({ content, onLinkClick }: Props) {
  const processedContent = content.replace(
    /\[\[((?:[^\]]|\](?!\]))+)\]\]/g,
    (match, title) => `[${title}](#wiki-${encodeURIComponent(title)})`
  );

  return (
    <div className="markdown-preview">
      <ReactMarkdown
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
    </div>
  );
}