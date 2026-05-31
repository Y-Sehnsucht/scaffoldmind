import { Router } from 'express';
import { notImplemented } from '../utils/notImplemented.js';

export const analyzeRouter = Router();

analyzeRouter.post('/', (_req, res) => {
  res.status(501).json(notImplemented('ANALYZE_NOT_IMPLEMENTED', 'Analysis API skeleton is ready.'));
});
