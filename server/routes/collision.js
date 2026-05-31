import { Router } from 'express';
import { notImplemented } from '../utils/notImplemented.js';

export const collisionRouter = Router();

collisionRouter.post('/', (_req, res) => {
  res.status(501).json(notImplemented('COLLISION_NOT_IMPLEMENTED', 'Multi-source collision API skeleton is ready.'));
});
