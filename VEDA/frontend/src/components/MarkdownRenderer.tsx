"use client";

import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 z-10"
      style={{
        background: copied ? "rgba(0,184,148,0.2)" : "rgba(255,255,255,0.06)",
        color: copied ? "#00b894" : "#8b8b9e",
        border: `1px solid ${copied ? "rgba(0,184,148,0.3)" : "rgba(255,255,255,0.08)"}`,
      }}
      title="Copy code"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children, ...props }) {
            // Extract the code text from children
            const codeElement = React.Children.toArray(children).find(
              (child) => React.isValidElement(child) && child.type === "code"
            );

            let codeText = "";
            if (React.isValidElement(codeElement)) {
              const codeProps = codeElement.props as Record<string, unknown>;
              const extractText = (node: React.ReactNode): string => {
                if (typeof node === "string") return node;
                if (Array.isArray(node)) return node.map(extractText).join("");
                if (React.isValidElement(node)) {
                  const p = node.props as Record<string, unknown>;
                  if (p.children) return extractText(p.children as React.ReactNode);
                }
                return "";
              };
              codeText = extractText(codeProps.children as React.ReactNode);
            }

            // Extract language from class
            let language = "";
            if (React.isValidElement(codeElement)) {
              const codeProps = codeElement.props as Record<string, unknown>;
              const className = (codeProps.className as string) || "";
              const match = className.match(/language-(\w+)/);
              language = match ? match[1] : "";
            }

            return (
              <div className="relative group" style={{ margin: "0.75rem 0" }}>
                {language && (
                  <div
                    className="absolute top-2 left-3 text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: "#5a5a6e" }}
                  >
                    {language}
                  </div>
                )}
                <CopyButton text={codeText.trim()} />
                <pre
                  {...props}
                  style={{
                    paddingTop: language ? "2rem" : "1rem",
                  }}
                >
                  {children}
                </pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
