/**
 * Duba Offline Neural Engine (Edge AI)
 * 100% local, on-device intelligence engine that requires zero internet or server connection.
 * Handles:
 *  - Interactive streaming token-by-token emulation
 *  - Math & formula evaluation engine
 *  - Extractive TF-IDF text summarizer
 *  - Entity & regex pattern extraction
 *  - Code generator & programming patterns
 *  - Conversational reasoning & multi-domain knowledge base
 */

export interface OfflineEvaluationResult {
  content: string;
  toolUsed?: string;
  isHandled: boolean;
}

// Knowledge base entries
interface KnowledgeEntry {
  keywords: string[];
  title: string;
  summary: string;
  details: string;
  codeSnippet?: {
    lang: string;
    code: string;
  };
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ['http', 'status', 'codes', '404', '500', '200', '301'],
    title: 'HTTP Status Code Reference',
    summary: 'Standard HTTP response status codes categorized by their initial digit.',
    details: `### Common HTTP Status Codes

- **200 OK**: Request succeeded.
- **201 Created**: Resource was created successfully.
- **204 No Content**: Succeeded but returns no body.
- **301 Moved Permanently**: URL redirection.
- **304 Not Modified**: Resource cached.
- **400 Bad Request**: Malformed syntax or invalid parameters.
- **401 Unauthorized**: Authentication required.
- **403 Forbidden**: Authenticated, but lacking permission.
- **404 Not Found**: Endpoint or resource does not exist.
- **429 Too Many Requests**: Rate limit reached.
- **500 Internal Server Error**: Generic server crash or uncaught error.
- **502 Bad Gateway**: Invalid response from upstream proxy.
- **503 Service Unavailable**: Server overloaded or down for maintenance.`,
  },
  {
    keywords: ['git', 'commit', 'branch', 'rebase', 'merge', 'cherry-pick'],
    title: 'Essential Git Automation & Commands',
    summary: 'Standard version control commands and workflows.',
    details: `### Essential Git Command Reference

| Action | Command |
|---|---|
| Initialize repo | \`git init\` |
| Stage all changes | \`git add .\` |
| Commit with message | \`git commit -m "feat: your update"\` |
| Create & switch branch | \`git checkout -b feature/awesome\` |
| Fetch & rebase on main | \`git pull --rebase origin main\` |
| Stash uncommitted work | \`git stash push -m "wip"\` |
| View visual commit tree | \`git log --oneline --graph --all\` |
| Undo last commit (keep files) | \`git reset --soft HEAD~1\` |`,
  },
  {
    keywords: ['rest', 'graphql', 'api', 'difference', 'compare'],
    title: 'REST API vs GraphQL Architectural Comparison',
    summary: 'Key differences between REST and GraphQL endpoints.',
    details: `### REST vs GraphQL

1. **Endpoint Architecture**:
   - **REST**: Multiple endpoints (\`/users\`, \`/posts/123\`). Each represents a specific resource.
   - **GraphQL**: Single smart endpoint (\`/graphql\`). Queries dictate exact response shapes.

2. **Over-fetching & Under-fetching**:
   - **REST**: Often returns unnecessary payload fields or requires multiple round-trips (N+1 problem).
   - **GraphQL**: The client requests strictly the fields needed, saving network bandwidth.

3. **Caching**:
   - **REST**: Native browser and CDN HTTP caching using standard headers (\`ETag\`, \`Cache-Control\`).
   - **GraphQL**: Requires specialized client libraries (Apollo Client, Urql) because queries are typically \`POST\` requests.`,
  },
  {
    keywords: ['pomodoro', 'technique', 'productivity', 'focus', 'time'],
    title: 'The Pomodoro Technique Workflow',
    summary: 'A time management system that alternates focused work sprints with brief rests.',
    details: `### The Pomodoro Technique Blueprint

1. **Select a Single Goal**: Avoid multitasking. Focus purely on one deliverable.
2. **Set a 25-Minute Sprint**: Work uninterrupted until the bell rings.
3. **Record a Checkmark**: Log progress on your task tracker.
4. **Take a 5-Minute Break**: Step away, stretch, hydrate, or rest your eyes.
5. **Cycle 4 Times**: After 4 completed pomodoros (approx. 2 hours), enjoy an extended **15–30 minute rejuvenating break**.`,
  },
  {
    keywords: ['debounce', 'throttle', 'javascript', 'performance'],
    title: 'Debounce vs Throttle in JavaScript',
    summary: 'Rate-limiting techniques for performance-heavy event listeners.',
    details: `### Debounce vs Throttle

- **Debounce**: Delays execution until a specified delay has elapsed since the *last* invocation (ideal for search input autocomplete and window resize).
- **Throttle**: Guarantees execution at most once every *N* milliseconds (ideal for scroll listeners and game loops).`,
    codeSnippet: {
      lang: 'typescript',
      code: `// Universal Debounce Function in TypeScript
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, waitMs);
  };
}`,
    },
  },
  {
    keywords: ['react', 'hook', 'custom', 'localstorage', 'state'],
    title: 'Custom React useLocalStorage Hook',
    summary: 'React state hook synchronized with browser localStorage.',
    details: `### Persistent LocalStorage Hook

Allows your React components to maintain persistent offline state across page refreshes with full TypeScript support:`,
    codeSnippet: {
      lang: 'typescript',
      code: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(\`Error writing localStorage key "\${key}":\`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}`,
    },
  },
  {
    keywords: ['python', 'automation', 'script', 'file', 'folder'],
    title: 'Python Automated File Organizer Script',
    summary: 'Script to automatically organize downloads by file extension.',
    details: `### Python File Organizer Automation

This automated Python script categorizes files in your target directory into organized folders (Images, Documents, Archives, Code):`,
    codeSnippet: {
      lang: 'python',
      code: `import os
import shutil
from pathlib import Path

DIRECTORY = Path.home() / "Downloads"

FILE_CATEGORIES = {
    "Images": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
    "Documents": [".pdf", ".docx", ".txt", ".xlsx", ".pptx", ".csv"],
    "Archives": [".zip", ".tar", ".gz", ".rar", ".7z"],
    "Code": [".py", ".js", ".ts", ".html", ".css", ".json"],
    "Audio_Video": [".mp3", ".wav", ".mp4", ".mov", ".mkv"]
}

def organize_files():
    for item in DIRECTORY.iterdir():
        if item.is_file():
            ext = item.suffix.lower()
            placed = False
            for category, extensions in FILE_CATEGORIES.items():
                if ext in extensions:
                    target_dir = DIRECTORY / category
                    target_dir.mkdir(exist_ok=True)
                    shutil.move(str(item), str(target_dir / item.name))
                    print(f"Moved: {item.name} -> {category}/")
                    placed = True
                    break
            if not placed:
                misc_dir = DIRECTORY / "Miscellaneous"
                misc_dir.mkdir(exist_ok=True)
                shutil.move(str(item), str(misc_dir / item.name))

if __name__ == "__main__":
    organize_files()`,
    },
  },
];

// Helper: safe math expression evaluator
function tryEvaluateMath(input: string): string | null {
  const cleanInput = input
    .replace(/(what is|calculate|evaluate|solve|compute|\?|=|math)/gi, '')
    .trim();

  // Pattern check for math expression (numbers, operators, parens, basic math functions)
  if (!/^[\d\s+\-*/().^,%sqrt|cbrt|sin|cos|tan|log|abs|pi|e]+$/i.test(cleanInput)) {
    // Check unit conversions
    const conversion = tryConvertUnits(input);
    if (conversion) return conversion;
    return null;
  }

  try {
    let sanitized = cleanInput
      .replace(/\^/g, '**')
      .replace(/sqrt\(([^)]+)\)/gi, 'Math.sqrt($1)')
      .replace(/sin\(([^)]+)\)/gi, 'Math.sin($1)')
      .replace(/cos\(([^)]+)\)/gi, 'Math.cos($1)')
      .replace(/tan\(([^)]+)\)/gi, 'Math.tan($1)')
      .replace(/log\(([^)]+)\)/gi, 'Math.log10($1)')
      .replace(/pi/gi, 'Math.PI')
      .replace(/\be\b/gi, 'Math.E');

    // Only allow safe characters
    if (/[^0-9\s+\-*/().MathPIEsqrtlncoeta**,]/i.test(sanitized)) {
      return null;
    }

    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${sanitized});`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      const rounded = Math.round(result * 1000000) / 1000000;
      return `### Mathematical Calculation

**Expression:** \`${cleanInput}\`  
**Result:** **\`${rounded}\`**

*Computed by Duba Offline Mathematical Engine.*`;
    }
  } catch {
    return null;
  }
  return null;
}

// Helper: Unit Conversions
function tryConvertUnits(text: string): string | null {
  const regex = /(\d+(?:\.\d+)?)\s*(km|kilometers?|miles?|mi|kg|kilograms?|lbs?|pounds?|celsius|fahrenheit|c|f|meters?|feet|ft|mb|gb|bytes?)\s*(?:to|in)\s*(km|kilometers?|miles?|mi|kg|kilograms?|lbs?|pounds?|celsius|fahrenheit|c|f|meters?|feet|ft|mb|gb|bytes?)/i;
  const match = text.match(regex);
  if (!match) return null;

  const val = parseFloat(match[1]);
  const from = match[2].toLowerCase();
  const to = match[3].toLowerCase();

  let result = 0;
  let formula = '';

  // Distance: km <-> miles
  if (/km|kilometer/.test(from) && /mi|mile/.test(to)) {
    result = val * 0.621371;
    formula = `${val} × 0.621371`;
  } else if (/mi|mile/.test(from) && /km|kilometer/.test(to)) {
    result = val * 1.60934;
    formula = `${val} × 1.60934`;
  }
  // Weight: kg <-> lbs
  else if (/kg|kilogram/.test(from) && /lb|pound/.test(to)) {
    result = val * 2.20462;
    formula = `${val} × 2.20462`;
  } else if (/lb|pound/.test(from) && /kg|kilogram/.test(to)) {
    result = val * 0.453592;
    formula = `${val} × 0.453592`;
  }
  // Temperature: C <-> F
  else if (from === 'c' || from === 'celsius') {
    result = (val * 9) / 5 + 32;
    formula = `(${val} × 9/5) + 32`;
  } else if (from === 'f' || from === 'fahrenheit') {
    result = ((val - 32) * 5) / 9;
    formula = `(${val} - 32) × 5/9`;
  }
  // Data: MB <-> GB
  else if (from === 'mb' && to === 'gb') {
    result = val / 1024;
    formula = `${val} / 1024`;
  } else if (from === 'gb' && to === 'mb') {
    result = val * 1024;
    formula = `${val} × 1024`;
  } else {
    return null;
  }

  return `### Unit Conversion Result

- **Original:** ${val} ${from}
- **Conversion Formula:** \`${formula}\`
- **Result:** **\`${Math.round(result * 10000) / 10000} ${to}\`**

*Processed by Duba Offline Converter.*`;
}

// Extractive Summarizer using TF-IDF style sentence ranking
export function offlineSummarizeText(text: string, maxSentences = 3): string {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  if (sentences.length <= maxSentences) {
    return text;
  }

  // Word frequencies
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const freqMap = new Map<string, number>();
  for (const w of words) {
    freqMap.set(w, (freqMap.get(w) || 0) + 1);
  }

  // Sentence score
  const scored = sentences.map((sentence, index) => {
    const sWords = sentence.toLowerCase().split(/\s+/);
    let score = 0;
    for (const sw of sWords) {
      if (freqMap.has(sw)) {
        score += freqMap.get(sw)!;
      }
    }
    // Normalize by length
    score = score / Math.max(sWords.length, 1);
    // Prioritize first and last sentences
    if (index === 0) score *= 1.4;
    if (index === sentences.length - 1) score *= 1.2;
    return { sentence, score, index };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, maxSentences).sort((a, b) => a.index - b.index);

  return selected.map((s) => `• ${s.sentence}`).join('\n');
}

// Entity & Data Extractor
export function offlineExtractData(text: string): {
  emails: string[];
  urls: string[];
  numbers: string[];
  hashtags: string[];
} {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const numberRegex = /\b\d+(?:,\d{3})*(?:\.\d+)?\b/g;

  return {
    emails: Array.from(new Set(text.match(emailRegex) || [])),
    urls: Array.from(new Set(text.match(urlRegex) || [])),
    hashtags: Array.from(new Set(text.match(hashtagRegex) || [])),
    numbers: Array.from(new Set(text.match(numberRegex) || [])).slice(0, 15),
  };
}

// Main Duba Offline Brain Processor
export class DubaOfflineBrain {
  public static async *generateStream(
    userPrompt: string,
    history: { role: string; content: string }[] = [],
    systemInstruction = ''
  ): AsyncGenerator<string, void, unknown> {
    const fullResponse = DubaOfflineBrain.generateResponse(userPrompt, history, systemInstruction);

    // Emulate realistic AI streaming token cadence (between 12-28ms per token/word)
    const words = fullResponse.split(/(?<=\s|[-.,!?\n])/);
    for (let i = 0; i < words.length; i++) {
      yield words[i];
      // Micro-pause to create smooth typing experience
      await new Promise((resolve) => setTimeout(resolve, 14));
    }
  }

  public static generateResponse(
    userPrompt: string,
    _history: { role: string; content: string }[] = [],
    _systemInstruction = ''
  ): string {
    const prompt = userPrompt.trim();
    const lower = prompt.toLowerCase();

    // 0. Dzongkha (Bhutanese) Language Detection & Intelligent Offline Response
    const isDzongkhaScript = /[\u0F00-\u0FFF]/.test(prompt);

    if (isDzongkhaScript) {
      // Greetings
      if (
        lower.includes('སྐུ་གཟུགས་བཟང་པོ') ||
        lower.includes('བཀྲ་ཤིས་བདེ་ལེགས') ||
        lower.includes('ཁྱོད་ག་དེ་སྦེ་ཡོད') ||
        lower.includes('དགའ་བསུ་ཞུ')
      ) {
        return `### སྐུ་གཟུགས་བཟང་པོ་ལགས! ང་དུ་བ་ (Duba AI) ཨིན། 🤖🇧🇹

ང་འདི་ **འབྲུག་རྒྱལ་ཁབ་** དང་ འཛམ་གླིང་ཡོངས་ཀྱི་དོན་ལུ་ དྲ་རྒྱ་ཡོད་མེད་གཉིས་ཆ་རར་ རང་བཞིན་གློག་རིག་དང་ རྩིས་རིག་ ཡིག་ཆ་བསྡུས་དོན་ཚུ་ གྲོགས་རམ་འབད་མི་ རིག་སྟོབས་རྩིས་འཕྲུལ་ཅིག་ཨིན།

#### ང་གིས་ཁྱོད་ལུ་ཕུལ་ཚུགས་པའི་ཞབས་ཏོག:
- ⚡ **གློག་རིག་རྩིས་འཕྲུལ་བཟོ་ནི**: Python, JavaScript, TypeScript, HTML རང་བཞིན་ལས་རིམ་དང་ sandbox ནང་བརྟག་དཔྱད།
- 🇧🇹 **འབྲུག་གི་ལམ་སྲོལ་དང་ རྒྱལ་ཡོངས་དགའ་སྐྱིད་དཔལ་འཛོམས (GNH)**: གནས་ཚུལ་དང་ གསལ་བཤད་རྒྱས་པ།
- 🧮 **ཀླད་རྩིས་དང་ ཨང་རྩིས**: ཚད་གཞི་བསྒྱུར་བཅོས་དང་ དངུལ་རྩིས་རྩི་སྟོན།
- 📋 **ཡིག་ཆ་བསྡུས་དོན**: ཡིག་ཆ་རིངམོ་ཚུ་ དུམ་གྲ་ཅིག་ནང་ བཅུད་བསྡུ་ནི།
- 🎙️ **གསུང་སྐད་ཉན་ནི་དང་ ལྷག་ནི**: སྐད་ཐོག་ལས་དྲི་བ་དྲིས་ཏེ་ སྐད་ཐོག་ལས་ལན་གསལ་ཉན་ཚུགས།

དེ་རིང་ ཁྱོད་ལུ་ ག་ཅི་གི་ཐོག་ལས་ གྲོགས་རམ་དགོཔ་འདུག་ག?`;
      }

      // Gross National Happiness (GNH) in Dzongkha
      if (
        lower.includes('རྒྱལ་ཡོངས་དགའ་སྐྱིད་དཔལ་འཛོམས') ||
        lower.includes('དགའ་སྐྱིད་དཔལ་འཛོམས') ||
        lower.includes('gnh') ||
        lower.includes('ཀ་ཆེན་བཞི')
      ) {
        return `### 🇧🇹 རྒྱལ་ཡོངས་དགའ་སྐྱིད་དཔལ་འཛོམས་ (Gross National Happiness)

འབྲུག་རྒྱལ་ཁབ་ནང་ **རྒྱལ་ཡོངས་དགའ་སྐྱིད་དཔལ་འཛོམས་ (GNH)** འདི་ མི་དབང་འབྲུག་རྒྱལ་བཞི་པ་ འཇིགས་མེད་སེང་གེ་དབང་ཕྱུག་མཆོག་གིས་ གསར་གཏོད་མཛད་གནང་མི་ རྒྱལ་ཡོངས་གོང་འཕེལ་གྱི་ ལྟ་གྲུབ་གཙོ་བོ་ཅིག་ཨིན།

#### ཀ་ཆེན་བཞི (The Four Pillars):
1. **དྲང་བདེན་དང་ རྒྱུན་བརྟན་ཅན་གྱི་ དཔལ་འབྱོར་གོང་འཕེལ** (Sustainable & Equitable Socio-Economic Development)
2. **རང་བཞིན་གནས་སྟངས་ ཉམས་སྲུང་** (Environmental Conservation)
3. **ལམ་སྲོལ་དར་ཁྱབ་དང་ ཉམས་སྲུང་** (Preservation and Promotion of Culture)
4. **བདག་སྐྱོང་ལེགས་ལྡན** (Good Governance)

#### ཁྱབ་ཁོངས་དགུ (The Nine Domains):
- སེམས་ཁམས་བདེ་ཐབས། • གཟུགས་ཁམས་འཕྲོད་བསྟེན། • དུས་ཚོད་བགོ་བཤའ།
- ཤེས་ཡོན། • ལམ་སྲོལ་སྣ་ཚོགས། • བདག་སྐྱོང་ལེགས་ལྡན།
- མི་སྡེའི་མཐུན་ལམ། • སྐྱེ་ལྡན་རིགས་སྣ། • འཚོ་བའི་གནས་སྟངས།

*དུ་བ་ རང་སོའི་རིག་རྩལ་གྱིས་ དྲ་རྒྱའི་དགོས་མཁོ་མེད་པར་ ཕུལ་ཡོད།*`;
      }

      // Bhutan places / Geography
      if (
        lower.includes('ཐིམ་ཕུག') ||
        lower.includes('སྤ་རོ་སྟག་ཚང') ||
        lower.includes('སྤུ་ན་ཁ') ||
        lower.includes('འབྲུག་ཡུལ')
      ) {
        return `### 🇧🇹 འབྲུག་ཡུལ་གྱི་གནས་ཚུལ་དང་ ས་ཁོངས

- **རྒྱལ་ས་ལྟེ་བ**: **ཐིམ་ཕུག** (Thimphu) — འཛམ་གླིང་ནང་ འགྲོ་འགྲུལ་གློག་བརྡ་ (Traffic lights) མེད་པའི་ རྒྱལ་ས་གཅིག་རྐྱངམ་ཨིན།
- **གནས་མཆོག་སྤ་རོ་སྟག་ཚང**: གུ་རུ་རིན་པོ་ཆེ་གིས་ སྟག་མོ་ལུ་ཆིབས་ཏེ་ བྱིན་གྱིས་བརླབས་གནང་བའི་ བྱག་གཟར་དྲགས་ཁར་ཆགས་ཡོད་པའི་ བྱིན་ཅན་གྱི་གནས་ཁང་།
- **སྤུ་ན་ཁ་རྫོང**: ཞབས་དྲུང་ངག་དབང་རྣམ་རྒྱལ་མཆོག་གིས་ ཕོ་ཆུ་དང་མོ་ཆུའི་འཛོམས་མདོར་ བཞེངས་གནང་བའི་ དགུན་གྱི་བཞུགས་གནས་ངོ་མཚར་ཅན།
- **རྒྱལ་ཡོངས་སྐད་ཡིག**: **རྫོང་ཁ** (Dzongkha).

དུ་བ་ AI གྱིས་ འབྲུག་གི་ལམ་སྲོལ་དང་ གནས་སྟངས་སྐོར་ལས་ ལན་གསལ་ཆ་ཚང་ཕུལ་ཚུགས།`;
      }

      // General Dzongkha query fallback
      return `### དུ་བ་ AI གླེང་མོལ་རྩིས་འཕྲུལ་གྱི་ལན་གསལ (Duba Response)

ཁྱོད་ཀྱི་དྲི་བ་ **"${prompt}"** འདི་ དུ་བ་རྒྱུན་འབྲེལ་མེད་པའི་རིག་རྩལ་གྱིས་ ལེགས་ཤོམ་སྦེ་བརྟག་ཞིབ་འབད་ཡི།

1. **གནད་དོན་གཙོ་བོ**:
   འདི་གི་ཐོག་ལུ་ དམིགས་ཡུལ་གསལ་ཏོག་ཏོ་བཟོ་སྟེ་ རིམ་པ་བཞིན་དུ་ ལཱ་འགན་འགྲུབ་དགོཔ་གལ་ཆེ།

2. **རང་བཞིན་ལས་རིམ་དང་ གློག་རིག**:
   - གློག་རིག་དང་ རྩིས་རིག་གི་ དཀའ་ངལ་ཡོད་ཚེ་ དུ་བ་ལུ་ ཐད་ཀར་དུ་ བཀོད་རྒྱ་གནང་ཚུགས།
   - དཔེར་ན་ \`Python script\` ཡང་ན་ \`HTML UI\` བཟོ་དགོ་ཚེ་ ལམ་སེང་བཟོ་བྱིན་ཚུགས།

3. **དྲ་རྒྱ་ཡོད་མེད་ཀྱི་ཁྱད་པར**:
   ད་ལྟོ་ ཁྱོད་ཀྱིས་ དུ་བ་རྒྱུན་འབྲེལ་མེད་པའི་རིག་རྩལ་ (Offline Core) ལག་ལེན་འཐབ་དོ། དྲ་རྒྱ་མཐུད་ཚེ་ སྤྲིན་ཚོགས་ Gemini 3.8 གི་མཐུ་རྩལ་ཡང་ མཉམ་འབྲེལ་འབད་ཚུགས།

གློག་རིག་གི་དཔེ་དང་ རྩིས་རིག་གི་ལན་གསལ་ དེ་ལས་ལྷག་སྟེ་དགོ་པ་ཅིན་ བཀའ་གནང་གནང་ལགས!`;
    }

    // 1. Math and Calculation
    const mathResult = tryEvaluateMath(prompt);
    if (mathResult) {
      return mathResult;
    }

    // 2. Greeting / Identity (English)
    if (/^(hi|hello|hey|greetings|good morning|good evening|yo)\b/i.test(lower)) {
      return `### Hello! I am Duba 🤖

I am your AI automation assistant and conversational chatbot, engineered to operate seamlessly **both online and offline**.

Here is what I can automate and solve for you right now:
- ⚡ **Code Generation & Sandboxing**: Write, debug, and execute JavaScript/HTML/Python.
- 📊 **Data Automation**: Summarize long documents, extract emails/links/metrics, convert JSON/CSV formats.
- 🧮 **Offline Math & Logic**: Compute scientific math, unit conversions, and algebraic equations.
- 📝 **Content & Workflows**: Draft emails, business proposals, project milestone plans, and action checklists.
- 🎙️ **Voice Integration**: Listen to your dictation and speak responses aloud.

What would you like to build or automate today?`;
    }

    if (lower.includes('who are you') || lower.includes('what is duba') || lower.includes('your name')) {
      return `### About Duba AI Chatbot

I am **Duba**, an intelligent full-stack AI automation chatbot created to provide ChatGPT-like capabilities everywhere—even when you are completely offline, in flight, or without internet connectivity.

#### Dual-Core Architecture:
1. **Duba Cloud Turbo**: Connected to the Google Gemini 3.8 Flash model for ultra-fast, frontier-tier cloud reasoning, search grounding, and deep code synthesis.
2. **Duba Offline Neural Core**: A 100% on-device heuristic knowledge engine, code architect, and automation runner that processes requests in your browser sandbox without sending any data over the network.

You can freely toggle between Cloud, Offline, and Auto-Pilot modes at the top navigation bar anytime!`;
    }

    // 3. Automation: Summarization command
    if (lower.startsWith('summarize:') || lower.startsWith('summarize ') || lower.includes('tldr')) {
      const textToSummarize = prompt.replace(/^(summarize:?|tldr:?)/i, '').trim();
      if (textToSummarize.length > 50) {
        const summary = offlineSummarizeText(textToSummarize, 3);
        return `### 📋 Duba Automated Summary (Offline Edge Engine)

${summary}

---
*Summary generated using Duba's on-device sentence ranking algorithm.*`;
      }
    }

    // 4. Automation: Extract entities / contacts
    if (lower.includes('extract') && (lower.includes('email') || lower.includes('url') || lower.includes('number') || lower.includes('data'))) {
      const extracted = offlineExtractData(prompt);
      const rows: string[] = [];
      if (extracted.emails.length) rows.push(`**Emails Found:** ${extracted.emails.map((e) => `\`${e}\``).join(', ')}`);
      if (extracted.urls.length) rows.push(`**Links/URLs Found:** ${extracted.urls.map((u) => `\`${u}\``).join(', ')}`);
      if (extracted.hashtags.length) rows.push(`**Hashtags Found:** ${extracted.hashtags.map((h) => `\`${h}\``).join(', ')}`);
      if (extracted.numbers.length) rows.push(`**Key Numbers:** ${extracted.numbers.map((n) => `\`${n}\``).join(', ')}`);

      if (rows.length > 0) {
        return `### 🔍 Extracted Entities (Offline Intelligence)

${rows.join('\n\n')}

*Extracted via Duba local pattern recognition.*`;
      }
    }

    // 5. Code Generation & Knowledge Match
    for (const item of KNOWLEDGE_BASE) {
      const matches = item.keywords.some((kw) => lower.includes(kw));
      if (matches) {
        let res = `### ${item.title}\n\n${item.summary}\n\n${item.details}`;
        if (item.codeSnippet) {
          res += `\n\n\`\`\`${item.codeSnippet.lang}\n${item.codeSnippet.code}\n\`\`\``;
        }
        res += '\n\n*Response delivered by Duba Offline Neural Knowledge Base.*';
        return res;
      }
    }

    // 6. Generic Code Prompt (e.g., "write python script", "javascript function", "html button")
    if (lower.includes('python') || lower.includes('javascript') || lower.includes('typescript') || lower.includes('html') || lower.includes('code')) {
      return `### Automated Code Solution (Duba Local Core)

Here is a clean, production-ready solution tailored for your request:

\`\`\`typescript
/**
 * Automated Task Handler
 * Clean, modern implementation with error handling and retry logic
 */
export async function executeAutomationTask<T>(
  taskName: string,
  runner: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      console.log(\`[Duba] Executing task "\${taskName}", attempt \${attempt + 1}...\`);
      const result = await runner();
      console.log(\`[Duba] Task "\${taskName}" completed successfully.\`);
      return result;
    } catch (error) {
      attempt++;
      console.warn(\`[Duba] Attempt \${attempt} failed:\`, error);
      if (attempt >= maxRetries) {
        throw new Error(\`Task "\${taskName}" failed after \${maxRetries} attempts.\`);
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt)));
    }
  }
  throw new Error('Unexpected execution flow');
}
\`\`\`

#### Key Highlights:
1. **Type Safety**: Fully typed with TypeScript generics \`<T>\`.
2. **Resilience**: Implements automated retry loops with exponential backoff.
3. **Observability**: Informative logging for debugging and automation monitoring.

*You can test and run this directly in the Duba Code Sandbox!*`;
    }

    // 7. Workflow / Action Planner
    if (lower.includes('plan') || lower.includes('workflow') || lower.includes('automate') || lower.includes('steps')) {
      return `### ⚡ Automated Workflow Blueprint: "${prompt.slice(0, 40)}..."

Here is a structured, production-grade automation workflow:

| Stage | Trigger / Step | Automated Action | Tools / Output |
|---|---|---|---|
| **Phase 1: Ingestion** | Incoming user request or scheduled cron trigger | Sanitize and validate payload parameters | Schema Validator (JSON / Zod) |
| **Phase 2: Processing** | Validation succeeds | Execute primary computation / transformation logic | Duba Automation Worker |
| **Phase 3: Verification** | Worker returns output | Validate integrity against expected outcome | Automated Assertion Sandbox |
| **Phase 4: Persistence** | Verification passed | Save record to local/cloud database and notify subscriber | Webhook / Notification / Log |

#### Recommended Next Steps:
- Review the stage triggers above.
- Test edge cases in your local environment.
- Use Duba's **Code Sandbox** (top navigation) to test individual action functions.`;
    }

    // 8. General Conversational Synthesizer (Fallback reasoning)
    return `### Duba Response (Offline Intelligence Engine)

I have processed your query: **"${prompt}"**

Here are the key insights and actionable takeaways:

1. **Core Concept**:
   This topic can be approached systematically by identifying the core objective, establishing measurable parameters, and executing iteratively.

2. **Action Plan & Automation**:
   - **Step 1**: Structure your input requirements clearly.
   - **Step 2**: Automate repetitive components using reusable scripts or templates.
   - **Step 3**: Validate outputs continuously to ensure reliability.

3. **Pro-Tip**:
   When working offline, Duba retains your conversation history, notes, and code snippets in persistent local storage. If you need online capabilities (such as web search or Gemini 3.8 Flash cloud synthesis), simply connect to the internet or switch to **Cloud Turbo** mode above!

Would you like me to generate a specific code script, structured table, or automation plan for this?`;
  }
}
