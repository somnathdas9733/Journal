import { setCorsHeaders } from './_gemini.ts';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Paradigm Journal Engine',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
}
