import React, { useState } from 'react';
import { X, Sparkles, FileText, Regex, ArrowRightLeft, CheckSquare, Search, Copy, Check, MessageSquarePlus } from 'lucide-react';
import { offlineSummarizeText, offlineExtractData } from '../services/offlineBrain';

interface AutomationHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (prompt: string) => void;
}

export const AutomationHubModal: React.FC<AutomationHubModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'summarize' | 'extract' | 'convert' | 'regex' | 'prompts'>('summarize');
  const [inputText, setInputText] = useState('');
  const [resultText, setResultText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSummarize = () => {
    if (!inputText.trim()) return;
    const summary = offlineSummarizeText(inputText, 4);
    setResultText(summary);
  };

  const handleExtract = () => {
    if (!inputText.trim()) return;
    const data = offlineExtractData(inputText);
    const lines = [
      `Emails (${data.emails.length}): ${data.emails.join(', ') || 'None'}`,
      `Links (${data.urls.length}): ${data.urls.join(', ') || 'None'}`,
      `Hashtags (${data.hashtags.length}): ${data.hashtags.join(', ') || 'None'}`,
      `Numbers (${data.numbers.length}): ${data.numbers.join(', ') || 'None'}`,
    ];
    setResultText(lines.join('\n\n'));
  };

  const handleJsonToTable = () => {
    try {
      const parsed = JSON.parse(inputText);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length === 0) return;
      const keys = Object.keys(arr[0]);
      const header = `| ${keys.join(' | ')} |`;
      const sep = `| ${keys.map(() => '---').join(' | ')} |`;
      const rows = arr.map((item) => `| ${keys.map((k) => String(item[k] ?? '')).join(' | ')} |`);
      setResultText([header, sep, ...rows].join('\n'));
    } catch (e: any) {
      setResultText(`Invalid JSON: ${e.message}`);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendResultToChat = () => {
    onSendToChat(`Here is the automated output:\n\n${resultText}`);
    onClose();
  };

  const promptTemplates = [
    {
      title: 'Python Web Scraper Automation',
      desc: 'Build an automated script using BeautifulSoup and Requests.',
      prompt: 'Write an automated Python web scraper using requests and BeautifulSoup that handles pagination, user-agent headers, and saves results to CSV.',
    },
    {
      title: 'REST API Authentication Flow',
      desc: 'Create secure JWT token auth with refresh token middleware.',
      prompt: 'Design and write an Express.js TypeScript JWT authentication middleware with accessToken (15m expiry), refreshToken (7d expiry), and secure cookie storage.',
    },
    {
      title: 'Automated CI/CD GitHub Actions',
      desc: 'Workflow for linting, testing, and building upon push to main.',
      prompt: 'Generate a complete .github/workflows/deploy.yml file that sets up Node.js, installs dependencies with caching, runs linter, tests, and builds Vite app.',
    },
    {
      title: 'SQL Performance Optimization',
      desc: 'Analyze query, indexing strategies, and execution plan.',
      prompt: 'Show me how to optimize a slow SQL SELECT query involving 3 table JOINs with over 500,000 rows. Explain B-Tree indexes, composite keys, and EXPLAIN ANALYZE.',
    },
    {
      title: 'Automated Daily Task Planner',
      desc: 'Time-block priorities into high, medium, and low impact.',
      prompt: 'Create an automated structured daily schedule template based on the Eisenhower Matrix and Pomodoro technique to balance deep work, meetings, and recovery.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6">
      <div className="relative flex flex-col h-[85vh] w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Duba AI Automation Hub
              </h2>
              <p className="text-xs text-slate-400">
                100% On-device automated tools & workflow templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 bg-slate-950/60 px-4 py-2 text-xs">
          <button
            onClick={() => {
              setActiveTab('summarize');
              setResultText('');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === 'summarize' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Text Summarizer
          </button>
          <button
            onClick={() => {
              setActiveTab('extract');
              setResultText('');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === 'extract' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            Entity Extractor
          </button>
          <button
            onClick={() => {
              setActiveTab('convert');
              setResultText('');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === 'convert' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            JSON to Table
          </button>
          <button
            onClick={() => {
              setActiveTab('prompts');
              setResultText('');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === 'prompts' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Prompt Templates
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'prompts' ? (
            <div className="grid grid-cols-1 gap-3">
              <p className="text-xs text-slate-400">
                Click any automation recipe to instantly insert it into Duba Chat:
              </p>
              {promptTemplates.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSendToChat(item.prompt);
                    onClose();
                  }}
                  className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:border-cyan-500/50 hover:bg-slate-800/40 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">
                      {item.title}
                    </h4>
                    <span className="flex items-center gap-1 text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition">
                      Launch <MessageSquarePlus className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Input Data / Raw Text:
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    activeTab === 'convert'
                      ? '[{"id": 1, "task": "Deploy app", "status": "Done"}, {"id": 2, "task": "Run tests", "status": "Pending"}]'
                      : 'Paste articles, logs, transcripts, or unformatted text here...'
                  }
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs sm:text-sm text-slate-200 outline-none focus:border-cyan-500/60 transition"
                />
              </div>

              <div className="flex items-center gap-2">
                {activeTab === 'summarize' && (
                  <button
                    onClick={handleSummarize}
                    className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-cyan-500 transition"
                  >
                    Run Automated Summary
                  </button>
                )}
                {activeTab === 'extract' && (
                  <button
                    onClick={handleExtract}
                    className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-cyan-500 transition"
                  >
                    Extract Contacts & Entities
                  </button>
                )}
                {activeTab === 'convert' && (
                  <button
                    onClick={handleJsonToTable}
                    className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-cyan-500 transition"
                  >
                    Convert to Markdown Table
                  </button>
                )}
                <button
                  onClick={() => {
                    setInputText('');
                    setResultText('');
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
                >
                  Clear
                </button>
              </div>

              {resultText && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                    <span className="text-xs font-mono font-semibold text-cyan-400">
                      Automation Result:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyResult}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 transition"
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={sendResultToChat}
                        className="flex items-center gap-1 rounded bg-cyan-600/30 px-2.5 py-1 text-xs text-cyan-300 hover:bg-cyan-600/50 transition"
                      >
                        <MessageSquarePlus className="h-3 w-3" />
                        Send to Chat
                      </button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs sm:text-sm font-mono text-slate-200">
                    {resultText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
