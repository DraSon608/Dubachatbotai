import React, { useState, useEffect } from 'react';
import { X, Play, RotateCcw, Copy, Check, Terminal, Eye, Code } from 'lucide-react';

interface CodeSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialLang?: string;
}

export const CodeSandboxModal: React.FC<CodeSandboxModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  initialLang = 'javascript',
}) => {
  const [code, setCode] = useState(initialCode);
  const [lang, setLang] = useState(initialLang);
  const [tab, setTab] = useState<'console' | 'preview'>('console');
  const [output, setOutput] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [htmlSrcDoc, setHtmlSrcDoc] = useState('');

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setLang(initialLang || 'javascript');
      if (initialLang === 'html') {
        setTab('preview');
        setHtmlSrcDoc(initialCode);
      } else {
        setTab('console');
      }
    }
  }, [initialCode, initialLang, isOpen]);

  if (!isOpen) return null;

  const runCode = () => {
    setOutput([]);

    if (lang === 'html' || code.includes('<html') || code.includes('<div')) {
      setTab('preview');
      setHtmlSrcDoc(code);
      return;
    }

    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
      },
      error: (...args: any[]) => {
        logs.push(`[ERROR] ${args.map((a) => String(a)).join(' ')}`);
      },
      warn: (...args: any[]) => {
        logs.push(`[WARN] ${args.map((a) => String(a)).join(' ')}`);
      },
    };

    try {
      // Execute inside safe function scope
      // eslint-disable-next-line no-new-func
      const runner = new Function('console', `"use strict";\n${code}`);
      const ret = runner(customConsole);
      if (ret !== undefined) {
        logs.push(`➜ Returned: ${typeof ret === 'object' ? JSON.stringify(ret, null, 2) : String(ret)}`);
      }
      if (logs.length === 0) {
        logs.push('✓ Execution finished with no console output.');
      }
      setOutput(logs);
      setTab('console');
    } catch (err: any) {
      setOutput([`⚠️ Execution Error:\n${err.message || err}`]);
      setTab('console');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetTemplate = (templateName: string) => {
    if (templateName === 'fibonacci') {
      setCode(`// Fibonacci Generator Automation
function fibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

console.log("First 12 Fibonacci Numbers:");
console.log(fibonacci(12));`);
      setLang('javascript');
      setTab('console');
    } else if (templateName === 'card') {
      setCode(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #090d16; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .card { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 24px; border-radius: 16px; border: 1px solid #38bdf8; box-shadow: 0 10px 25px rgba(56,189,248,0.2); text-align: center; }
    h2 { color: #38bdf8; margin: 0 0 8px; }
    p { color: #94a3b8; font-size: 14px; }
    button { background: #06b6d4; border: none; padding: 10px 18px; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; }
    button:hover { background: #0891b2; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Duba AI Card</h2>
    <p>Rendered locally in the offline sandbox preview!</p>
    <button onclick="alert('Duba Sandbox Clicked!')">Click Me</button>
  </div>
</body>
</html>`);
      setLang('html');
      setTab('preview');
      setHtmlSrcDoc(code);
    } else if (templateName === 'pipeline') {
      setCode(`// Async Data Transformation Pipeline
const rawUsers = [
  { id: 1, name: "Alice", email: "alice@duba.ai", role: "admin", score: 92 },
  { id: 2, name: "Bob", email: "bob@sample.org", role: "user", score: 68 },
  { id: 3, name: "Charlie", email: "charlie@duba.ai", role: "user", score: 85 }
];

// Automation filter and transformer
const processed = rawUsers
  .filter(u => u.score >= 80)
  .map(u => ({
    userTag: \`@\${u.name.toLowerCase()}\`,
    scoreTier: u.score > 90 ? "Top Performer" : "Advanced",
    domain: u.email.split("@")[1]
  }));

console.log("Automated Pipeline Result:");
console.log(processed);`);
      setLang('javascript');
      setTab('console');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6">
      <div className="relative flex flex-col h-[90vh] w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              Duba Code Sandbox & Live Runner
            </h2>
            <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[11px] font-semibold text-cyan-400 border border-cyan-800">
              Offline Ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition"
              title="Copy code"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={runCode}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-cyan-500 transition active:scale-95"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Run Sandbox</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/90 px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Templates:</span>
            <button
              onClick={() => resetTemplate('fibonacci')}
              className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
            >
              Fibonacci Math
            </button>
            <button
              onClick={() => resetTemplate('pipeline')}
              className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
            >
              Data Pipeline
            </button>
            <button
              onClick={() => resetTemplate('card')}
              className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
            >
              HTML Card UI
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setTab('console')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
                tab === 'console' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="h-3 w-3" />
              Console Logs ({output.length})
            </button>
            <button
              onClick={() => {
                setTab('preview');
                setHtmlSrcDoc(code);
              }}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
                tab === 'preview' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="h-3 w-3" />
              Live HTML Preview
            </button>
          </div>
        </div>

        {/* Main Editor & Output Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Code Editor */}
          <div className="flex flex-col h-full bg-slate-950/60 p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono">Input Script ({lang}):</span>
              <button
                onClick={() => setCode('')}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-300"
              >
                <RotateCcw className="h-3 w-3" /> Clear
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write or paste JavaScript or HTML here..."
              className="flex-1 w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs sm:text-sm text-cyan-200 outline-none focus:border-cyan-500/60 transition"
              spellCheck={false}
            />
          </div>

          {/* Output / Preview Pane */}
          <div className="flex flex-col h-full bg-slate-900/50 p-3">
            <div className="text-xs text-slate-400 mb-2 font-mono">
              {tab === 'console' ? 'Execution Console Output:' : 'HTML DOM Render:'}
            </div>

            {tab === 'console' ? (
              <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 space-y-1.5">
                {output.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-600 italic">
                    Press "Run Sandbox" to execute your code...
                  </div>
                ) : (
                  output.map((line, idx) => (
                    <div
                      key={idx}
                      className={`whitespace-pre-wrap ${
                        line.startsWith('[ERROR]')
                          ? 'text-rose-400'
                          : line.startsWith('➜')
                          ? 'text-cyan-400 font-semibold'
                          : line.startsWith('[WARN]')
                          ? 'text-amber-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-hidden rounded-xl border border-slate-800 bg-white">
                <iframe
                  title="Duba Live HTML Preview"
                  srcDoc={htmlSrcDoc}
                  sandbox="allow-scripts"
                  className="h-full w-full border-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
