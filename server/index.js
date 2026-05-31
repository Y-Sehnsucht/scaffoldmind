import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { analyzeRouter } from './routes/analyze.js';
import { collisionRouter } from './routes/collision.js';
import { deepDiveRouter } from './routes/deepDive.js';
import { diagnoseRouter } from './routes/diagnose.js';
import { obsidianRouter } from './routes/obsidian.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'scaffoldmind-server' });
});

app.use('/api/analyze', analyzeRouter);
app.use('/api/deep-dive', deepDiveRouter);
app.use('/api/diagnose', diagnoseRouter);
app.use('/api/obsidian', obsidianRouter);
app.use('/api/collision', collisionRouter);

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({
    ok: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Unexpected server error',
    },
  });
});

app.listen(env.port, () => {
  console.log(`ScaffoldMind server listening on port ${env.port}`);
});
