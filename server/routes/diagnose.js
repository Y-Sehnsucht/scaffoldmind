import { Router } from 'express';
import { notImplemented } from '../utils/notImplemented.js';

export const diagnoseRouter = Router();

diagnoseRouter.post('/', (_req, res) => {
  res.status(501).json(notImplemented('DIAGNOSE_NOT_IMPLEMENTED', 'Diagnosis API skeleton is ready.'));
});
