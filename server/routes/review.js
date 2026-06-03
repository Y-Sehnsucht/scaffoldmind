import { Router } from 'express';
import { ok } from '../utils/responses.js';
import { generateReviewPlan } from '../services/reviewService.js';

export const reviewRouter = Router();

reviewRouter.post('/plan', async (req, res, next) => {
  try {
    const data = await generateReviewPlan(req.body || {});
    return res.json(ok(data));
  } catch (error) {
    return next(error);
  }
});
