import React, { useRef } from 'react';
import { X, Settings, Volume2, Shield, Download, Upload, Trash2, Cpu, RotateCcw, Globe, Check, Wifi } from 'lucide-react';
import { UserSettings, ModelMode } from '../types/chat';
import { DEFAULT_SETTINGS, StorageService } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onClearAllChats: () => void;
  voices: SpeechSynthesisVoice[];
  onImportSuccess: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllChats,
  voices,
  onImportSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleModeChange = (mode: ModelMode) => {
    onSaveSettings({ ...settings, modelMode: mode });
  };

  const handleForceOfflineToggle = () => {
    onSaveSettings({ ...settings, forceOffline: !settings.forceOffline });
  };

  const handleExport = () => {
    const dataStr = StorageService.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duba-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && StorageService.importData(content)) {
        onImportSuccess();
        alert('Chat conversations imported successfully!');
      } else {
        alert('Failed to parse backup file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6">
      <div className="relative flex flex-col h-[85vh] w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {settings.language === 'dz' ? 'དུ་བ་ གཞི་སྒྲིག་དང་གདམ་ཁ' : 'Duba Settings & Preferences'}
              </h2>
              <p className="text-xs text-slate-400">
                {settings.language === 'dz'
                  ? 'རྫོང་ཁའི་སྐད་ཡིག་དང་ རང་སོའི་རིག་རྩལ་ གསུང་སྐད་གཞི་སྒྲིག'
                  : 'Configure intelligence engine, offline modes, and audio'}
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

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs sm:text-sm">
          {/* Language / Bhutanese Dzongkha Toggle */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-amber-400" />
              {settings.language === 'dz' ? 'སྐད་ཡིག་གདམ་ཁ (Language)' : 'Language & Locale'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSaveSettings({ ...settings, language: 'en' })}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                  settings.language === 'en'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-white text-xs">🇬🇧 English</div>
                  <div className="text-[11px] text-slate-400">Default International</div>
                </div>
                {settings.language === 'en' && <Check className="h-4 w-4 text-cyan-400" />}
              </button>

              <button
                type="button"
                onClick={() => onSaveSettings({ ...settings, language: 'dz' })}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                  settings.language === 'dz'
                    ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-amber-300 text-xs">🇧🇹 རྫོང་ཁ (Dzongkha)</div>
                  <div className="text-[11px] text-slate-400">Official Language of Bhutan</div>
                </div>
                {settings.language === 'dz' && <Check className="h-4 w-4 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Intelligence & Network Engine */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              {settings.language === 'dz' ? 'རིག་སྟོབས་འཕྲུལ་ཆས་ཀྱི་ཐབས་ལམ' : 'Intelligence Engine Mode'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleModeChange('auto')}
                className={`flex flex-col p-3 rounded-xl border text-left transition ${
                  settings.modelMode === 'auto'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-white text-xs">🔄 Auto-Pilot</span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Uses Gemini Cloud when online, auto-falls back to Offline Core.
                </span>
              </button>

              <button
                onClick={() => handleModeChange('cloud')}
                className={`flex flex-col p-3 rounded-xl border text-left transition ${
                  settings.modelMode === 'cloud'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-white text-xs">⚡ Cloud Turbo</span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Google Gemini 3.8 Flash model. Requires active internet.
                </span>
              </button>

              <button
                onClick={() => handleModeChange('offline')}
                className={`flex flex-col p-3 rounded-xl border text-left transition ${
                  settings.modelMode === 'offline'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-white text-xs">🧠 Offline Core</span>
                <span className="text-[11px] text-slate-400 mt-1">
                  100% on-device neural heuristic and knowledge engine.
                </span>
              </button>
            </div>

            {/* Auto-Interpret Wi-Fi & Cellular */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="space-y-0.5">
                <div className="font-medium text-white flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                  {settings.language === 'dz'
                    ? 'དྲ་རྒྱ་རང་བཞིན་བརྟག་ཞིབ་ (Auto-Interpret Wi-Fi & Mobile Data)'
                    : 'Auto-Interpret Wi-Fi & Mobile Data'}
                </div>
                <p className="text-[11px] text-slate-400">
                  {settings.language === 'dz'
                    ? 'ཝའི་ཕའི་དང་ འགྲུལ་འཕྲིན་དྲ་རྒྱ་ཡོད་ཚེ་ རང་བཞིན་གྱིས་རྒྱུན་འབྲེལ་ཡོད་པའི་ཐོག་ལུ་བསྒྱུར་བཅོས་འབདཝ་ཨིན།'
                    : 'Automatically detect Wi-Fi or cellular data to enable Online Cloud Mode seamlessly.'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoInterpretOnline}
                  onChange={(e) =>
                    onSaveSettings({
                      ...settings,
                      autoInterpretOnline: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            {/* Force Offline Mode Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="space-y-0.5">
                <div className="font-medium text-white flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-cyan-400" />
                  Force Simulated Offline Mode
                </div>
                <p className="text-[11px] text-slate-400">
                  Disconnects from cloud APIs and routes all queries strictly to Duba Local Edge Engine.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.forceOffline}
                  onChange={handleForceOfflineToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
              </label>
            </div>
          </div>

          {/* Audio & Speech */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-indigo-400" />
              Speech & Audio
            </h3>

            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Auto Read Aloud (Text to Speech)</div>
                  <p className="text-[11px] text-slate-400">
                    Automatically speak Duba's responses using browser synthesis.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.speechEnabled}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, speechEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                </label>
              </div>

              {voices.length > 0 && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Select Voice:</label>
                  <select
                    value={settings.selectedVoiceURI}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, selectedVoiceURI: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="">Default System Voice</option>
                    {voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* System Instruction */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">System Prompt / Duba Persona</h3>
              <button
                onClick={() =>
                  onSaveSettings({ ...settings, systemPrompt: DEFAULT_SETTINGS.systemPrompt })
                }
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                <RotateCcw className="h-3 w-3" /> Reset Default
              </button>
            </div>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => onSaveSettings({ ...settings, systemPrompt: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-slate-300 outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Data Management */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="font-semibold text-white">Data Management & Backup</h3>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                Export Chats (JSON)
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
              >
                <Upload className="h-3.5 w-3.5 text-indigo-400" />
                Import Backup
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
                    onClearAllChats();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg border border-rose-900/40 bg-rose-950/30 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-900/50 transition ml-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All Conversations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
