import { Router } from 'express';
import { generateCollision } from '../services/aiService.js';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireCommonLearningFields, requireFields } from '../utils/validation.js';

export const collisionRouter = Router();

collisionRouter.post('/', async (req, res, next) => {
  const missing = [...requireCommonLearningFields(req.body), ...requireFields(req.body, ['sourceA', 'sourceB', 'sourceC'])];

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  try {
    const data = await generateCollision(req.body);
    return res.json(ok(data));
  } catch (error) {
    return next(error);
  }
});
