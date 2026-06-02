import { Router } from 'express';
import { generateObsidian } from '../services/aiService.js';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireFields } from '../utils/validation.js';

export const obsidianRouter = Router();

obsidianRouter.post('/', async (req, res, next) => {
  const missing = requireFields(req.body, ['analysis']);

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  try {
    const data = await generateObsidian(req.body);
    return res.json(ok(data));
  } catch (error) {
    return next(error);
  }
});
