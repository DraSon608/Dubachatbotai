import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  User,
  Cpu,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { BhutanFlagLogo } from './BhutanFlagLogo';

interface ChatMessageProps {
  message: ChatMessageType;
  onRegenerate?: () => void;
  onOpenSandbox?: (code: string, lang: string) => void;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onOpenSandbox,
  onSpeak,
  isSpeaking,
  onStopSpeaking,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCloudModel = message.modelUsed === 'gemini-3.8-flash';

  return (
    <div
      className={`group relative flex w-full gap-3 sm:gap-4 px-3 sm:px-6 py-5 sm:py-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-slate-900/40 border-y border-slate-850/60'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isUser ? (
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 border border-slate-700/80 shadow-sm">
            <User className="h-4 w-4" />
          </div>
        ) : (
          <BhutanFlagLogo size="md" withGlow className="shadow-amber-500/30" />
        )}
      </div>

      {/* Message Content Container */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Author & Model Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-white">
              {isUser ? 'You' : 'Duba AI'}
            </span>
            {!isUser && message.modelUsed && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium border ${
                  isCloudModel
                    ? 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300'
                    : 'border-indigo-500/30 bg-indigo-950/40 text-indigo-300'
                }`}
              >
                {isCloudModel ? (
                  <>
                    <Cloud className="h-2.5 w-2.5 text-cyan-400" />
                    Cloud Turbo (Gemini 3.8)
                  </>
                ) : (
                  <>
                    <Cpu className="h-2.5 w-2.5 text-indigo-400" />
                    Duba Offline Core
                  </>
                )}
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Action buttons (copy, speak, regenerate) */}
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={copyText}
              title="Copy message"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>

            {!isUser && (
              <>
                <button
                  onClick={() => (isSpeaking ? onStopSpeaking() : onSpeak(message.content))}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                  className={`p-1 rounded transition ${
                    isSpeaking
                      ? 'text-cyan-400 bg-cyan-950/50 animate-pulse'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {isSpeaking ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>

                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    title="Regenerate response"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Text Body */}
        {isUser ? (
          <div className="whitespace-pre-wrap text-xs sm:text-sm text-slate-200 leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className="text-xs sm:text-sm">
            <MarkdownRenderer content={message.content} onOpenSandbox={onOpenSandbox} />
            {message.isStreaming && (
              <span className="inline-block h-3.5 w-1.5 translate-y-0.5 bg-cyan-400 animate-pulse ml-1" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
