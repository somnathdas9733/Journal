import { generateContentWithFallback, setCorsHeaders, parseRequestBody } from '../_gemini';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = parseRequestBody(req);
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

    return res.status(200).json({
      expandedText: result.text,
      model: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/expand-thought:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to expand thought.',
    });
  }
}
