import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { AutomationHubModal } from './components/AutomationHubModal';
import { CodeSandboxModal } from './components/CodeSandboxModal';
import { ChatSession, ChatMessage as ChatMessageType, UserSettings, ModelMode } from './types/chat';
import { StorageService, DEFAULT_SETTINGS } from './services/storage';
import { ApiService } from './services/api';
import { translations } from './services/translations';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useSpeech } from './hooks/useSpeech';
import { ArrowDown, AlertCircle, WifiOff } from 'lucide-react';
import { BhutanFlagLogo } from './components/BhutanFlagLogo';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => StorageService.loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(() =>
    StorageService.getActiveSessionId()
  );
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.loadSettings());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Modals state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(false);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxInitialCode, setSandboxInitialCode] = useState('');
  const [sandboxInitialLang, setSandboxInitialLang] = useState('javascript');

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { isOnline, pingMs } = useOnlineStatus(settings.forceOffline);
  const {
    isSpeaking,
    isListening,
    speechSupported,
    recognitionSupported,
    voices,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
  } = useSpeech();

  // Save sessions to localStorage when updated
  useEffect(() => {
    StorageService.saveSessions(sessions);
  }, [sessions]);

  // Save active session ID
  useEffect(() => {
    StorageService.setActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Save settings
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  // Find active session
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ||
    sessions[0] || {
      id: 'default',
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelMode: settings.modelMode,
    };

  // Auto-scroll logic
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (settings.autoScroll) {
      scrollToBottom();
    }
  }, [activeSession.messages, settings.autoScroll, scrollToBottom]);

  // Check scroll position to show/hide "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 140;
    setShowScrollBottom(!isNearBottom);
  };

  // Keyboard shortcut listener (Ctrl+K for New Chat, Escape for modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      } else if (e.key === 'Escape') {
        setSettingsOpen(false);
        setAutomationOpen(false);
        setSandboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // New Chat
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelMode: settings.modelMode,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Delete chat
  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    if (updated.length === 0) {
      const fresh: ChatSession = {
        id: `session-${Date.now()}`,
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        modelMode: settings.modelMode,
      };
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  // Rename chat
  const handleUpdateSessionTitle = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Toggle Pin
  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  // Clear all chats
  const handleClearAllChats = () => {
    const fresh: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelMode: settings.modelMode,
    };
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    StorageService.saveSessions([fresh]);
  };

  const t = translations[settings.language];

  const handleToggleLanguage = () => {
    const nextLang = settings.language === 'dz' ? 'en' : 'dz';
    handleSaveSettings({ ...settings, language: nextLang });
  };

  // Export current session to Markdown
  const handleExportCurrentMarkdown = () => {
    const md = StorageService.exportSessionAsMarkdown(activeSession);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send message flow
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    stopSpeaking();

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantPlaceholderId = `msg-${Date.now() + 1}`;
    const assistantMessage: ChatMessageType = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      isStreaming: true,
      modelUsed:
        settings.forceOffline || !isOnline || activeSession.modelMode === 'offline'
          ? 'duba-offline-core'
          : 'gemini-3.8-flash',
    };

    const updatedMessages = [...activeSession.messages, userMessage, assistantMessage];

    // Auto title if first message
    let newTitle = activeSession.title;
    if (activeSession.messages.length === 0 || activeSession.title === 'New Conversation' || activeSession.title === 'གླེང་མོལ་གསརཔ') {
      newTitle = text.slice(0, 32).trim() + (text.length > 32 ? '...' : '');
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: newTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : s
      )
    );

    setIsStreaming(true);

    // Setup AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Filter messages for backend
    const contextMessages = updatedMessages
      .filter((m) => m.id !== assistantPlaceholderId)
      .map((m) => ({ role: m.role, content: m.content }));

    const forceOfflineTarget =
      settings.forceOffline || !isOnline || activeSession.modelMode === 'offline';

    const effectiveSystemPrompt =
      settings.language === 'dz'
        ? `${settings.systemPrompt}\n\n[OFFICIAL LANGUAGE DIRECTIVE: DZONGKHA / རྫོང་ཁ]\nThe user has selected official Bhutanese Dzongkha (རྫོང་ཁ). Please provide answers primarily in fluent, polite, and grammatical Dzongkha script (རྫོང་ཁའི་ཡིག་གཟུགས), honoring Bhutanese cultural values (Gross National Happiness / རྒྱལ་ཡོངས་དགའ་སྐྱིད་དཔལ་འཛོམས). When generating code, keep programming syntax standard but explain logic and instructions in Dzongkha.`
        : settings.systemPrompt;

    let accumulatedContent = '';

    await ApiService.streamChat({
      messages: contextMessages,
      systemInstruction: effectiveSystemPrompt,
      forceOffline: forceOfflineTarget,
      signal: controller.signal,
      onChunk: (chunk: string) => {
        accumulatedContent += chunk;
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSession.id) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, content: accumulatedContent, isStreaming: true }
                  : m
              ),
            };
          })
        );
      },
      onComplete: (fullText: string, modelUsed: 'gemini-3.8-flash' | 'duba-offline-core') => {
        setIsStreaming(false);
        abortControllerRef.current = null;

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSession.id) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content: fullText,
                      isStreaming: false,
                      modelUsed,
                    }
                  : m
              ),
            };
          })
        );

        if (settings.speechEnabled) {
          speak(fullText, settings.selectedVoiceURI, settings.speechRate, settings.speechPitch);
        }
      },
      onError: (errorMessage: string) => {
        setIsStreaming(false);
        abortControllerRef.current = null;

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSession.id) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content: `⚠️ ${errorMessage}`,
                      isStreaming: false,
                      error: errorMessage,
                    }
                  : m
              ),
            };
          })
        );
      },
    });
  };

  // Stop streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Open Sandbox with specific code
  const handleOpenSandboxWithCode = (code: string, lang: string) => {
    setSandboxInitialCode(code);
    setSandboxInitialLang(lang);
    setSandboxOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSession.id}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onUpdateSessionTitle={handleUpdateSessionTitle}
        onTogglePinSession={handleTogglePinSession}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAutomation={() => setAutomationOpen(true)}
        onOpenSandbox={() => {
          setSandboxInitialCode('');
          setSandboxInitialLang('javascript');
          setSandboxOpen(true);
        }}
        isOnline={isOnline}
        pingMs={pingMs}
        forceOffline={settings.forceOffline}
        language={settings.language}
      />

      {/* Main Chat Content Area */}
      <div className="relative flex flex-1 flex-col h-full min-w-0 overflow-hidden bg-slate-950">
        {/* Top Navigation Bar */}
        <TopBar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={activeSession.title}
          modelMode={activeSession.modelMode}
          onChangeModelMode={(mode: ModelMode) => {
            setSessions((prev) =>
              prev.map((s) => (s.id === activeSession.id ? { ...s, modelMode: mode } : s))
            );
          }}
          isOnline={isOnline}
          forceOffline={settings.forceOffline}
          onToggleForceOffline={() =>
            handleSaveSettings({ ...settings, forceOffline: !settings.forceOffline })
          }
          onOpenSandbox={() => {
            setSandboxInitialCode('');
            setSandboxInitialLang('javascript');
            setSandboxOpen(true);
          }}
          onOpenAutomation={() => setAutomationOpen(true)}
          onExportMarkdown={handleExportCurrentMarkdown}
          language={settings.language}
          onToggleLanguage={handleToggleLanguage}
        />

        {/* Offline Banner alert if user is forced offline or network lost */}
        {(settings.forceOffline || !isOnline) && (
          <div className="flex items-center justify-between border-b border-amber-900/40 bg-amber-950/40 px-4 py-2 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                {t.offlineBanner}
              </span>
            </div>
            {settings.forceOffline && (
              <button
                onClick={() => handleSaveSettings({ ...settings, forceOffline: false })}
                className="underline hover:text-white font-medium ml-2"
              >
                {t.disableForcedOffline}
              </button>
            )}
          </div>
        )}

        {/* Messages Stream Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          {activeSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
              <BhutanFlagLogo size="xl" withGlow className="mb-4 shadow-amber-500/30 hover:scale-105 transition-transform" />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                {t.howCanIHelp}
              </h2>
              <p className="max-w-md text-xs sm:text-sm text-slate-400 mb-6">
                {t.heroSub}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-850/40 pb-6">
              {activeSession.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onOpenSandbox={handleOpenSandboxWithCode}
                  onSpeak={(text) =>
                    speak(text, settings.selectedVoiceURI, settings.speechRate, settings.speechPitch)
                  }
                  isSpeaking={isSpeaking}
                  onStopSpeaking={stopSpeaking}
                  onRegenerate={
                    message.role === 'assistant'
                      ? () => {
                          const prevUserMsg = activeSession.messages
                            .slice(0, activeSession.messages.indexOf(message))
                            .reverse()
                            .find((m) => m.role === 'user');
                          if (prevUserMsg) {
                            handleSendMessage(prevUserMsg.content);
                          }
                        }
                      : undefined
                  }
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Scroll To Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-6 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800/90 text-slate-300 shadow-xl hover:bg-slate-700 hover:text-white transition active:scale-90"
            title="Scroll to latest message"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}

        {/* Chat Input Dock */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          isOnline={isOnline}
          forceOffline={settings.forceOffline}
          onStartListening={startListening}
          onStopListening={stopListening}
          isListening={isListening}
          recognitionSupported={recognitionSupported}
          onSelectPromptStarter={(prompt) => handleSendMessage(prompt)}
          hasMessages={activeSession.messages.length > 0}
          language={settings.language}
        />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearAllChats={handleClearAllChats}
        voices={voices}
        onImportSuccess={() => setSessions(StorageService.loadSessions())}
      />

      <AutomationHubModal
        isOpen={automationOpen}
        onClose={() => setAutomationOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <CodeSandboxModal
        isOpen={sandboxOpen}
        onClose={() => setSandboxOpen(false)}
        initialCode={sandboxInitialCode}
        initialLang={sandboxInitialLang}
      />
    </div>
  );
}
