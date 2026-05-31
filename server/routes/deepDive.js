import { Router } from 'express';
import { notImplemented } from '../utils/notImplemented.js';

export const deepDiveRouter = Router();

deepDiveRouter.post('/', (_req, res) => {
  res.status(501).json(notImplemented('DEEP_DIVE_NOT_IMPLEMENTED', 'Deep-dive API skeleton is ready.'));
});
