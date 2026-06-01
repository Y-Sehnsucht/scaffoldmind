import { Router } from 'express';
import { buildMockObsidian } from '../services/mockLearningService.js';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireFields } from '../utils/validation.js';

export const obsidianRouter = Router();

obsidianRouter.post('/', (req, res) => {
  const missing = requireFields(req.body, ['analysis']);

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  return res.json(ok(buildMockObsidian(req.body)));
});
