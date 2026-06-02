import cors from 'cors';
import express from 'express';
import { analyzeRouter } from './routes/analyze.js';
import { collisionRouter } from './routes/collision.js';
import { deepDiveRouter } from './routes/deepDive.js';
import { diagnoseRouter } from './routes/diagnose.js';
import { materialsRouter } from './routes/materials.js';
import { obsidianRouter } from './routes/obsidian.js';
import { profileRouter } from './routes/profile.js';
import { recordsRouter } from './routes/records.js';
import { getAiRuntimeStatus } from './services/aiService.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, data: { service: 'scaffoldmind-server', mode: 'mock' } });
  });

  app.get('/api/ai/status', (_req, res) => {
    res.json({ ok: true, data: getAiRuntimeStatus(), error: null });
  });

  app.use('/api/analyze', analyzeRouter);
  app.use('/api/deep-dive', deepDiveRouter);
  app.use('/api/diagnose', diagnoseRouter);
  app.use('/api/obsidian', obsidianRouter);
  app.use('/api/collision', collisionRouter);
  app.use('/api/materials', materialsRouter);
  app.use('/api/records', recordsRouter);
  app.use('/api/profile', profileRouter);

  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({
      ok: false,
      data: null,
      error: {
        code: err.code || 'SERVER_ERROR',
        message: err.message || 'Unexpected server error',
      },
    });
  });

  return app;
}
