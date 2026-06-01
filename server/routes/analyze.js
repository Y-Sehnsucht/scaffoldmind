import { Router } from 'express';
import { generateAnalysis } from '../services/aiService.js';
import { buildMockAnalysis } from '../services/mockLearningService.js';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireCommonLearningFields, requireFields } from '../utils/validation.js';

export const analyzeRouter = Router();

analyzeRouter.post('/', async (req, res, next) => {
  const missing = [...requireCommonLearningFields(req.body), ...requireFields(req.body, ['materialText'])];

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  try {
    const data = req.body.aiSource === 'real_api' ? await generateAnalysis(req.body) : buildMockAnalysis(req.body);
    return res.json(ok(data));
  } catch (error) {
    return next(error);
  }
});
