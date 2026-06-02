import { Router } from 'express';
import { ok, sendValidationError } from '../utils/responses.js';
import {
  clearLearningRecords,
  createLearningRecord,
  deleteLearningRecord,
  listLearningRecords,
} from '../services/recordStore.js';

export const recordsRouter = Router();

recordsRouter.get('/', (req, res) => {
  const data = listLearningRecords(req.query.limit);
  return res.json(ok(data));
});

recordsRouter.post('/', (req, res) => {
  if (!req.body?.analysis) {
    return sendValidationError(res, 'Missing required field(s): analysis');
  }

  const data = createLearningRecord(req.body);
  return res.status(201).json(ok(data));
});

recordsRouter.delete('/', (_req, res) => {
  clearLearningRecords();
  return res.json(ok({ cleared: true }));
});

recordsRouter.delete('/:id', (req, res) => {
  const deleted = deleteLearningRecord(req.params.id);
  return res.json(ok({ deleted }));
});
