"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ManifestoContentProps {
  content: string;
}

type ComponentProps = {
  children?: React.ReactNode;
  [key: string]: unknown;
};

export default function ManifestoContent({ content }: ManifestoContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children, ...props }: ComponentProps) => (
          <h1 className="text-copper-500 mb-8" {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }: ComponentProps) => (
          <h2 className="text-copper-500 mt-12 mb-6" {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }: ComponentProps) => (
          <h3 className="text-copper-500 mt-8 mb-4" {...props}>
            {children}
          </h3>
        ),
        p: ({ children, ...props }: ComponentProps) => (
          <p className="mb-6 leading-relaxed" {...props}>
            {children}
          </p>
        ),
        blockquote: ({ children, ...props }: ComponentProps) => (
          <blockquote
            className="border-l-2 border-copper-500 pl-6 italic text-stone-400 my-8"
            {...props}
          >
            {children}
          </blockquote>
        ),
        ul: ({ children, ...props }: ComponentProps) => (
          <ul
            className="list-disc list-inside mb-6 text-text-secondary space-y-2"
            {...props}
          >
            {children}
          </ul>
        ),
        ol: ({ children, ...props }: ComponentProps) => (
          <ol
            className="list-decimal list-inside mb-6 text-text-secondary space-y-2"
            {...props}
          >
            {children}
          </ol>
        ),
        strong: ({ children, ...props }: ComponentProps) => (
          <strong className="text-text-primary font-semibold" {...props}>
            {children}
          </strong>
        ),
        em: ({ children, ...props }: ComponentProps) => (
          <em className="text-copper-500 not-italic" {...props}>
            {children}
          </em>
        ),
        hr: () => <hr className="border-copper-500/30 my-8" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
