import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  Cloud,
  Cpu,
  CornerDownLeft,
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
  onEditMessage?: (id: string, newContent: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onOpenSandbox,
  onSpeak,
  isSpeaking,
  onStopSpeaking,
  onEditMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(message.content);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);

  const isUser = message.role === 'user';
  const isCloudModel = message.modelUsed === 'gemini-3.8-flash';

  const copyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editDraft.trim() && editDraft.trim() !== message.content) {
      onEditMessage?.(message.id, editDraft.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditDraft(message.content);
    setIsEditing(false);
  };

  /* ========================================================================= */
  /* USER MESSAGE (ChatGPT Right-aligned Bubble with In-Place Edit)             */
  /* ========================================================================= */
  if (isUser) {
    return (
      <div className="group relative flex w-full justify-end px-4 py-3">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] space-y-1">
          {isEditing ? (
            <div className="w-full min-w-[280px] sm:min-w-[420px] rounded-[22px] bg-[#2f2f2f] p-3 border border-white/10 shadow-xl">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                autoFocus
                rows={3}
                className="w-full resize-none bg-transparent text-sm text-slate-100 outline-none leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
              />
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-full px-3 py-1 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit()}
                  disabled={!editDraft.trim()}
                  className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-black hover:bg-slate-200 transition disabled:opacity-40"
                >
                  <CornerDownLeft className="h-3 w-3" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-[24px] bg-[#2f2f2f] px-5 py-3 text-sm text-slate-100 shadow-sm leading-relaxed whitespace-pre-wrap break-words border border-white/5">
              {message.content}
            </div>
          )}

          {/* User message hover controls */}
          {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2 text-xs text-slate-400">
              {onEditMessage && (
                <button
                  onClick={() => setIsEditing(true)}
                  title="Edit prompt"
                  className="p-1 rounded-md hover:text-white hover:bg-white/10 transition"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={copyText}
                title="Copy prompt"
                className="p-1 rounded-md hover:text-white hover:bg-white/10 transition"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* ASSISTANT (DUBA AI) MESSAGE (ChatGPT Clean Stream with Action Bar)         */
  /* ========================================================================= */
  return (
    <div className="group relative flex w-full gap-3 sm:gap-4 px-4 py-4 sm:py-5 transition-colors">
      {/* Authentic Bhutan Flag Emblem */}
      <div className="shrink-0 mt-0.5">
        <BhutanFlagLogo size="md" withGlow className="shadow-amber-500/25 ring-1 ring-amber-400/40" />
      </div>

      {/* Message Body Column */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Assistant Header: Name & Model Pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-white tracking-wide">Duba</span>
          {message.modelUsed && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.2 text-[10px] font-mono font-medium border ${
                isCloudModel
                  ? 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300'
                  : 'border-indigo-500/30 bg-indigo-950/40 text-indigo-300'
              }`}
            >
              {isCloudModel ? (
                <>
                  <Cloud className="h-2.5 w-2.5 text-cyan-400" />
                  Cloud 3.8
                </>
              ) : (
                <>
                  <Cpu className="h-2.5 w-2.5 text-indigo-400" />
                  Offline Core
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

        {/* Markdown Rendered Content */}
        <div className="text-sm text-slate-100 leading-relaxed overflow-hidden">
          <MarkdownRenderer content={message.content} onOpenSandbox={onOpenSandbox} />
          {message.isStreaming && (
            <span className="inline-block h-4 w-2 translate-y-0.5 bg-amber-400 animate-pulse ml-1 rounded-sm shadow-sm shadow-amber-400/50" />
          )}
        </div>

        {/* ChatGPT Bottom Action Toolbar */}
        {!message.isStreaming && (
          <div className="flex items-center gap-1 pt-1.5 opacity-80 group-hover:opacity-100 transition-opacity text-slate-400">
            {/* Copy Button */}
            <button
              onClick={copyText}
              title="Copy message"
              className="flex items-center gap-1 rounded-lg p-1.5 hover:text-white hover:bg-white/10 transition text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>

            {/* Read Aloud Button */}
            <button
              onClick={() => (isSpeaking ? onStopSpeaking() : onSpeak(message.content))}
              title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              className={`flex items-center gap-1 rounded-lg p-1.5 transition text-xs ${
                isSpeaking
                  ? 'text-cyan-400 bg-cyan-950/60 animate-pulse'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              {isSpeaking ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>

            {/* Regenerate Button */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                title="Regenerate response"
                className="flex items-center gap-1 rounded-lg p-1.5 hover:text-white hover:bg-white/10 transition text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Thumbs Up / Down Feedback (ChatGPT style) */}
            <button
              onClick={() => setFeedback(feedback === 'liked' ? null : 'liked')}
              title="Good response"
              className={`rounded-lg p-1.5 transition ${
                feedback === 'liked'
                  ? 'text-emerald-400 bg-emerald-950/40'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setFeedback(feedback === 'disliked' ? null : 'disliked')}
              title="Bad response"
              className={`rounded-lg p-1.5 transition ${
                feedback === 'disliked'
                  ? 'text-rose-400 bg-rose-950/40'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
