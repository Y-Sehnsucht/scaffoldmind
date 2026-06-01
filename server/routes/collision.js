import { Router } from 'express';
import { buildMockCollision } from '../services/mockLearningService.js';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireCommonLearningFields, requireFields } from '../utils/validation.js';

export const collisionRouter = Router();

collisionRouter.post('/', (req, res) => {
  const missing = [...requireCommonLearningFields(req.body), ...requireFields(req.body, ['sourceA', 'sourceB', 'sourceC'])];

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  return res.json(ok(buildMockCollision(req.body)));
});
