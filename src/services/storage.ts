import { ChatSession, UserSettings } from '../types/chat';

const SESSIONS_KEY = 'duba_sessions_v1';
const ACTIVE_SESSION_ID_KEY = 'duba_active_session_id';
const SETTINGS_KEY = 'duba_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  modelMode: 'auto',
  forceOffline: false,
  speechEnabled: false,
  speechRate: 1,
  speechPitch: 1,
  selectedVoiceURI: '',
  autoScroll: true,
  codeFontSize: 'md',
  systemPrompt: `You are Duba, an intelligent and friendly AI automation chatbot similar to ChatGPT that operates seamlessly both online and offline.
You help users with code generation, task automation, mathematical calculations, text transformation, and general problem solving.
Provide clear, structured responses with Markdown, formatted tables, and well-commented code snippets.`,
  language: 'en',
  autoInterpretOnline: true,
};

export const INITIAL_WELCOME_SESSION: ChatSession = {
  id: 'duba-welcome-session',
  title: 'Welcome to Duba Chatbot',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 3600000,
  modelMode: 'auto',
  isPinned: true,
  messages: [
    {
      id: 'welcome-msg-1',
      role: 'assistant',
      content: `### Welcome to Duba Chatbot! 🤖⚡

Duba is an **AI automation chatbot similar to ChatGPT**, specifically architected to work **completely offline as well as online**.

#### 🌟 Dual-Core Engine:
- ⚡ **Online Mode (Duba Cloud Engine)**: Powered by Google Gemini 3.8 Flash for ultra-fast, comprehensive reasoning, complex coding, and real-time streaming intelligence.
- 🧠 **Offline Mode (Duba Neural Edge Core)**: 100% on-device AI knowledge base, code synthesizer, math calculation engine, and text summarizer that runs right in your browser with **zero internet connection required**!
- 🔄 **Auto-Pilot**: Uses Cloud when connected, and seamlessly transitions to the Offline Core if your connection drops.

#### 🛠️ Automation & Productivity Tools:
- **Code Execution Sandbox**: Test JavaScript and HTML scripts in an isolated live runner.
- **Offline Math & Unit Converter**: Try typing \`calculate 450 * 1.15\` or \`convert 100 km to miles\`.
- **Extractive Document Summarizer**: Type \`summarize: [your text]\` for instant local TF-IDF summarization.
- **Entity Extractor**: Find emails, URLs, hashtags, and numbers from raw data.
- **Speech Dictation & Read-Aloud**: Voice input and text-to-speech that works offline!
- **PWA Ready**: Click **Install App** to install Duba on your desktop or mobile device.

Try sending a message or click any of the prompt starters below!`,
      timestamp: Date.now() - 3600000,
      modelUsed: 'duba-offline-core',
    },
  ],
};

export class StorageService {
  public static loadSessions(): ChatSession[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (!data) {
        // Seed initial session
        StorageService.saveSessions([INITIAL_WELCOME_SESSION]);
        return [INITIAL_WELCOME_SESSION];
      }
      const parsed: ChatSession[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [INITIAL_WELCOME_SESSION];
      }
      return parsed;
    } catch (e) {
      console.warn('Failed to parse sessions from localStorage:', e);
      return [INITIAL_WELCOME_SESSION];
    }
  }

  public static saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions to localStorage:', e);
    }
  }

  public static getActiveSessionId(): string {
    const id = localStorage.getItem(ACTIVE_SESSION_ID_KEY);
    return id || INITIAL_WELCOME_SESSION.id;
  }

  public static setActiveSessionId(id: string): void {
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, id);
  }

  public static loadSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  public static exportAllData(): string {
    const data = {
      sessions: StorageService.loadSessions(),
      settings: StorageService.loadSettings(),
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  public static importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        StorageService.saveSessions(parsed.sessions);
      }
      if (parsed.settings) {
        StorageService.saveSettings(parsed.settings);
      }
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }

  public static exportSessionAsMarkdown(session: ChatSession): string {
    const title = `# ${session.title}\n*Exported from Duba AI Chatbot on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    const messages = session.messages
      .map((m) => {
        const author = m.role === 'user' ? '### 👤 User' : `### 🤖 Duba AI (${m.modelUsed || 'Duba'})`;
        return `${author}\n*${new Date(m.timestamp).toLocaleTimeString()}*\n\n${m.content}\n\n---`;
      })
      .join('\n\n');
    return title + messages;
  }
}
