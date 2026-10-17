import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Settings,
  Sparkles,
  Wifi,
  WifiOff,
  Code2,
  X,
  FileDown,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Radio,
  PanelLeftClose,
  SquarePen,
  User,
} from 'lucide-react';
import { ChatSession, NetworkConnectionType } from '../types/chat';
import { PWAInstallButton } from './PWAInstallButton';
import { StorageService } from '../services/storage';
import { translations } from '../services/translations';
import { BhutanFlagLogo } from './BhutanFlagLogo';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onUpdateSessionTitle: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  onOpenSettings: () => void;
  onOpenAutomation: () => void;
  onOpenSandbox: () => void;
  isOnline: boolean;
  pingMs: number | null;
  forceOffline: boolean;
  language: 'en' | 'dz';
  connectionType?: NetworkConnectionType;
  effectiveType?: string;
}

interface SearchMatchItem {
  session: ChatSession;
  matchedInTitle: boolean;
  messageMatches: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    snippet: string;
    timestamp: number;
  }[];
  totalCount: number;
}

// Text Highlighter Helper
const HighlightedText: React.FC<{ text: string; query: string; className?: string }> = ({
  text,
  query,
  className = '',
}) => {
  if (!query.trim()) return <span className={className}>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded bg-amber-400/35 px-0.5 font-bold text-amber-200 border-b border-amber-400/70"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onUpdateSessionTitle,
  onTogglePinSession,
  onOpenSettings,
  onOpenAutomation,
  onOpenSandbox,
  isOnline,
  pingMs,
  forceOffline,
  language,
  connectionType = 'unknown',
  effectiveType,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'titles' | 'messages'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  // Global keydown shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const startEditing = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveEditing = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editTitle.trim()) {
      onUpdateSessionTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const exportSessionMarkdown = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const md = StorageService.exportSessionAsMarkdown(s);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Full Text Search Across Titles AND Message History
  const searchResults: SearchMatchItem[] = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return [];

    const results: SearchMatchItem[] = [];

    for (const session of sessions) {
      const inTitle = session.title.toLowerCase().includes(trimmed);
      const messageMatches: SearchMatchItem['messageMatches'] = [];

      for (const msg of session.messages) {
        const contentLower = msg.content.toLowerCase();
        const matchIdx = contentLower.indexOf(trimmed);
        if (matchIdx !== -1) {
          const start = Math.max(0, matchIdx - 32);
          const end = Math.min(msg.content.length, matchIdx + trimmed.length + 55);
          let snippet = msg.content.slice(start, end).replace(/\s+/g, ' ');
          if (start > 0) snippet = '...' + snippet;
          if (end < msg.content.length) snippet = snippet + '...';

          messageMatches.push({
            id: msg.id,
            role: msg.role,
            snippet,
            timestamp: msg.timestamp,
          });
        }
      }

      const totalCount = (inTitle ? 1 : 0) + messageMatches.length;

      if (totalCount > 0) {
        if (searchFilter === 'titles' && !inTitle) continue;
        if (searchFilter === 'messages' && messageMatches.length === 0) continue;

        results.push({
          session,
          matchedInTitle: inTitle,
          messageMatches,
          totalCount,
        });
      }
    }

    return results;
  }, [sessions, searchQuery, searchFilter]);

  const totalMatchCount = useMemo(() => {
    return searchResults.reduce((acc, item) => acc + item.totalCount, 0);
  }, [searchResults]);

  // Chronologically grouped sessions
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const pinnedSessions = sessions.filter((s) => s.isPinned);
  const unpinned = sessions.filter((s) => !s.isPinned);

  const todaySessions = unpinned.filter((s) => now - s.updatedAt < oneDay);
  const yesterdaySessions = unpinned.filter(
    (s) => now - s.updatedAt >= oneDay && now - s.updatedAt < 2 * oneDay
  );
  const previous7Days = unpinned.filter(
    (s) => now - s.updatedAt >= 2 * oneDay && now - s.updatedAt < 7 * oneDay
  );
  const olderSessions = unpinned.filter((s) => now - s.updatedAt >= 7 * oneDay);

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = editingId === session.id;

    return (
      <div
        key={session.id}
        onClick={() => {
          onSelectSession(session.id);
          onCloseMobile();
        }}
        className={`group relative flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-all ${
          isActive
            ? 'bg-[#212121] text-white font-medium border border-white/5 shadow-sm'
            : 'text-slate-300 hover:bg-[#212121]/60 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {session.isPinned && (
            <Pin className="h-3 w-3 shrink-0 text-amber-400 fill-amber-400" />
          )}
          {isEditing ? (
            <form onSubmit={(e) => saveEditing(session.id, e)} className="flex-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => saveEditing(session.id)}
                autoFocus
                className="w-full bg-[#171717] px-1.5 py-0.5 rounded text-xs text-white outline-none border border-amber-400"
              />
            </form>
          ) : (
            <span className="truncate">{session.title}</span>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinSession(session.id);
              }}
              title={session.isPinned ? 'Unpin chat' : 'Pin chat'}
              className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-white/10"
            >
              <Pin className={`h-3 w-3 ${session.isPinned ? 'text-amber-400 fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={(e) => startEditing(session, e)}
              title="Rename"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => exportSessionMarkdown(session, e)}
              title="Export as Markdown"
              className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-white/10"
            >
              <FileDown className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              title="Delete chat"
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/10"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ChatGPT Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-[260px] flex-col border-r border-white/5 bg-[#171717] transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Bhutanese Flag Logo & Collapse Button */}
        <div className="flex items-center justify-between p-3.5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <BhutanFlagLogo size="sm" withGlow className="shadow-amber-500/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">
                {t.appName}
              </span>
              <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-mono font-bold text-amber-300">
                🇧🇹
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            title="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* ChatGPT New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 active:scale-[0.98] transition shadow-sm"
          >
            <span className="flex items-center gap-2">
              <SquarePen className="h-3.5 w-3.5 text-amber-400" />
              <span>{t.newChat}</span>
            </span>
            <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.2 text-[10px] font-mono text-slate-400">
              Ctrl+K
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2 space-y-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'dz'
                  ? 'མིང་བྱང་དང་ གླེང་མོལ་ནང་འཚོལ་ཞིབ...'
                  : 'Search conversations...'
              }
              className="w-full rounded-xl border border-white/5 bg-[#212121] pl-9 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-white/20 transition"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 rounded-full p-0.5 text-slate-400 hover:text-white"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="absolute right-2 text-[10px] font-mono text-slate-500">
                /
              </span>
            )}
          </div>

          {searchQuery.trim() && (
            <div className="flex items-center justify-between text-[11px] pt-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchFilter('all')}
                  className={`rounded-md px-1.5 py-0.5 font-medium transition ${
                    searchFilter === 'all'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSearchFilter('titles')}
                  className={`rounded-md px-1.5 py-0.5 font-medium transition ${
                    searchFilter === 'titles'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Titles
                </button>
                <button
                  onClick={() => setSearchFilter('messages')}
                  className={`rounded-md px-1.5 py-0.5 font-medium transition ${
                    searchFilter === 'messages'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Messages
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-500">
                {searchResults.length} results
              </span>
            </div>
          )}
        </div>

        {/* Sessions Scroll List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
          {searchQuery.trim() ? (
            /* Search Results */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-white/5">
                <span>Search Results</span>
                <span>{totalMatchCount} matches</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-6 px-2 text-xs text-slate-500">
                  No conversations match "{searchQuery}"
                </div>
              ) : (
                searchResults.map(({ session, messageMatches, totalCount }) => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        onSelectSession(session.id);
                        onCloseMobile();
                      }}
                      className={`group flex flex-col gap-1 rounded-lg p-2 text-xs cursor-pointer transition ${
                        isActive
                          ? 'bg-[#212121] text-amber-200 border border-white/10'
                          : 'text-slate-300 hover:bg-[#212121]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          <HighlightedText text={session.title} query={searchQuery} />
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {totalCount}
                        </span>
                      </div>
                      {messageMatches.length > 0 && (
                        <p className="line-clamp-2 text-[11px] text-slate-400 bg-black/20 p-1.5 rounded">
                          <HighlightedText
                            text={messageMatches[0].snippet}
                            query={searchQuery}
                          />
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Chronological Chat History */
            <>
              {pinnedSessions.length > 0 && (
                <div>
                  <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1">
                    <Pin className="h-2.5 w-2.5 fill-amber-400/80" /> {t.pinned}
                  </div>
                  <div className="space-y-0.5">{pinnedSessions.map(renderSessionItem)}</div>
                </div>
              )}

              {todaySessions.length > 0 && (
                <div>
                  <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t.today}
                  </div>
                  <div className="space-y-0.5">{todaySessions.map(renderSessionItem)}</div>
                </div>
              )}

              {yesterdaySessions.length > 0 && (
                <div>
                  <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t.yesterday}
                  </div>
                  <div className="space-y-0.5">{yesterdaySessions.map(renderSessionItem)}</div>
                </div>
              )}

              {previous7Days.length > 0 && (
                <div>
                  <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t.previous7Days}
                  </div>
                  <div className="space-y-0.5">{previous7Days.map(renderSessionItem)}</div>
                </div>
              )}

              {olderSessions.length > 0 && (
                <div>
                  <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t.older}
                  </div>
                  <div className="space-y-0.5">{olderSessions.map(renderSessionItem)}</div>
                </div>
              )}

              {sessions.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  {t.noChats}
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Launch Tools */}
        <div className="border-t border-white/5 p-2 space-y-0.5">
          <button
            onClick={onOpenAutomation}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>{t.automationHub}</span>
          </button>
          <button
            onClick={onOpenSandbox}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <Code2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>{t.codeSandbox}</span>
          </button>
        </div>

        {/* Bottom Profile & Status (ChatGPT Style) */}
        <div className="border-t border-white/5 p-2 bg-[#171717]">
          <div className="flex items-center justify-between rounded-xl p-2 hover:bg-white/5 transition cursor-pointer" onClick={onOpenSettings}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold text-xs shrink-0 shadow">
                DB
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  Duba User
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  {isOnline && !forceOffline ? (
                    connectionType === 'cellular' ? (
                      <>
                        <Radio className="h-2.5 w-2.5 text-cyan-400 animate-pulse" />
                        <span>Mobile ({effectiveType || '4G'})</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="h-2.5 w-2.5 text-emerald-400" />
                        <span>Wi-Fi ({pingMs ? `${pingMs}ms` : 'active'})</span>
                      </>
                    )
                  ) : (
                    <>
                      <WifiOff className="h-2.5 w-2.5 text-amber-400" />
                      <span>Offline Core</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
              }}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
