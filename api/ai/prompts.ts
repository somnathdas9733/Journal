import { generateContentWithFallback, setCorsHeaders, parseRequestBody } from '../_gemini';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = parseRequestBody(req);
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

    return res.status(200).json({
      prompts: parsed.prompts || [],
      model: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/prompts:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate prompts.',
    });
  }
}
