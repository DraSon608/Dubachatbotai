import React, { useState } from 'react';
import { Copy, Check, Play, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onOpenSandbox?: (code: string, lang: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onOpenSandbox }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content into code blocks and markdown blocks
  const parts: { type: 'code' | 'markdown'; code?: string; lang?: string; text?: string }[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'markdown',
        text: content.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'text',
      code: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'markdown',
      text: content.slice(lastIndex),
    });
  }

  let codeBlockCount = 0;

  return (
    <div className="space-y-3 leading-relaxed text-slate-200">
      {parts.map((part, pIdx) => {
        if (part.type === 'code' && part.code !== undefined) {
          const currentCodeIdx = codeBlockCount++;
          const lang = part.lang || 'code';
          const isRunnable = ['js', 'javascript', 'ts', 'typescript', 'html'].includes(lang.toLowerCase());

          return (
            <div
              key={pIdx}
              className="my-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 px-4 py-2 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 uppercase font-semibold tracking-wider text-cyan-400">
                  <Terminal className="h-3.5 w-3.5" />
                  {lang}
                </span>
                <div className="flex items-center gap-2">
                  {isRunnable && onOpenSandbox && (
                    <button
                      onClick={() => onOpenSandbox(part.code!, lang)}
                      className="flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                      title="Run in Duba Sandbox"
                    >
                      <Play className="h-3 w-3" />
                      Run Code
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(part.code!, currentCodeIdx)}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {copiedIndex === currentCodeIdx ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="overflow-x-auto p-4 text-xs sm:text-sm font-mono text-slate-200 leading-normal bg-slate-950/40">
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }

        // Render formatted markdown text
        return <MarkdownText key={pIdx} text={part.text || ''} />;
      })}
    </div>
  );
};

const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = (keyPrefix: string) => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(1);

      elements.push(
        <div key={`${keyPrefix}-tbl`} className="my-3 overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-900/90 text-cyan-300 font-semibold border-b border-slate-800">
              <tr>
                {header.map((col, cIdx) => (
                  <th key={cIdx} className="px-3 py-2 border-r border-slate-800 last:border-r-0">
                    {parseInline(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {body.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 border-r border-slate-800/60 last:border-r-0">
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Markdown Table Detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cols = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // Check if it's separator line (e.g. |---|---|)
      const isSep = cols.every((c) => /^:?-+:?$/.test(c));
      if (!isSep) {
        tableRows.push(cols);
        inTable = true;
      }
      return;
    } else if (inTable) {
      flushTable(`tbl-${idx}`);
    }

    if (!trimmed) {
      elements.push(<div key={`br-${idx}`} className="h-2" />);
      return;
    }

    // Horizontal Rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      elements.push(<hr key={`hr-${idx}`} className="my-4 border-slate-800" />);
      return;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="mt-4 mb-2 text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {parseInline(trimmed.slice(4))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="mt-5 mb-2.5 text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-1">
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="mt-6 mb-3 text-xl sm:text-2xl font-black text-cyan-400 tracking-tight">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={idx}
          className="my-2 border-l-4 border-cyan-500/80 bg-cyan-950/20 px-4 py-2 italic text-slate-300 rounded-r"
        >
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Unordered List
    if (/^[-*•]\s/.test(trimmed)) {
      elements.push(
        <div key={idx} className="flex items-start gap-2.5 my-1 pl-2">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
          <span className="flex-1 text-slate-200">{parseInline(trimmed.replace(/^[-*•]\s+/, ''))}</span>
        </div>
      );
      return;
    }

    // Ordered List
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={idx} className="flex items-start gap-2.5 my-1 pl-2">
          <span className="text-xs font-mono font-bold text-cyan-400 shrink-0 mt-0.5">
            {numMatch[1]}.
          </span>
          <span className="flex-1 text-slate-200">{parseInline(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Regular Paragraph
    elements.push(
      <p key={idx} className="my-1.5 text-slate-200">
        {parseInline(line)}
      </p>
    );
  });

  if (inTable) {
    flushTable('tbl-end');
  }

  return <div>{elements}</div>;
};

// Parse inline markdown tokens: `code`, **bold**, *italic*, [link](url)
function parseInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    const val = match[0];
    if (val.startsWith('`') && val.endsWith('`')) {
      tokens.push(
        <code
          key={match.index}
          className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-xs text-cyan-300 border border-slate-700/60"
        >
          {val.slice(1, -1)}
        </code>
      );
    } else if (val.startsWith('**') && val.endsWith('**')) {
      tokens.push(
        <strong key={match.index} className="font-semibold text-white">
          {val.slice(2, -2)}
        </strong>
      );
    } else if (val.startsWith('*') && val.endsWith('*')) {
      tokens.push(
        <em key={match.index} className="italic text-slate-300">
          {val.slice(1, -1)}
        </em>
      );
    } else if (val.startsWith('[') && val.includes('](')) {
      const parts = val.slice(1, -1).split('](');
      tokens.push(
        <a
          key={match.index}
          href={parts[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline hover:text-cyan-300 transition-colors"
        >
          {parts[0]}
        </a>
      );
    }

    lastIndex = match.index + val.length;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}
