"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function MessageContent({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn(
        "text-inherit [&_p]:my-1 [&_p]:leading-relaxed [&_strong]:font-semibold",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
