import { Router } from 'express';
import { getAiRuntimeStatus, runAiPreflight } from '../services/aiService.js';
import { ok } from '../utils/responses.js';

export const aiRouter = Router();

aiRouter.get('/status', (_req, res) => {
  res.json(ok(getAiRuntimeStatus()));
});

aiRouter.post('/preflight', async (req, res, next) => {
  try {
    const data = await runAiPreflight(req.body?.aiConfig);
    return res.json(ok(data));
  } catch (error) {
    return next(error);
  }
});
