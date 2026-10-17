import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Mic,
  MicOff,
  Plus,
  Paperclip,
  Sparkles,
  Code2,
  FileText,
  X,
  Compass,
  Cpu,
  Cloud,
} from 'lucide-react';
import { translations } from '../services/translations';

interface AttachedFile {
  name: string;
  size: number;
  content: string;
}

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: AttachedFile[]) => void;
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
  onOpenAutomation?: () => void;
  onOpenSandbox?: () => void;
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
  onOpenAutomation,
  onOpenSandbox,
}) => {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  // Auto-resize textarea seamlessly up to 200px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 200)}px`;
    }
  }, [input]);

  // Click outside to close tools menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowToolsMenu(false);
      }
    };
    if (showToolsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showToolsMenu]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isStreaming) {
      onStopStreaming();
      return;
    }
    const trimmed = input.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    let finalContent = trimmed;
    if (attachedFiles.length > 0) {
      const fileHeaders = attachedFiles
        .map((f) => `### Attached File: \`${f.name}\`\n\`\`\`\n${f.content.slice(0, 8000)}\n\`\`\``)
        .join('\n\n');
      finalContent = finalContent ? `${finalContent}\n\n${fileHeaders}` : fileHeaders;
    }

    onSendMessage(finalContent, attachedFiles);
    setInput('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
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
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            content,
          },
        ]);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setShowToolsMenu(false);
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
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

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 sm:pb-6">
      {/* Floating ChatGPT Omnibox */}
      <div className="relative flex flex-col rounded-[26px] border border-white/10 bg-[#2f2f2f] shadow-2xl focus-within:border-white/20 transition-all">
        {/* Attached Files Carousel */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1 border-b border-white/5">
            {attachedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl bg-[#212121] px-3 py-1.5 text-xs text-slate-200 border border-white/10"
              >
                <FileText className="h-3.5 w-3.5 text-amber-400" />
                <span className="max-w-[160px] truncate font-medium">{file.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(file.size / 1024).toFixed(1)}KB
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachedFile(idx)}
                  className="rounded-full p-0.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Area */}
        <div className="relative flex items-end px-3 py-2">
          {/* Left Tools / Attach (+) Button */}
          <div className="relative mb-1" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowToolsMenu((prev) => !prev)}
              title="Attach files or open tools"
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                showToolsMenu
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Plus className="h-4 w-4" />
            </button>

            {/* Tools Dropdown Menu */}
            {showToolsMenu && (
              <div className="absolute bottom-11 left-0 z-50 w-56 rounded-2xl border border-white/10 bg-[#212121] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition text-left"
                >
                  <Paperclip className="h-4 w-4 text-amber-400" />
                  <span>Upload Document / Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowToolsMenu(false);
                    onOpenAutomation?.();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition text-left"
                >
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>Automation Hub & Templates</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowToolsMenu(false);
                    onOpenSandbox?.();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition text-left"
                >
                  <Code2 className="h-4 w-4 text-indigo-400" />
                  <span>Code Sandbox Runner</span>
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json,.csv,.md,.js,.ts,.py,.html,.css,.sql"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Expanding Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? t.inputListening
                : language === 'dz'
                ? 'དུ་བ་ལུ་ འདྲི་བ་དང་ རང་བཞིན་ལས་རིམ་གྱི་སྐོར་ལས་དྲིས...'
                : 'Message Duba...'
            }
            rows={1}
            className="flex-1 max-h-[200px] resize-none bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none leading-relaxed"
          />

          {/* Right Action Icons: Microphone + Send/Stop Button */}
          <div className="flex items-center gap-1.5 mb-1 shrink-0">
            {/* Voice Dictation */}
            {recognitionSupported && (
              <button
                type="button"
                onClick={toggleMic}
                title={isListening ? 'Stop voice recording' : 'Dictate with voice'}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  isListening
                    ? 'text-rose-400 bg-rose-950/60 ring-2 ring-rose-500 animate-pulse'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}

            {/* Send / Stop Generating Button (ChatGPT Style) */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                title="Stop generating"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-slate-200 active:scale-95 transition shadow"
              >
                <Square className="h-3 w-3 fill-current text-black" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!input.trim() && attachedFiles.length === 0}
                title="Send message"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all shadow ${
                  input.trim() || attachedFiles.length > 0
                    ? 'bg-white text-black hover:bg-slate-200 active:scale-95'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed opacity-40'
                }`}
              >
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ChatGPT Sub-footer Disclaimer */}
      <div className="mt-2 text-center text-[11px] text-slate-400">
        {language === 'dz'
          ? 'དུ་བ་གླེང་མོལ་རྩིས་འཕྲུལ་འདི་ དྲ་རྒྱ་ཡོད་མེད་གཉིས་ཆ་རར་ལཱ་འབད་ཚུགས། གལ་ཆེ་བའི་གནས་ཚུལ་ཚུ་བསྐྱར་ཞིབ་འབད་གནང་།'
          : 'Duba can make mistakes. Check important info. Operates 100% on-device offline & cloud turbo.'}
      </div>
    </div>
  );
};
