import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import healthHandler from './api/health';
import chatHandler from './api/ai/chat';
import brainstormHandler from './api/ai/brainstorm';
import analyzeHandler from './api/ai/analyze-entry';
import expandHandler from './api/ai/expand-thought';
import promptsHandler from './api/ai/prompts';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app = express();

// CORS & Middleware for local development
app.use((_req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Wire up routes directly to API handlers
app.all('/api/health', (req: Request, res: Response) => healthHandler(req, res));
app.all('/api/ai/chat', (req: Request, res: Response) => chatHandler(req, res));
app.all('/api/ai/brainstorm', (req: Request, res: Response) => brainstormHandler(req, res));
app.all('/api/ai/analyze-entry', (req: Request, res: Response) => analyzeHandler(req, res));
app.all('/api/ai/expand-thought', (req: Request, res: Response) => expandHandler(req, res));
app.all('/api/ai/prompts', (req: Request, res: Response) => promptsHandler(req, res));

export default app;

// Vite Middleware / Production Static Handling for Local Dev
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`[Paradigm Engine] Local server running on http://0.0.0.0:${PORT}`);
  });
}

// Only run standalone HTTP server if started directly (not in Vercel)
if (!process.env.VERCEL) {
  bootstrap().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
