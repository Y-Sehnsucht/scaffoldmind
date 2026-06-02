import { Router } from 'express';
import { buildLearningProfileSummary } from '../services/recordStore.js';
import { ok } from '../utils/responses.js';

export const profileRouter = Router();

profileRouter.get('/summary', (_req, res) => {
  const data = buildLearningProfileSummary();
  return res.json(ok(data));
});
