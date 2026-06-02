import path from 'node:path';
import { PDFParse } from 'pdf-parse';

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.markdown']);
const PDF_EXTENSIONS = new Set(['.pdf']);

export async function extractMaterialFromFile(file) {
  if (!file) {
    throw createMaterialError('MATERIAL_FILE_MISSING', 'Missing uploaded material file.');
  }

  const extension = path.extname(file.originalname || '').toLowerCase();

  if (TEXT_EXTENSIONS.has(extension)) {
    return extractTextFile(file, extension);
  }

  if (PDF_EXTENSIONS.has(extension)) {
    return extractPdfFile(file);
  }

  throw createMaterialError(
    'UNSUPPORTED_MATERIAL_TYPE',
    'Only TXT, Markdown, and PDF materials are supported in this version.',
  );
}

function extractTextFile(file, extension) {
  const extractedText = file.buffer.toString('utf8').trim();

  return {
    fileName: file.originalname,
    sourceType: extension === '.txt' ? 'txt' : 'markdown',
    mimeType: file.mimetype,
    pageCount: null,
    extractedText,
    warnings: buildWarnings(extractedText),
  };
}

async function extractPdfFile(file) {
  const parser = new PDFParse({ data: Uint8Array.from(file.buffer) });

  try {
    const info = await parser.getInfo();
    const text = await parser.getText();
    const extractedText = String(text.text || '').trim();

    return {
      fileName: file.originalname,
      sourceType: 'pdf',
      mimeType: file.mimetype,
      pageCount: Number(info.total || text.total || 0) || null,
      extractedText,
      warnings: buildWarnings(extractedText),
    };
  } finally {
    await parser.destroy();
  }
}

function buildWarnings(extractedText) {
  if (!extractedText) {
    return ['未提取到可用文字，请确认文件不是扫描图片或纯图片 PDF。'];
  }

  return [];
}

function createMaterialError(code, message, status = 400) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}
