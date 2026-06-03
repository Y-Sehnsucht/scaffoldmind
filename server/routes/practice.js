import { Router } from 'express';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireFields } from '../utils/validation.js';
import { evaluatePracticeAnswer, generatePracticeQuestion } from '../services/practiceService.js';

export const practiceRouter = Router();

practiceRouter.post('/generate', async (req, res, next) => {
  const missing = requireFields(req.body, ['subject', 'concept', 'difficulty']);
  if (missing.length) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  try {
    const data = await generatePracticeQuestion(req.body);
    return res.json(ok(data));
  } catch (error) {
    return next(error);
  }
});

practiceRouter.post('/evaluate', async (req, res, next) => {
  const missing = requireFields(req.body, ['question', 'userAnswer', 'knowledgePoint', 'subject']);
  if (missing.length) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  try {
    const data = await evaluatePracticeAnswer(req.body);
    return res.json(ok(data));
  } catch (error) {
    return next(error);
  }
});
