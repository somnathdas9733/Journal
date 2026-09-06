import { generateContentWithFallback, setCorsHeaders, parseRequestBody } from '../_gemini.ts';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = parseRequestBody(req);
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
    for (const item of history.slice(-8)) {
      if (item.role === 'user' && item.content) {
        chatContents.push({ role: 'user', parts: [{ text: item.content }] });
      } else if (item.role === 'assistant' && item.content) {
        chatContents.push({ role: 'model', parts: [{ text: item.content }] });
      }
    }

    chatContents.push({ role: 'user', parts: [{ text: message }] });

    const result = await generateContentWithFallback({
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return res.status(200).json({
      reply: result.text,
      model: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate AI response. Please check your GEMINI_API_KEY in Vercel settings.',
    });
  }
}
