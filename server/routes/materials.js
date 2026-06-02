import { Router } from 'express';
import multer from 'multer';
import { extractMaterialFromFile } from '../services/materialService.js';
import { ok } from '../utils/responses.js';

export const materialsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 1,
  },
});

materialsRouter.post('/extract', (req, res, next) => {
  upload.single('material')(req, res, async (uploadError) => {
    if (uploadError) {
      return sendUploadError(res, uploadError);
    }

    try {
      const data = await extractMaterialFromFile(req.file);
      return res.json(ok(data));
    } catch (error) {
      return next(error);
    }
  });
});

function sendUploadError(res, error) {
  const isTooLarge = error.code === 'LIMIT_FILE_SIZE';

  return res.status(isTooLarge ? 413 : 400).json({
    ok: false,
    data: null,
    error: {
      code: isTooLarge ? 'MATERIAL_FILE_TOO_LARGE' : error.code || 'MATERIAL_UPLOAD_ERROR',
      message: isTooLarge ? 'Material file must be 15MB or smaller.' : error.message || 'Material upload failed.',
    },
  });
}
