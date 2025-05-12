'use client';
import React from 'react';
import {Highlight, themes} from 'prism-react-renderer';
import { Copy } from 'lucide-react';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!inline) {
    return (
      <div className="relative bg-[#18181b] rounded-lg my-4 overflow-x-auto w-full">
        <button
          className="absolute top-2 right-2 p-1 bg-slate-50 rounded hover:bg-slate-200 text-xs text-black flex items-center gap-1 z-10"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          <Copy size={16} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <Highlight code={code} language={match?.[1] || ''} theme={themes.dracula}>
          {({ className, style, tokens, getLineProps, getTokenProps }: any) => (
            <pre className={className + ' p-4 text-sm w-full'} style={style}>
              {tokens.map((line: any, i: number) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {line.map((token: any, key: number) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
