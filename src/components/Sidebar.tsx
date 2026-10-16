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
} from 'lucide-react';
import { ChatSession } from '../types/chat';
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

  // Advanced Search Across Titles AND Message History
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
          // Extract snippet with window before & after
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
        // Apply scope filter
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

  // Total matches count for badge
  const totalMatchCount = useMemo(() => {
    return searchResults.reduce((acc, item) => acc + item.totalCount, 0);
  }, [searchResults]);

  // Standard chronologically grouped sessions when not searching
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
        className={`group relative flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs cursor-pointer transition-all ${
          isActive
            ? 'bg-slate-800 text-cyan-300 font-medium shadow-sm border border-slate-700/60'
            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <MessageSquare
            className={`h-3.5 w-3.5 shrink-0 ${
              isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
            }`}
          />
          {isEditing ? (
            <form onSubmit={(e) => saveEditing(session.id, e)} className="flex-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => saveEditing(session.id)}
                autoFocus
                className="w-full bg-slate-950 px-1.5 py-0.5 rounded text-xs text-white outline-none border border-cyan-500"
              />
            </form>
          ) : (
            <span className="truncate">{session.title}</span>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="hidden group-hover:flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinSession(session.id);
              }}
              title={session.isPinned ? 'Unpin chat' : 'Pin chat'}
              className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800"
            >
              <Pin className={`h-3 w-3 ${session.isPinned ? 'text-amber-400 fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={(e) => startEditing(session, e)}
              title="Rename"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => exportSessionMarkdown(session, e)}
              title="Export as Markdown"
              className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
            >
              <FileDown className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              title="Delete chat"
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
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

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-80 flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Bhutanese Flag Logo */}
        <div className="flex items-center justify-between border-b border-slate-800/70 p-4">
          <div className="flex items-center gap-3">
            {/* Authentic Bhutanese Flag Logo */}
            <BhutanFlagLogo size="md" withGlow className="shadow-amber-500/30 ring-1 ring-amber-400/50" />

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black tracking-wider text-white">
                  {t.appName}
                </h1>
                <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-mono font-bold text-amber-300 border border-amber-500/30">
                  🇧🇹 BT
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400">
                {t.tagline}
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-500/20 hover:from-amber-400 hover:via-orange-400 hover:to-indigo-500 active:scale-[0.98] transition-all"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t.newChat}
            </span>
            <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-mono">
              Ctrl+K
            </span>
          </button>
        </div>

        {/* Precision Search Bar */}
        <div className="px-3 pb-2 space-y-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-amber-400/80" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'dz'
                  ? 'མིང་བྱང་དང་ གླེང་མོལ་ནང་འཚོལ་ཞིབ...'
                  : 'Search titles & message history...'
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30 transition shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 rounded-full p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="absolute right-2.5 rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[10px] font-mono text-slate-400">
                /
              </span>
            )}
          </div>

          {/* Search Scope Filter Chips when query exists */}
          {searchQuery.trim() && (
            <div className="flex items-center justify-between text-[11px] pt-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchFilter('all')}
                  className={`rounded-lg px-2 py-0.5 font-medium transition ${
                    searchFilter === 'all'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'dz' ? 'ཆ་ཚང་' : 'All'}
                </button>
                <button
                  onClick={() => setSearchFilter('titles')}
                  className={`rounded-lg px-2 py-0.5 font-medium transition ${
                    searchFilter === 'titles'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'dz' ? 'མིང་བྱང་' : 'Titles'}
                </button>
                <button
                  onClick={() => setSearchFilter('messages')}
                  className={`rounded-lg px-2 py-0.5 font-medium transition ${
                    searchFilter === 'messages'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'dz' ? 'གླེང་མོལ' : 'Messages'}
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-400">
                {searchResults.length} {language === 'dz' ? 'ཐོབ་ཡོད' : 'results'}
              </span>
            </div>
          )}
        </div>

        {/* Main Scroll Area: Search Results or Default Grouped Sessions */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
          {searchQuery.trim() ? (
            /* Search Results Mode */
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 border-b border-slate-800/60 pb-1.5">
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  {language === 'dz' ? 'འཚོལ་ཞིབ་གྲུབ་འབྲས' : 'Search Results'}
                </span>
                <span className="text-[10px] font-mono">
                  {totalMatchCount} {language === 'dz' ? 'མཐུན་པ' : 'matches'}
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-8 px-2 space-y-2">
                  <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-500">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-300">
                    {language === 'dz'
                      ? `"${searchQuery}" གི་ཐོག་ལས་ གླེང་མོལ་མ་ཐོབ།`
                      : `No results for "${searchQuery}"`}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'dz'
                      ? 'མིང་ཚིག་གཞན་ཅིག་ལག་ལེན་འཐབ་སྟེ་ འཚོལ་ཞིབ་འབད་གནང་།'
                      : 'Try different keywords or check spelling.'}
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-block mt-2 rounded-lg bg-slate-800 px-3 py-1 text-xs text-amber-300 hover:bg-slate-700"
                  >
                    {language === 'dz' ? 'འཚོལ་ཞིབ་བསུབ་དཱ' : 'Clear Search'}
                  </button>
                </div>
              ) : (
                searchResults.map(({ session, matchedInTitle, messageMatches, totalCount }) => {
                  const isActive = session.id === activeSessionId;

                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        onSelectSession(session.id);
                        onCloseMobile();
                      }}
                      className={`group relative flex flex-col gap-1.5 rounded-xl p-2.5 text-xs cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-slate-800/90 text-amber-200 border-amber-500/40 shadow-sm'
                          : 'bg-slate-900/50 border-slate-800/70 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      {/* Session Title Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 font-semibold text-white">
                          <MessageSquare className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                          <span className="truncate">
                            <HighlightedText text={session.title} query={searchQuery} />
                          </span>
                        </div>
                        <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[9px] font-mono text-slate-400 shrink-0">
                          {totalCount} {totalCount === 1 ? 'match' : 'matches'}
                        </span>
                      </div>

                      {/* Badges showing match location */}
                      <div className="flex items-center gap-1.5 text-[10px]">
                        {matchedInTitle && (
                          <span className="rounded bg-cyan-950/70 px-1.5 py-0.2 text-cyan-300 border border-cyan-800/40">
                            {language === 'dz' ? 'མིང་བྱང་ནང་' : 'In Title'}
                          </span>
                        )}
                        {messageMatches.length > 0 && (
                          <span className="rounded bg-amber-950/70 px-1.5 py-0.2 text-amber-300 border border-amber-800/40">
                            {messageMatches.length} {language === 'dz' ? 'གླེང་མོལ་ནང་' : 'in message history'}
                          </span>
                        )}
                        <span className="text-slate-500 ml-auto font-mono text-[9px]">
                          {new Date(session.updatedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Snippet Preview from Message History */}
                      {messageMatches.length > 0 && (
                        <div className="mt-1 rounded-lg bg-slate-950/70 p-2 text-[11px] text-slate-300 border border-slate-800/50 space-y-1">
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 uppercase font-mono">
                            <span>
                              {messageMatches[0].role === 'user' ? '👤 User:' : '🤖 Duba:'}
                            </span>
                          </div>
                          <p className="line-clamp-2 leading-relaxed">
                            <HighlightedText
                              text={messageMatches[0].snippet}
                              query={searchQuery}
                            />
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Default Grouped Chat Sessions Mode */
            <>
              {pinnedSessions.length > 0 && (
                <div>
                  <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1">
                    <Pin className="h-2.5 w-2.5 fill-amber-400/80" /> {t.pinned}
                  </div>
                  <div className="space-y-0.5">{pinnedSessions.map(renderSessionItem)}</div>
                </div>
              )}

              {todaySessions.length > 0 && (
                <div>
                  <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t.today}
                  </div>
                  <div className="space-y-0.5">{todaySessions.map(renderSessionItem)}</div>
                </div>
              )}

              {yesterdaySessions.length > 0 && (
                <div>
                  <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t.yesterday}
                  </div>
                  <div className="space-y-0.5">{yesterdaySessions.map(renderSessionItem)}</div>
                </div>
              )}

              {previous7Days.length > 0 && (
                <div>
                  <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t.previous7Days}
                  </div>
                  <div className="space-y-0.5">{previous7Days.map(renderSessionItem)}</div>
                </div>
              )}

              {olderSessions.length > 0 && (
                <div>
                  <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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

        {/* Quick Automation Tools Bar */}
        <div className="border-t border-slate-800/80 p-2 space-y-1 bg-slate-950/80">
          <button
            onClick={onOpenAutomation}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-900 hover:text-amber-300 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>{t.automationHub}</span>
          </button>
          <button
            onClick={onOpenSandbox}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-900 hover:text-amber-300 transition"
          >
            <Code2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>{t.codeSandbox}</span>
          </button>
        </div>

        {/* Bottom Status & Settings Footer */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-950">
          <div className="flex items-center justify-between mb-2.5">
            {/* Status indicator */}
            <div className="flex items-center gap-2 text-[11px]">
              {isOnline ? (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wifi className="h-3 w-3" />
                  <span className="font-medium">
                    {forceOffline ? t.forcedOffline : t.online}
                  </span>
                  {pingMs !== null && !forceOffline && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {pingMs}ms
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <WifiOff className="h-3 w-3" />
                  <span className="font-medium">{t.offline}</span>
                </div>
              )}
            </div>

            <PWAInstallButton variant="icon" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>{t.settings}</span>
            </button>
            <span className="text-[10px] text-slate-600 font-mono">v1.2 Dual-AI</span>
          </div>
        </div>
      </aside>
    </>
  );
};
