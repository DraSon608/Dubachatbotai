import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { AutomationHubModal } from './components/AutomationHubModal';
import { CodeSandboxModal } from './components/CodeSandboxModal';
import {
  ChatSession,
  ChatMessage as ChatMessageType,
  UserSettings,
  ModelMode,
  NetworkTelemetry,
} from './types/chat';
import { StorageService, DEFAULT_SETTINGS } from './services/storage';
import { ApiService } from './services/api';
import { translations } from './services/translations';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useSpeech } from './hooks/useSpeech';
import {
  ArrowDown,
  AlertCircle,
  WifiOff,
  Wifi,
  Radio,
  X,
  Flame,
  Code,
  Compass,
  Calculator,
  FileText,
  Sparkles,
} from 'lucide-react';
import { BhutanFlagLogo } from './components/BhutanFlagLogo';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => StorageService.loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(() =>
    StorageService.getActiveSessionId()
  );
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.loadSettings());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // ChatGPT Temporary (Incognito) Chat Mode
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [temporarySession, setTemporarySession] = useState<ChatSession | null>(null);

  // Modals state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(false);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxInitialCode, setSandboxInitialCode] = useState('');
  const [sandboxInitialLang, setSandboxInitialLang] = useState('javascript');

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Network toast notification
  const [networkToast, setNetworkToast] = useState<{
    message: string;
    type: 'online' | 'offline';
    connectionType?: string;
  } | null>(null);

  const triggerNetworkToast = useCallback(
    (message: string, type: 'online' | 'offline', connectionType?: string) => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setNetworkToast({ message, type, connectionType });
      toastTimerRef.current = setTimeout(() => {
        setNetworkToast(null);
      }, 4500);
    },
    []
  );

  // Handle connection events and auto-interpretation
  const handleConnectionChange = useCallback(
    (telemetry: NetworkTelemetry) => {
      if (settings.autoInterpretOnline) {
        if (telemetry.isOnline && telemetry.serverReachable) {
          if (settings.forceOffline) {
            handleSaveSettings({ ...settings, forceOffline: false });
          }
          const mediumName =
            telemetry.connectionType === 'cellular'
              ? `Mobile Data (${telemetry.effectiveType ? telemetry.effectiveType.toUpperCase() : '4G'})`
              : 'Wi-Fi Network';

          const pingDisplay = telemetry.pingMs ? ` • ${telemetry.pingMs}ms` : '';

          triggerNetworkToast(
            settings.language === 'dz'
              ? `${mediumName} དྲ་རྒྱའི་མཐུད་ལམ་ཐོབ་ཡོད — སྤྲིན་ཚོགས་རིག་སྟོབས་ལུ་ རང་བཞིན་གྱིས་མཐུད་ཡོད${pingDisplay}`
              : `${mediumName} detected${pingDisplay} — automatically enabled Online Cloud Mode.`,
            'online',
            telemetry.connectionType
          );
        } else if (!telemetry.isOnline) {
          triggerNetworkToast(
            settings.language === 'dz'
              ? `དྲ་རྒྱའི་མཐུད་ལམ་མེད — དུ་བ་རྒྱུན་འབྲེལ་མེད་པའི་རིག་རྩལ་ (Offline Core) ལུ་ རང་བཞིན་གྱིས་བསྒྱུར་ཡོད།`
              : `No active Wi-Fi or Mobile Data — Duba Offline Neural Core is automatically running locally.`,
            'offline'
          );
        }
      }
    },
    [settings, triggerNetworkToast]
  );

  // Online Status & Network Telemetry
  const {
    isOnline,
    pingMs,
    connectionType,
    effectiveType,
    connectionLabel,
  } = useOnlineStatus({
    forceOffline: settings.forceOffline,
    autoInterpretOnline: settings.autoInterpretOnline,
    onConnectionChange: handleConnectionChange,
  });

  // Speech Hooks
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

  // Save sessions to localStorage when updated (unless in Temporary Chat)
  useEffect(() => {
    if (!isTemporaryChat) {
      StorageService.saveSessions(sessions);
    }
  }, [sessions, isTemporaryChat]);

  // Save active session ID
  useEffect(() => {
    if (!isTemporaryChat) {
      StorageService.setActiveSessionId(activeSessionId);
    }
  }, [activeSessionId, isTemporaryChat]);

  // Global Keyboard Shortcuts (ChatGPT style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar: Ctrl+B or Cmd+B
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      // New chat: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
      // Temporary chat: Ctrl+Shift+T or Cmd+Shift+T
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleToggleTemporaryChat();
      }
      // Escape closes mobile sidebar
      if (e.key === 'Escape') {
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save settings
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  // Determine current active session
  const activeSession: ChatSession = isTemporaryChat
    ? temporarySession || {
        id: 'temp-session',
        title: 'Temporary Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        modelMode: settings.modelMode,
      }
    : sessions.find((s) => s.id === activeSessionId) ||
      sessions[0] || {
        id: `session-${Date.now()}`,
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        modelMode: settings.modelMode,
      };

  // Auto scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    if (settings.autoScroll) {
      scrollToBottom(false);
    }
  }, [activeSession.messages.length, activeSession.messages[activeSession.messages.length - 1]?.content, settings.autoScroll, scrollToBottom]);

  // Track scroll position for "scroll to bottom" button
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isBottom);
  }, []);

  // Toggle Temporary Chat
  const handleToggleTemporaryChat = () => {
    if (!isTemporaryChat) {
      setTemporarySession({
        id: `temp-${Date.now()}`,
        title: 'Temporary Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        modelMode: settings.modelMode,
      });
      setIsTemporaryChat(true);
    } else {
      setIsTemporaryChat(false);
      setTemporarySession(null);
    }
  };

  // New Chat
  const handleNewChat = () => {
    if (isTemporaryChat) {
      setTemporarySession({
        id: `temp-${Date.now()}`,
        title: 'Temporary Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        modelMode: settings.modelMode,
      });
      return;
    }

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
    if (
      activeSession.messages.length === 0 ||
      activeSession.title === 'New Conversation' ||
      activeSession.title === 'གླེང་མོལ་གསརཔ'
    ) {
      newTitle = text.slice(0, 32).trim() + (text.length > 32 ? '...' : '');
    }

    if (isTemporaryChat) {
      setTemporarySession({
        ...activeSession,
        title: newTitle,
        updatedAt: Date.now(),
        messages: updatedMessages,
      });
    } else {
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
    }

    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

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
        if (isTemporaryChat) {
          setTemporarySession((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, content: accumulatedContent, isStreaming: true }
                  : m
              ),
            };
          });
        } else {
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
        }
      },
      onComplete: (fullText: string, modelUsed: 'gemini-3.8-flash' | 'duba-offline-core') => {
        setIsStreaming(false);
        abortControllerRef.current = null;

        if (isTemporaryChat) {
          setTemporarySession((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, content: fullText, isStreaming: false, modelUsed }
                  : m
              ),
            };
          });
        } else {
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== activeSession.id) return s;
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? { ...m, content: fullText, isStreaming: false, modelUsed }
                    : m
                ),
              };
            })
          );
        }

        if (settings.speechEnabled) {
          speak(
            fullText,
            settings.selectedVoiceURI,
            settings.speechRate,
            settings.speechPitch
          );
        }
      },
      onError: (err: string) => {
        setIsStreaming(false);
        abortControllerRef.current = null;

        const errorMsg = `⚠️ Error: ${err}. ${
          forceOfflineTarget ? 'Offline mode active.' : 'Check internet connection.'
        }`;

        if (isTemporaryChat) {
          setTemporarySession((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content: errorMsg,
                      isStreaming: false,
                    }
                  : m
              ),
            };
          });
        } else {
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== activeSession.id) return s;
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? {
                        ...m,
                        content: errorMsg,
                        isStreaming: false,
                      }
                    : m
                ),
              };
            })
          );
        }
      },
    });
  };

  // Edit previous user message (ChatGPT style prompt edit & re-run)
  const handleEditMessage = (messageId: string, newContent: string) => {
    const msgIndex = activeSession.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Truncate messages to before this message
    const priorMessages = activeSession.messages.slice(0, msgIndex);

    if (isTemporaryChat) {
      setTemporarySession({
        ...activeSession,
        messages: priorMessages,
      });
    } else {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? { ...s, messages: priorMessages } : s))
      );
    }

    // Now resend with updated content
    handleSendMessage(newContent);
  };

  // Stop streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Open Sandbox with code
  const handleOpenSandboxWithCode = (code: string, lang: string) => {
    setSandboxInitialCode(code);
    setSandboxInitialLang(lang);
    setSandboxOpen(true);
  };

  // ChatGPT Prompt Starters for Home Screen
  const starters = [
    {
      icon: <Code className="h-4 w-4 text-cyan-400" />,
      label: t.starterPythonLabel,
      prompt: t.starterPythonPrompt,
      badge: 'Automation',
    },
    {
      icon: <Calculator className="h-4 w-4 text-emerald-400" />,
      label: t.starterMathLabel,
      prompt: t.starterMathPrompt,
      badge: 'Offline Math',
    },
    {
      icon: <Compass className="h-4 w-4 text-amber-400" />,
      label: t.starterBhutanLabel,
      prompt: t.starterBhutanPrompt,
      badge: 'Bhutan & GNH',
    },
    {
      icon: <FileText className="h-4 w-4 text-purple-400" />,
      label: t.starterSummaryLabel,
      prompt: t.starterSummaryPrompt,
      badge: 'Executive',
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#212121] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* ChatGPT Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSession.id}
        onSelectSession={(id) => {
          if (isTemporaryChat) setIsTemporaryChat(false);
          setActiveSessionId(id);
        }}
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
        connectionType={connectionType}
        effectiveType={effectiveType}
      />

      {/* Main Chat Canvas Area */}
      <div className="relative flex flex-1 flex-col h-full min-w-0 overflow-hidden bg-[#212121]">
        {/* ChatGPT Top Navigation Bar */}
        <TopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={activeSession.title}
          modelMode={activeSession.modelMode}
          onChangeModelMode={(mode: ModelMode) => {
            if (isTemporaryChat && temporarySession) {
              setTemporarySession({ ...temporarySession, modelMode: mode });
            } else {
              setSessions((prev) =>
                prev.map((s) => (s.id === activeSession.id ? { ...s, modelMode: mode } : s))
              );
            }
          }}
          isOnline={isOnline}
          connectionType={connectionType}
          effectiveType={effectiveType}
          pingMs={pingMs}
          connectionLabel={connectionLabel}
          forceOffline={settings.forceOffline}
          onToggleForceOffline={() =>
            handleSaveSettings({ ...settings, forceOffline: !settings.forceOffline })
          }
          onNewChat={handleNewChat}
          onOpenSandbox={() => {
            setSandboxInitialCode('');
            setSandboxInitialLang('javascript');
            setSandboxOpen(true);
          }}
          onOpenAutomation={() => setAutomationOpen(true)}
          onExportMarkdown={handleExportCurrentMarkdown}
          language={settings.language}
          onToggleLanguage={handleToggleLanguage}
          isTemporaryChat={isTemporaryChat}
          onToggleTemporaryChat={handleToggleTemporaryChat}
        />

        {/* Temporary Chat Notice Banner */}
        {isTemporaryChat && (
          <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-950/30 px-4 py-2 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
              <span>
                <strong>Temporary Chat:</strong> This conversation won't appear in your history or train model memory.
              </span>
            </div>
            <button
              onClick={() => setIsTemporaryChat(false)}
              className="text-amber-400 hover:text-white underline font-medium ml-2"
            >
              Exit
            </button>
          </div>
        )}

        {/* Floating Auto-Interpret Network Toast */}
        {networkToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#2f2f2f]/95 px-4 py-2 text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
            {networkToast.type === 'online' ? (
              networkToast.connectionType === 'cellular' ? (
                <Radio className="h-4 w-4 text-cyan-400 shrink-0 animate-pulse" />
              ) : (
                <Wifi className="h-4 w-4 text-emerald-400 shrink-0" />
              )
            ) : (
              <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
            )}
            <span className="text-slate-100 font-medium">{networkToast.message}</span>
            <button
              onClick={() => setNetworkToast(null)}
              className="ml-1 rounded-full p-0.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Forced Offline Warning Banner */}
        {settings.forceOffline && (
          <div className="flex items-center justify-between border-b border-amber-900/40 bg-amber-950/30 px-4 py-1.5 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <WifiOff className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Forced Offline Mode is active. All queries route to Duba Edge Core.</span>
            </div>
            <button
              onClick={() => handleSaveSettings({ ...settings, forceOffline: false })}
              className="underline hover:text-white font-medium ml-2"
            >
              Disable
            </button>
          </div>
        )}

        {/* Main Conversation Column (ChatGPT Centered 768px Width) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          {activeSession.messages.length === 0 ? (
            /* ChatGPT Home Screen / Empty State */
            <div className="flex flex-col items-center justify-center min-h-[65vh] max-w-2xl mx-auto px-4 text-center my-auto">
              {/* Centered Bhutanese Flag Logo */}
              <BhutanFlagLogo
                size="xl"
                withGlow
                className="mb-4 shadow-amber-500/25 ring-2 ring-amber-400/50 hover:scale-105 transition-transform"
              />

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                {settings.language === 'dz'
                  ? 'དེ་རིང་དུ་བ་གྱིས་ཁྱོད་ཀྱི་ཕྱག་ལཱ་ག་ཅི་རང་བཞིན་བཟོ་བྱིན་གེ?'
                  : 'What can I help with today?'}
              </h2>

              <p className="max-w-md text-xs sm:text-sm text-slate-400 mb-8 leading-relaxed">
                {settings.language === 'dz'
                  ? 'དུ་བ་རིག་སྟོབས་རྩིས་འཕྲུལ་འདི་ སྤྲིན་ཚོགས་རིག་སྟོབས་ Gemini 3.8 དང་ དྲ་རྒྱ་མེད་པའི་ནང་འཁོད་རིག་རྩལ་གཉིས་ཆ་ར་དང་ལྡནམ་ཨིན།'
                  : 'Duba operates seamlessly online with Gemini 3.8 Flash, or 100% on-device offline with our neural edge core.'}
              </p>

              {/* 2x2 ChatGPT Starter Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                {starters.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(starter.prompt)}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#2f2f2f]/60 p-3.5 hover:bg-[#2f2f2f] hover:border-white/20 transition group shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition">
                        {starter.icon}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                        {starter.badge}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition">
                        {starter.label}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {starter.prompt}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Conversation Column */
            <div className="max-w-3xl mx-auto w-full py-4 space-y-1">
              {activeSession.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onOpenSandbox={handleOpenSandboxWithCode}
                  onSpeak={(text) =>
                    speak(
                      text,
                      settings.selectedVoiceURI,
                      settings.speechRate,
                      settings.speechPitch
                    )
                  }
                  isSpeaking={isSpeaking}
                  onStopSpeaking={stopSpeaking}
                  onEditMessage={handleEditMessage}
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

              {/* Thinking / Reasoning state indicator while generating initial response */}
              {isStreaming &&
                activeSession.messages[activeSession.messages.length - 1]?.content === '' && (
                  <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-400">
                    <BhutanFlagLogo size="sm" withGlow />
                    <span className="animate-pulse flex items-center gap-1 font-medium text-amber-400">
                      <Sparkles className="h-3 w-3 animate-spin" />
                      {settings.language === 'dz' ? 'བསམ་བློ་གཏང་དོ...' : 'Thinking...'}
                    </span>
                  </div>
                )}

              <div ref={messagesEndRef} className="h-6" />
            </div>
          )}
        </div>

        {/* Scroll To Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-6 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#2f2f2f] text-slate-300 shadow-2xl hover:bg-white/20 hover:text-white transition active:scale-95"
            title="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}

        {/* ChatGPT Omnibox Input Dock */}
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
          onOpenAutomation={() => setAutomationOpen(true)}
          onOpenSandbox={() => {
            setSandboxInitialCode('');
            setSandboxInitialLang('javascript');
            setSandboxOpen(true);
          }}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearAllChats={handleClearAllChats}
        voices={voices}
        onImportSuccess={() => setSessions(StorageService.loadSessions())}
      />

      {/* Automation Hub Modal */}
      <AutomationHubModal
        isOpen={automationOpen}
        onClose={() => setAutomationOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      {/* Code Sandbox Modal */}
      <CodeSandboxModal
        isOpen={sandboxOpen}
        onClose={() => setSandboxOpen(false)}
        initialCode={sandboxInitialCode}
        initialLang={sandboxInitialLang}
      />
    </div>
  );
}
