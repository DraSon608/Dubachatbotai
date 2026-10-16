import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Ensure DISABLE_HMR is active in AI Studio preview to prevent iframe WebSocket errors
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    online: true,
    hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    model: 'gemini-3.8-flash',
    timestamp: Date.now(),
  });
});

// Stream or regular chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, systemInstruction, stream = true, temperature = 0.7 } = req.body;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'Gemini API key is not configured or invalid. Duba Offline Neural Core is available locally.',
        offlineAvailable: true,
      });
      return;
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    // Format messages for Gemini
    // Filter and format contents into Gemini structure
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || '' }],
    }));

    const defaultSystemInstruction =
      systemInstruction ||
      `You are Duba, an advanced, friendly, and ultra-capable AI automation chatbot similar to ChatGPT.
You possess deep and all up-to-date expertise in the automation history and civics of the Kingdom of Bhutan (including Gelephu Mindfulness City / GMC SAR Act 2024, National Digital Identity / NDI, DHI clean hydro Bitcoin mining and sovereign computing reserves, 13th Five Year Plan 2024–2029, the Constitution of 2008, Democratic Constitutional Monarchy, Parliament, Prime Minister Dasho Tshering Tobgay, and Gross National Happiness / GNH).
You assist users with coding, automation, analysis, writing, problem-solving, and task execution in English and official Dzongkha (རྫོང་ཁ).
You format responses with clear Markdown, code blocks with languages specified, tables, bullet points, and actionable next steps. Be concise, proactive, insightful, and precise. If code is requested, provide robust, clean code with explanations.`;

    if (stream) {
      // Server-Sent Events (SSE) streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: defaultSystemInstruction,
          temperature: typeof temperature === 'number' ? temperature : 0.7,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: defaultSystemInstruction,
          temperature: typeof temperature === 'number' ? temperature : 0.7,
        },
      });

      res.json({
        text: response.text || '',
        model: 'gemini-3.8-flash',
      });
    }
  } catch (error: any) {
    console.error('Gemini API Chat Error:', error);
    const errorMessage = error?.message || 'Error communicating with Duba Cloud Engine.';
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.status(500).json({
        error: errorMessage,
        offlineAvailable: true,
      });
    }
  }
});

// Automation action endpoint (e.g. data structuring, workflow generation, code optimization)
app.post('/api/automate', async (req: Request, res: Response) => {
  try {
    const { actionType, payload } = req.body;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'Cloud automation requires active Gemini connection. You can use Duba Offline Tools.',
      });
      return;
    }

    let prompt = '';
    let systemInstruction = 'You are Duba Automation Engine, an expert at automating workflows, transforming data, and generating production code.';

    switch (actionType) {
      case 'workflow_plan':
        prompt = `Create an automated step-by-step workflow automation plan for the following goal: "${payload.goal}". Include triggers, steps, tools, and error handling.`;
        break;
      case 'code_refactor':
        prompt = `Refactor, optimize, and add automation tests to this code:\n\`\`\`${payload.language || 'javascript'}\n${payload.code}\n\`\`\``;
        break;
      case 'data_extract':
        prompt = `Extract structured data (entities, dates, action items, key metrics) from this text and return it in clean structured Markdown with a summary table:\n\n${payload.text}`;
        break;
      default:
        prompt = payload.prompt || 'Automate the task requested.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      result: response.text || '',
      actionType,
      model: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Automation Error:', error);
    res.status(500).json({ error: error?.message || 'Failed to execute automation.' });
  }
});

// Serve frontend in development via Vite middleware or in production from dist
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Duba AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Duba server:', err);
  process.exit(1);
});
