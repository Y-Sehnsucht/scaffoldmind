import { Router } from 'express';
import { notImplemented } from '../utils/notImplemented.js';

export const obsidianRouter = Router();

obsidianRouter.post('/', (_req, res) => {
  res.status(501).json(notImplemented('OBSIDIAN_NOT_IMPLEMENTED', 'Obsidian export API skeleton is ready.'));
});
