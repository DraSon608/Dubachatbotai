import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Paperclip,
  Sparkles,
  Cpu,
  Cloud,
  Code,
  Calculator,
  FileText,
  Compass,
} from 'lucide-react';
import { translations } from '../services/translations';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  isOnline: boolean;
  forceOffline: boolean;
  onStartListening: (onResult: (text: string) => void) => void;
  onStopListening: () => void;
  isListening: boolean;
  recognitionSupported: boolean;
  onSelectPromptStarter?: (prompt: string) => void;
  hasMessages: boolean;
  language: 'en' | 'dz';
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  isOnline,
  forceOffline,
  onStartListening,
  onStopListening,
  isListening,
  recognitionSupported,
  onSelectPromptStarter,
  hasMessages,
  language,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isStreaming) {
      onStopStreaming();
      return;
    }
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInput(
          (prev) =>
            `${prev ? prev + '\n\n' : ''}Analyze this file (${file.name}):\n\`\`\`\n${content.slice(
              0,
              6000
            )}\n\`\`\``
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleMic = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening((transcript) => {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      });
    }
  };

  const starters = [
    {
      icon: <Code className="h-3.5 w-3.5 text-cyan-400" />,
      label: t.starterPythonLabel,
      prompt: t.starterPythonPrompt,
    },
    {
      icon: <Compass className="h-3.5 w-3.5 text-amber-400" />,
      label: t.starterBhutanLabel,
      prompt: t.starterBhutanPrompt,
    },
    {
      icon: <Calculator className="h-3.5 w-3.5 text-indigo-400" />,
      label: t.starterMathLabel,
      prompt: t.starterMathPrompt,
    },
    {
      icon: <FileText className="h-3.5 w-3.5 text-purple-400" />,
      label: t.starterSummaryLabel,
      prompt: t.starterSummaryPrompt,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-4 sm:pb-6">
      {/* Prompt Starters when chat is fresh */}
      {!hasMessages && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {starters.map((starter, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPromptStarter?.(starter.prompt)}
              className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-left hover:border-cyan-500/40 hover:bg-slate-850/80 transition group shadow-sm"
            >
              <div className="rounded-lg bg-slate-800 p-2 shrink-0 group-hover:scale-105 transition-transform">
                {starter.icon}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">
                  {starter.label}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {starter.prompt}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Input Box */}
      <div className="relative flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-xl focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? t.inputListening
              : isOnline && !forceOffline
              ? t.inputPlaceholderOnline
              : t.inputPlaceholderOffline
          }
          rows={1}
          className="w-full resize-none bg-transparent px-4 py-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none leading-relaxed"
        />

        {/* Input Bar Controls */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            {/* File attachment */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach text file or code (.txt, .json, .csv, .py, .js)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json,.csv,.md,.js,.ts,.py,.html,.css"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Mic button */}
            {recognitionSupported && (
              <button
                type="button"
                onClick={toggleMic}
                title={isListening ? 'Stop voice recording' : 'Dictate with voice (works offline)'}
                className={`p-1.5 rounded-lg transition ${
                  isListening
                    ? 'text-rose-400 bg-rose-950/60 animate-pulse border border-rose-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}

            {/* Offline / Online Active Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800">
              {isOnline && !forceOffline ? (
                <>
                  <Cloud className="h-2.5 w-2.5 text-cyan-400" />
                  <span>{t.cloudTurbo}</span>
                </>
              ) : (
                <>
                  <Cpu className="h-2.5 w-2.5 text-indigo-400" />
                  <span>{t.offlineCore}</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-rose-500 transition active:scale-95"
              >
                <Square className="h-3 w-3 fill-current" />
                <span>{t.stop}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!input.trim()}
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all shadow-md ${
                  input.trim()
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 active:scale-95'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 text-center text-[10px] text-slate-500">
        {t.disclaimer}
      </div>
    </div>
  );
};
