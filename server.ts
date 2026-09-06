import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

// 1. Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy GoogleGenAI client initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 2. Resilient Gemini Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

interface FallbackOptions {
  contents: any;
  config?: any;
}

/**
 * Executes content generation through the resilient fallback ladder.
 */
async function generateContentWithFallback(options: FallbackOptions): Promise<{ text: string; modelUsed: string }> {
  const client = getAIClient();
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });

      const text = response.text || '';
      if (text) {
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || 0;
      const message = err?.message || String(err);
      console.warn(`[Gemini Fallback] Model ${model} failed (status: ${status}): ${message}. Attempting next ladder model...`);
      // Continues to next model in ladder for recoverable errors (503, 429, 404, 500, etc.)
    }
  }

  throw new Error(`All fallback models exhausted. Last error: ${lastError?.message || 'Unknown generation error'}`);
}

// ================= API ENDPOINTS ================= //

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Paradigm Journal Engine',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Reflection Chat Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const message = typeof data.message === 'string' ? data.message.trim() : '';
    const history = Array.isArray(data.history) ? data.history : [];
    const context = typeof data.context === 'string' ? data.context : '';
    const persona = typeof data.persona === 'string' ? data.persona : 'reflective';

    if (!message) {
      return res.status(400).json({ error: 'Message payload is required' });
    }

    const personaInstructions: Record<string, string> = {
      reflective: 'You are the Paradigm Socratic Journal Companion. You help the user reflect deeply, identify cognitive blind spots, ask clarifying questions, and turn raw reflections into actionable clarity. Keep responses structured, thoughtful, and articulate.',
      brainstormer: 'You are a high-level creative strategist. Help the user diverge, expand, uncover unusual angles, challenge assumptions, and generate fresh possibilities.',
      stoic: 'You are a calm, stoic philosopher. Help the user distinguish between what is in their control and what is not, reframing emotional friction into growth.',
      clarity: 'You are an executive clarity coach. Help the user prioritize ruthlessly, cut through fluff, and find the single highest-leverage insight.',
    };

    const systemPrompt = `${personaInstructions[persona] || personaInstructions.reflective}
Recent Journal Context provided by user (if any):
"""
${context.slice(0, 3000)}
"""
Tone: Concise, elegant, insightful, no generic platitudes. Use markdown formatting with bullet points or italicized reflective questions.`;

    const chatContents: any[] = [];
    
    // Append conversation history
    for (const item of history.slice(-8)) {
      if (item.role === 'user' && item.content) {
        chatContents.push({ role: 'user', parts: [{ text: item.content }] });
      } else if (item.role === 'assistant' && item.content) {
        chatContents.push({ role: 'model', parts: [{ text: item.content }] });
      }
    }

    // Append latest prompt
    chatContents.push({ role: 'user', parts: [{ text: message }] });

    const result = await generateContentWithFallback({
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      reply: result.text,
      model: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate AI response. Please check your API key.',
    });
  }
});

// AI Brainstorming Board Generator
app.post('/api/ai/brainstorm', async (req: Request, res: Response) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const topic = typeof data.topic === 'string' ? data.topic.trim() : '';
    const framework = typeof data.framework === 'string' ? data.framework : 'first-principles';

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required for brainstorming' });
    }

    const frameworkPrompts: Record<string, string> = {
      'first-principles': 'Break down this topic into fundamental undeniable truths and rebuild solutions from the ground up without relying on standard analogies.',
      'scamper': 'Apply SCAMPER (Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse) to unlock radical new possibilities.',
      'six-hats': 'Explore through different perspectives: Logic/Facts (White), Intuition/Emotion (Red), Caution/Risks (Black), Optimism/Benefits (Yellow), Creativity/Growth (Green), and Process/Action (Blue).',
      'mind-matrix': 'Map out 4 quadrants of opportunities: High Impact / Low Effort quick wins, Strategic Bets, Architectural foundations, and Counter-intuitive leaps.',
      'pros-cons': 'Analyze core tensions, trade-offs, second-order consequences, and hidden assumptions.',
    };

    const prompt = `Topic to brainstorm: "${topic}"
Framework: ${framework} (${frameworkPrompts[framework] || frameworkPrompts['first-principles']})

Generate a structured brainstorm in valid JSON format only.
Output schema:
{
  "summary": "Concise 1-2 sentence core insight",
  "ideas": [
    {
      "id": "idea-1",
      "title": "Clear punchy concept name",
      "category": "Category or perspective tag",
      "description": "Specific explanatory insight (2-3 sentences)",
      "actionableStep": "Concrete physical or mental action step to test this"
    }
  ]
}
Provide 4 to 6 diverse, high-caliber ideas. Return ONLY the raw JSON without markdown code fences if possible.`;

    const result = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.75,
      },
    });

    let parsed: any;
    try {
      const cleanJson = result.text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        summary: `Brainstorm exploration on ${topic}`,
        ideas: [
          {
            id: 'idea-1',
            title: 'Foundational Reframe',
            description: result.text.slice(0, 300),
            actionableStep: 'Define initial hypothesis and test constraints.',
          },
        ],
      };
    }

    res.json({
      data: parsed,
      model: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/brainstorm:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate brainstorming matrix.',
    });
  }
});

// Entry Reflection & Deep Analysis
app.post('/api/ai/analyze-entry', async (req: Request, res: Response) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const title = typeof data.title === 'string' ? data.title : '';
    const content = typeof data.content === 'string' ? data.content : '';

    if (!content && !title) {
      return res.status(400).json({ error: 'Entry content is required for analysis' });
    }

    const prompt = `Analyze this journal entry:
Title: "${title}"
Content:
"""
${content.slice(0, 4000)}
"""

Provide an objective, psychologically insightful reflection in JSON format:
{
  "summary": "A sharp 1-2 sentence synthesis of the core theme and subconscious focus",
  "reflectionQuestion": "One deep, thought-provoking question that helps the author uncover deeper clarity or examine their premise",
  "sentimentScore": 0.85, // Number between 0.0 (deep distress/anxiety) to 1.0 (peak clarity/gratitude)
  "actionItem": "A single concrete micro-habit or next step recommended based on this reflection",
  "keywords": ["tag1", "tag2", "tag3"]
}
Return valid JSON only.`;

    const result = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    let parsed: any;
    try {
      const cleanJson = result.text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        summary: 'Reflection captured and synthesized.',
        reflectionQuestion: 'What assumption in this entry deserves to be tested further?',
        sentimentScore: 0.75,
        actionItem: 'Revisit this insight before planning tomorrow.',
        keywords: ['Journaling', 'Reflection'],
      };
    }

    res.json({
      analysis: parsed,
      model: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-entry:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze journal entry.',
    });
  }
});

// Expand Seed / Thought Stream into Structured Journal
app.post('/api/ai/expand-thought', async (req: Request, res: Response) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const rawThought = typeof data.rawThought === 'string' ? data.rawThought.trim() : '';
    const style = typeof data.style === 'string' ? data.style : 'structured';

    if (!rawThought) {
      return res.status(400).json({ error: 'Thought input is required' });
    }

    const prompt = `The user wrote a quick seed thought or messy brain dump:
"""
${rawThought}
"""

Style requested: ${style} (e.g. structured, introspective, strategic, or free-flowing).
Transform this into a beautifully articulated, coherent journal entry.
Format requirements:
- Keep the user's authentic voice and intention.
- Add structured headings or bullet points where clarity is improved.
- Conclude with a 1-sentence grounding realization or immediate next step.
- Return the entry text in clean Markdown.`;

    const result = await generateContentWithFallback({
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({
      expandedText: result.text,
      model: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/expand-thought:', error);
    res.status(500).json({
      error: error?.message || 'Failed to expand thought.',
    });
  }
});

// Dynamic Daily Prompts Generator
app.post('/api/ai/prompts', async (req: Request, res: Response) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const mood = typeof data.mood === 'string' ? data.mood : 'clarity';
    const focusArea = typeof data.focusArea === 'string' ? data.focusArea : 'General';

    const prompt = `Generate 4 profound, non-cliché journaling prompts for someone currently in a "${mood}" state, focusing on "${focusArea}".
Avoid standard superficial prompts like "What are 3 things you are grateful for?".
Instead, craft high-leverage prompts that unlock self-awareness, cognitive reappraisal, strategic ambition, and emotional resonance.

Return JSON format:
{
  "prompts": [
    {
      "id": "p-1",
      "category": "Mindset",
      "text": "The main prompt question",
      "subtext": "A 1-sentence guidance on how to unpack this question"
    }
  ]
}`;

    const result = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    let parsed: any;
    try {
      const cleanJson = result.text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        prompts: [
          {
            id: 'p-default-1',
            category: 'Clarity',
            text: 'What is a truth about your current trajectory that you are hesitant to say out loud?',
            subtext: 'Write continuously for 3 minutes without filtering or editing yourself.',
          },
        ],
      };
    }

    res.json({
      prompts: parsed.prompts || [],
      model: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/prompts:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate prompts.',
    });
  }
});

// 3. Vite Middleware / Production Static Handling
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Paradigm Engine] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
