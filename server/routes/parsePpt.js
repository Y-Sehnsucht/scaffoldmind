import { Router } from 'express';
import { parsePptxFromBase64 } from '../services/pptxParser.js';
import { ok, sendValidationError } from '../utils/responses.js';

export const parsePptRouter = Router();

parsePptRouter.post('/', (req, res, next) => {
  try {
    const { fileName, fileBase64, pageNumber } = req.body || {};

    if (!fileName) {
      return sendValidationError(res, 'fileName is required.');
    }

    if (!fileBase64) {
      return sendValidationError(res, 'fileBase64 is required.');
    }

    if (!fileName.toLowerCase().endsWith('.pptx')) {
      return res.status(415).json({
        ok: false,
        data: null,
        error: {
          code: 'UNSUPPORTED_FILE_TYPE',
          message: '当前轻量解析器只支持 .pptx。PDF、图片 OCR 和旧版 .ppt 需要后续专门解析服务。',
        },
      });
    }

    const parsed = parsePptxFromBase64({ fileName, fileBase64, pageNumber });
    return res.json(ok(parsed));
  } catch (error) {
    error.status = 400;
    error.code = 'PPT_PARSE_ERROR';
    return next(error);
  }
});
