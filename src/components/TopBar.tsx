import React, { useState, useRef, useEffect } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  ChevronDown,
  Sparkles,
  Cpu,
  Cloud,
  Check,
  Share2,
  FileDown,
  Globe,
  Radio,
  Wifi,
  WifiOff,
  Flame,
  Code2,
} from 'lucide-react';
import { ModelMode, NetworkConnectionType } from '../types/chat';
import { translations } from '../services/translations';
import { BhutanFlagLogo } from './BhutanFlagLogo';

interface TopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  title: string;
  modelMode: ModelMode;
  onChangeModelMode: (mode: ModelMode) => void;
  isOnline: boolean;
  connectionType?: NetworkConnectionType;
  effectiveType?: string;
  pingMs?: number | null;
  connectionLabel?: string;
  forceOffline: boolean;
  onToggleForceOffline: () => void;
  onNewChat: () => void;
  onOpenSandbox: () => void;
  onOpenAutomation: () => void;
  onExportMarkdown: () => void;
  language: 'en' | 'dz';
  onToggleLanguage: () => void;
  isTemporaryChat?: boolean;
  onToggleTemporaryChat?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  sidebarOpen,
  onToggleSidebar,
  title,
  modelMode,
  onChangeModelMode,
  isOnline,
  connectionType = 'unknown',
  effectiveType,
  pingMs,
  forceOffline,
  onToggleForceOffline,
  onNewChat,
  onOpenSandbox,
  onOpenAutomation,
  onExportMarkdown,
  language,
  onToggleLanguage,
  isTemporaryChat = false,
  onToggleTemporaryChat,
}) => {
  const [showModelMenu, setShowModelMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowModelMenu(false);
      }
    };
    if (showModelMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModelMenu]);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-white/5 bg-[#212121]/90 px-3 sm:px-4 backdrop-blur-md">
      {/* Left: Sidebar Toggle, New Chat, & ChatGPT Model Selector */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Sidebar Toggle Icon */}
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Close sidebar (Ctrl+B)' : 'Open sidebar (Ctrl+B)'}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </button>

        {/* New Chat Icon Button (visible when sidebar is closed or on mobile) */}
        {!sidebarOpen && (
          <button
            onClick={onNewChat}
            title="New Chat (Ctrl+K)"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <SquarePen className="h-4 w-4" />
          </button>
        )}

        {/* ChatGPT Style Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowModelMenu((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
          >
            <span className="flex items-center gap-1.5">
              <span>Duba</span>
              <span className="text-slate-400 font-normal">
                {modelMode === 'cloud'
                  ? '3.8 Flash'
                  : modelMode === 'offline'
                  ? 'Offline Core'
                  : 'Auto-Pilot'}
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Model Selection Menu */}
          {showModelMenu && (
            <div className="absolute top-11 left-0 z-50 w-72 rounded-2xl border border-white/10 bg-[#212121] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Model Engine
              </div>

              {/* Cloud Turbo (Gemini 3.8) */}
              <button
                onClick={() => {
                  onChangeModelMode('cloud');
                  setShowModelMenu(false);
                }}
                className={`flex w-full items-start justify-between rounded-xl p-2.5 text-left transition ${
                  modelMode === 'cloud'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <Cloud className="h-3.5 w-3.5 text-amber-400" />
                    <span>Duba Cloud Turbo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Gemini 3.8 Flash model with ultra-fast cloud reasoning.
                  </p>
                </div>
                {modelMode === 'cloud' && <Check className="h-4 w-4 text-amber-400 shrink-0" />}
              </button>

              {/* Auto-Pilot */}
              <button
                onClick={() => {
                  onChangeModelMode('auto');
                  setShowModelMenu(false);
                }}
                className={`flex w-full items-start justify-between rounded-xl p-2.5 text-left transition ${
                  modelMode === 'auto'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Duba Auto-Pilot</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Automatically uses Cloud when online, falls back to Offline Core.
                  </p>
                </div>
                {modelMode === 'auto' && <Check className="h-4 w-4 text-cyan-400 shrink-0" />}
              </button>

              {/* Offline Core */}
              <button
                onClick={() => {
                  onChangeModelMode('offline');
                  setShowModelMenu(false);
                }}
                className={`flex w-full items-start justify-between rounded-xl p-2.5 text-left transition ${
                  modelMode === 'offline'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Duba Offline Core</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    100% on-device neural edge execution without internet.
                  </p>
                </div>
                {modelMode === 'offline' && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
              </button>

              {/* Live Connection Telemetry Footer inside Model Menu */}
              <div className="mt-1 pt-2 border-t border-white/5 px-2.5 pb-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Connection</span>
                <span className="font-mono text-slate-300 flex items-center gap-1">
                  {isOnline && !forceOffline ? (
                    connectionType === 'cellular' ? (
                      <>
                        <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
                        <span>Mobile ({effectiveType || '4G'})</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="h-3 w-3 text-emerald-400" />
                        <span>Wi-Fi ({pingMs ? `${pingMs}ms` : 'online'})</span>
                      </>
                    )
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 text-amber-400" />
                      <span>Offline Core</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Conversation Title preview */}
      <div className="hidden md:flex items-center gap-2 max-w-[280px] lg:max-w-[380px] truncate text-xs text-slate-400">
        <span className="truncate">{title}</span>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* Temporary Chat Toggle (ChatGPT style) */}
        {onToggleTemporaryChat && (
          <button
            onClick={onToggleTemporaryChat}
            title={
              isTemporaryChat
                ? 'Temporary Chat active: History is not saved. Click to disable.'
                : 'Enable Temporary Chat (incognito, won\'t appear in history)'
            }
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
              isTemporaryChat
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Flame className={`h-3.5 w-3.5 ${isTemporaryChat ? 'fill-amber-400' : ''}`} />
            <span className="hidden sm:inline">
              {isTemporaryChat ? 'Temporary' : 'Temp'}
            </span>
          </button>
        )}

        {/* Bhutanese Dzongkha / English Toggle */}
        <button
          onClick={onToggleLanguage}
          title={t.languageToggle}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
        >
          <BhutanFlagLogo size="xs" />
          <span className="font-semibold">{language === 'dz' ? 'རྫོང་ཁ' : 'EN'}</span>
        </button>

        {/* Export / Share Conversation */}
        <button
          onClick={onExportMarkdown}
          title="Export conversation as Markdown"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <Share2 className="h-4 w-4" />
        </button>

        {/* Code Sandbox shortcut */}
        <button
          onClick={onOpenSandbox}
          title="Open Code Sandbox"
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <Code2 className="h-4 w-4 text-indigo-400" />
        </button>
      </div>
    </header>
  );
};
