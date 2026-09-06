import { generateContentWithFallback, setCorsHeaders, parseRequestBody } from '../_gemini.ts';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = parseRequestBody(req);
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

    return res.status(200).json({
      data: parsed,
      model: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/brainstorm:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate brainstorming matrix.',
    });
  }
}
