import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  // Handle code specially with better detection for code blocks vs inline code
  code: ({ className, children, node, ...rest }: any) => {
    // Better detection of code blocks:
    // 1. If it has className (language info)
    // 2. If parent is 'pre' tag
    // 3. If content has multiple lines
    const isCodeBlock = 
      className != null || 
      (node?.position?.start?.line !== node?.position?.end?.line) ||
      (node?.parent?.tagName === 'pre');
    
    if (!isCodeBlock) {
      // Inline code (single backtick)
      return (
        <code 
          className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1.5 rounded-md"
          style={{ display: 'inline' }}
          {...rest}
        >
          {children}
        </code>
      );
    }
    
    // It's a code block, use the CodeBlock component
    return (
      <CodeBlock
        className={className}
        inline={false}
        node={node}
        {...rest}
      >
        {children}
      </CodeBlock>
    );
  },
  pre: ({ children }) => children, // Let the code block handle the pre
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
};

const remarkPlugins = [remarkGfm];

function parseAsciiTable(text: string): string[][] | null {
  // Flexible: treat any block of lines starting and ending with '|' as a table
  const lines = text.split('\n').filter(line => line.trim().startsWith('|') && line.trim().endsWith('|'));
  if (lines.length < 1) return null;
  // Remove leading/trailing |
  const rows = lines.map(line => line.trim().slice(1, -1).split('|').map(cell => cell.trim()));
  // If the first row is a header and the second row is a separator, remove separator
  if (rows.length > 1 && rows[1].every(cell => /^-+$/.test(cell))) {
    return [rows[0], ...rows.slice(2)];
  }
  return rows;
}

// Add back isMarkdownTable
function isMarkdownTable(text: string): boolean {
  // Looks for at least one line with | and a separator row
  const lines = text.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].includes('|') && /^\s*\|?\s*(:?-+:?\s*\|)+\s*$/.test(lines[i + 1])) {
      return true;
    }
  }
  return false;
}

// Fix parseKeyValueBlock to always return string[][]
function parseKeyValueBlock(text: string): string[][] | null {
  const lines = text.split('\n').filter(line => line.trim() && !line.trim().startsWith('|'));
  if (lines.length < 2) return null;
  let sep = null;
  if (lines.some(line => line.includes('  '))) sep = '  ';
  else if (lines.some(line => line.includes(':'))) sep = ':';
  else return null;
  const rows: string[][] = [];
  for (const line of lines) {
    let parts = sep === '  ' ? line.split(/\s{2,}/) : line.split(/\s*:\s*/);
    if (parts.length < 2) continue;
    rows.push([parts[0].trim(), parts.slice(1).join(sep).trim()]);
  }
  if (rows.length < 2) return null;
  return [['Item', 'Specification'], ...rows];
}

function extractTableBlock(text: string): { type: 'ascii' | 'kv', block: string } | null {
  // Extracts the first table-like block (ASCII or key-value) from the text
  const lines = text.split('\n');
  let start = -1, end = -1, type: 'ascii' | 'kv' | null = null;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|') && start === -1) { start = i; type = 'ascii'; }
    if (start !== -1 && type === 'ascii' && (!lines[i].trim().startsWith('|') || i === lines.length - 1)) {
      end = i === lines.length - 1 ? i + 1 : i;
      break;
    }
    // Key-value block: at least 2 lines, both have two or more spaces or a colon
    if (lines[i].match(/\S+\s{2,}\S+/) && start === -1) { start = i; type = 'kv'; }
    if (start !== -1 && type === 'kv' && (lines[i].trim() === '' || i === lines.length - 1)) {
      end = i === lines.length - 1 ? i + 1 : i;
      break;
    }
  }
  if (start !== -1 && end !== -1 && end > start && type) {
    return { type, block: lines.slice(start, end).join('\n') };
  }
  return null;
}

function renderTable(table: string[][]) {
  if (!table || table.length === 0) return null;
  const [header, ...rows] = table;
  return (
    <div className="overflow-x-auto my-4">
      <table className="min-w-max border border-zinc-300 dark:border-zinc-700 rounded-md">
        <thead>
          <tr>
            {header.map((cell, i) => (
              <th key={i} className="px-3 py-2 border-b border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-left font-semibold text-sm">{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 text-sm">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper: find all table-like blocks and split text into segments
function splitIntoSegments(text: string): Array<{ type: 'ascii' | 'kv' | 'markdown', content: string }> {
  const lines = text.split('\n');
  const segments: Array<{ type: 'ascii' | 'kv' | 'markdown', content: string }> = [];
  let buffer: string[] = [];
  let i = 0;
  while (i < lines.length) {
    // ASCII table block
    if (lines[i].trim().startsWith('|')) {
      if (buffer.length > 0) {
        segments.push({ type: 'markdown', content: buffer.join('\n') });
        buffer = [];
      }
      let start = i;
      while (i < lines.length && lines[i].trim().startsWith('|')) i++;
      segments.push({ type: 'ascii', content: lines.slice(start, i).join('\n') });
      continue;
    }
    // Key-value block (at least 2 lines with two or more spaces or a colon)
    if (lines[i].match(/\S+\s{2,}\S+/) || lines[i].includes(':')) {
      // Look ahead for at least one more line
      let start = i;
      let found = false;
      let j = i + 1;
      while (j < lines.length && (lines[j].match(/\S+\s{2,}\S+/) || lines[j].includes(':'))) {
        found = true;
        j++;
      }
      if (found) {
        if (buffer.length > 0) {
          segments.push({ type: 'markdown', content: buffer.join('\n') });
          buffer = [];
        }
        segments.push({ type: 'kv', content: lines.slice(start, j).join('\n') });
        i = j;
        continue;
      }
    }
    buffer.push(lines[i]);
    i++;
  }
  if (buffer.length > 0) {
    segments.push({ type: 'markdown', content: buffer.join('\n') });
  }
  return segments;
}

const NonMemoizedMarkdown = ({ children, forceTable }: { children: string, forceTable?: boolean }) => {
  if (forceTable) {
    // Split into segments and render each
    const segments = splitIntoSegments(children);
    return (
      <>
        {segments.map((seg, idx) => {
          if (seg.type === 'ascii') {
            const parsed = parseAsciiTable(seg.content);
            if (parsed) return <React.Fragment key={idx}>{renderTable(parsed)}</React.Fragment>;
          } else if (seg.type === 'kv') {
            const parsed = parseKeyValueBlock(seg.content);
            if (parsed) return <React.Fragment key={idx}>{renderTable(parsed)}</React.Fragment>;
          }
          // markdown
          return <ReactMarkdown key={idx} remarkPlugins={remarkPlugins} components={components}>{seg.content}</ReactMarkdown>;
        })}
      </>
    );
  }
  // Fallback: normal markdown
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children && prevProps.forceTable === nextProps.forceTable,
);
