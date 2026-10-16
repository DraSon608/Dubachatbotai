import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Cpu,
  Cloud,
  ChevronDown,
  Code2,
  FileDown,
  Wifi,
  WifiOff,
  Globe,
} from 'lucide-react';
import { ModelMode } from '../types/chat';
import { PWAInstallButton } from './PWAInstallButton';
import { translations } from '../services/translations';

interface TopBarProps {
  onToggleSidebar: () => void;
  title: string;
  modelMode: ModelMode;
  onChangeModelMode: (mode: ModelMode) => void;
  isOnline: boolean;
  forceOffline: boolean;
  onToggleForceOffline: () => void;
  onOpenSandbox: () => void;
  onOpenAutomation: () => void;
  onExportMarkdown: () => void;
  language: 'en' | 'dz';
  onToggleLanguage: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  title,
  modelMode,
  onChangeModelMode,
  isOnline,
  forceOffline,
  onToggleForceOffline,
  onOpenSandbox,
  onOpenAutomation,
  onExportMarkdown,
  language,
  onToggleLanguage,
}) => {
  const [showModelMenu, setShowModelMenu] = useState(false);
  const t = translations[language];

  return (
    <header className="relative z-20 flex h-14 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-3 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition"
          title="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowModelMenu(!showModelMenu)}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-700 hover:bg-slate-850 transition"
          >
            {modelMode === 'cloud' ? (
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Cloud className="h-3.5 w-3.5" />
                <span className="truncate max-w-[90px] sm:max-w-none">{t.cloudTurbo}</span>
              </span>
            ) : modelMode === 'offline' ? (
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Cpu className="h-3.5 w-3.5" />
                <span className="truncate max-w-[90px] sm:max-w-none">{t.offlineCore}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-purple-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="truncate max-w-[90px] sm:max-w-none">{t.autoPilot}</span>
              </span>
            )}
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showModelMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowModelMenu(false)}
              />
              <div className="absolute left-0 mt-2 z-40 w-64 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl space-y-1 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  {language === 'dz' ? 'རིག་སྟོབས་འཕྲུལ་ཆས་གདམ་ཁ' : 'Select Engine'}
                </div>

                <button
                  onClick={() => {
                    onChangeModelMode('auto');
                    setShowModelMenu(false);
                  }}
                  className={`flex w-full flex-col rounded-xl p-2.5 text-left transition ${
                    modelMode === 'auto'
                      ? 'bg-purple-950/40 text-purple-300 border border-purple-800/60'
                      : 'hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    {t.autoPilot}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {t.autoPilotDesc}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onChangeModelMode('cloud');
                    setShowModelMenu(false);
                  }}
                  className={`flex w-full flex-col rounded-xl p-2.5 text-left transition ${
                    modelMode === 'cloud'
                      ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/60'
                      : 'hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Cloud className="h-3.5 w-3.5 text-cyan-400" />
                    {t.cloudTurbo}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {t.cloudTurboDesc}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onChangeModelMode('offline');
                    setShowModelMenu(false);
                  }}
                  className={`flex w-full flex-col rounded-xl p-2.5 text-left transition ${
                    modelMode === 'offline'
                      ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/60'
                      : 'hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                    {t.offlineCore}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {t.offlineCoreDesc}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        <span className="hidden md:inline-block text-xs font-medium text-slate-400 truncate max-w-[200px]">
          {title}
        </span>
      </div>

      {/* Right Action Icons & Bhutanese Dzongkha Toggle */}
      <div className="flex items-center gap-2">
        {/* Official Bhutanese Dzongkha Language Toggle */}
        <button
          onClick={onToggleLanguage}
          title={language === 'dz' ? 'Switch to English' : 'Switch to Dzongkha (རྫོང་ཁ)'}
          className="flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/50 to-orange-950/40 px-2.5 py-1 text-xs font-bold text-amber-300 hover:from-amber-900/60 hover:to-orange-900/50 hover:border-amber-400 shadow-md shadow-amber-950/30 transition-all active:scale-95"
        >
          <Globe className="h-3.5 w-3.5 text-amber-400" />
          <span>{language === 'dz' ? '🇧🇹 རྫོང་ཁ' : '🇬🇧 English'}</span>
          <span className="rounded bg-black/40 px-1 py-0.5 text-[10px] font-normal text-amber-200">
            {language === 'dz' ? 'EN' : 'རྫོང་ཁ'}
          </span>
        </button>

        {/* Offline Toggle Badge */}
        <button
          onClick={onToggleForceOffline}
          title={
            forceOffline
              ? 'Click to disable Forced Offline mode'
              : 'Click to test Forced Offline mode'
          }
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition ${
            isOnline && !forceOffline
              ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/50'
              : 'border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-950/50'
          }`}
        >
          {isOnline && !forceOffline ? (
            <>
              <Wifi className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.online}</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5" />
              <span>{t.offline}</span>
            </>
          )}
        </button>

        {/* Code Sandbox shortcut */}
        <button
          onClick={onOpenSandbox}
          title={t.codeSandbox}
          className="hidden lg:flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-850 hover:text-white transition"
        >
          <Code2 className="h-3.5 w-3.5 text-indigo-400" />
          <span>{t.codeSandbox}</span>
        </button>

        {/* Automation Hub */}
        <button
          onClick={onOpenAutomation}
          title={t.automationHub}
          className="hidden md:flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-850 hover:text-white transition"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>{t.automationHub}</span>
        </button>

        {/* Export chat */}
        <button
          onClick={onExportMarkdown}
          title="Export Conversation"
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <FileDown className="h-4 w-4" />
        </button>

        {/* In-app PWA install button */}
        <PWAInstallButton variant="compact" />
      </div>
    </header>
  );
};
