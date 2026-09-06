import { generateContentWithFallback, setCorsHeaders, parseRequestBody } from '../_gemini';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = parseRequestBody(req);
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

    return res.status(200).json({
      analysis: parsed,
      model: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-entry:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze journal entry.',
    });
  }
}
