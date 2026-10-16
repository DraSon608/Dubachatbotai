import { DubaOfflineBrain } from './offlineBrain';
import { ChatMessage, ServerHealth } from '../types/chat';

export interface ChatRequestOptions {
  messages: { role: string; content: string }[];
  systemInstruction?: string;
  forceOffline?: boolean;
  temperature?: number;
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string, modelUsed: 'gemini-3.8-flash' | 'duba-offline-core') => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

export class ApiService {
  public static async checkHealth(): Promise<ServerHealth> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/health', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      return await res.json();
    } catch {
      return {
        status: 'offline',
        online: false,
        hasApiKey: false,
        model: 'duba-offline-core',
        timestamp: Date.now(),
      };
    }
  }

  public static async streamChat(options: ChatRequestOptions): Promise<void> {
    const {
      messages,
      systemInstruction,
      forceOffline,
      temperature = 0.7,
      onChunk,
      onComplete,
      onError,
      signal,
    } = options;

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Check if we should use Offline Core directly
    const isBrowserOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    if (forceOffline || isBrowserOffline) {
      console.log('[Duba] Operating in Offline Neural Mode');
      try {
        let fullText = '';
        const stream = DubaOfflineBrain.generateStream(lastUserMessage, messages, systemInstruction);

        for await (const chunk of stream) {
          if (signal?.aborted) {
            break;
          }
          fullText += chunk;
          onChunk(chunk);
        }

        onComplete(fullText, 'duba-offline-core');
      } catch (err: any) {
        onError(err?.message || 'Error generating offline response.');
      }
      return;
    }

    // Attempt Online Cloud Gemini Call
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          systemInstruction,
          stream: true,
          temperature,
        }),
        signal,
      });

      if (!response.ok) {
        // Fallback to offline brain on server 503 or error
        console.warn(`[Duba Cloud] Server returned ${response.status}. Falling back to Duba Offline Neural Core.`);
        let fullText = '';
        const stream = DubaOfflineBrain.generateStream(lastUserMessage, messages, systemInstruction);
        for await (const chunk of stream) {
          if (signal?.aborted) break;
          fullText += chunk;
          onChunk(chunk);
        }
        onComplete(fullText, 'duba-offline-core');
        return;
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read streaming response from server.');
      }

      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);

          if (dataStr === '[DONE]') {
            continue;
          }

          try {
            const data = JSON.parse(dataStr);
            if (data.error) {
              console.warn('[Duba Cloud] Stream error:', data.error);
              throw new Error(data.error);
            }
            if (data.text) {
              fullText += data.text;
              onChunk(data.text);
            }
          } catch (parseErr) {
            // Non-JSON SSE line or parse error
          }
        }
      }

      onComplete(fullText, 'gemini-3.8-flash');
    } catch (err: any) {
      if (signal?.aborted) {
        console.log('[Duba] Stream generation aborted by user.');
        return;
      }

      console.warn('[Duba] Network error encountered. Seamlessly switching to Offline Engine...', err);
      // Auto-fallback: Generate via Duba Offline Brain
      try {
        let fullText = '';
        const stream = DubaOfflineBrain.generateStream(lastUserMessage, messages, systemInstruction);
        for await (const chunk of stream) {
          if (signal?.aborted) break;
          fullText += chunk;
          onChunk(chunk);
        }
        onComplete(fullText, 'duba-offline-core');
      } catch (fallbackErr: any) {
        onError(fallbackErr?.message || 'Failed to complete request.');
      }
    }
  }

  public static async executeAutomation(actionType: string, payload: any): Promise<string> {
    try {
      const res = await fetch('/api/automate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, payload }),
      });

      if (!res.ok) {
        throw new Error(`Automation server error ${res.status}`);
      }

      const data = await res.json();
      return data.result;
    } catch (e: any) {
      console.warn('Online automation failed, running offline fallback');
      return DubaOfflineBrain.generateResponse(`Automate: ${actionType} - ${JSON.stringify(payload)}`);
    }
  }
}
