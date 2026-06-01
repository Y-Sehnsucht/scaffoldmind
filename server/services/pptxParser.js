import { inflateRawSync } from 'node:zlib';

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const LOCAL_FILE_SIGNATURE = 0x04034b50;

export function parsePptxFromBase64({ fileName, fileBase64, pageNumber = 1 }) {
  const buffer = Buffer.from(stripDataUrlPrefix(fileBase64), 'base64');
  const entries = readZipEntries(buffer);
  const slideEntries = entries
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry.name))
    .sort((a, b) => getSlideNumber(a.name) - getSlideNumber(b.name));

  if (slideEntries.length === 0) {
    return {
      fileName,
      pageNumber,
      slideCount: 0,
      extractedText: '',
      slides: [],
      images: [],
      structure: [],
      warnings: ['没有在 PPTX 中找到幻灯片 XML。'],
    };
  }

  const slides = slideEntries.map((entry) => parseSlideEntry(entry, entries));
  const selectedSlide = slides.find((slide) => slide.pageNumber === Number(pageNumber)) || slides[0];
  const extractedText = selectedSlide.textBlocks.map((block) => block.text).filter(Boolean).join('\n');

  return {
    fileName,
    pageNumber: selectedSlide.pageNumber,
    slideCount: slides.length,
    extractedText,
    slides,
    images: selectedSlide.images,
    structure: selectedSlide.structure,
    warnings: [
      '当前解析直接读取 PPTX XML 文本和图片占位关系，不执行 OCR。',
      '如果文字被嵌入图片，需要后续接入 OCR 或视觉模型识别。',
    ],
  };
}

function readZipEntries(buffer) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = [];
  let offset = centralDirectoryOffset;
  const endOffset = centralDirectoryOffset + centralDirectorySize;

  while (offset < endOffset) {
    if (buffer.readUInt32LE(offset) !== CENTRAL_DIRECTORY_SIGNATURE) {
      break;
    }

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + fileNameLength);
    const data = readLocalFileData(buffer, localHeaderOffset, compressedSize, compressionMethod);

    entries.push({ name, data });
    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(buffer) {
  const minOffset = Math.max(0, buffer.length - 65557);

  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === EOCD_SIGNATURE) {
      return offset;
    }
  }

  throw new Error('Invalid PPTX ZIP: missing end of central directory.');
}

function readLocalFileData(buffer, localHeaderOffset, compressedSize, compressionMethod) {
  if (buffer.readUInt32LE(localHeaderOffset) !== LOCAL_FILE_SIGNATURE) {
    throw new Error('Invalid PPTX ZIP: bad local file header.');
  }

  const fileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
  const extraLength = buffer.readUInt16LE(localHeaderOffset + 28);
  const dataOffset = localHeaderOffset + 30 + fileNameLength + extraLength;
  const compressed = buffer.subarray(dataOffset, dataOffset + compressedSize);

  if (compressionMethod === 0) {
    return compressed;
  }

  if (compressionMethod === 8) {
    return inflateRawSync(compressed);
  }

  throw new Error(`Unsupported PPTX ZIP compression method: ${compressionMethod}.`);
}

function parseSlideEntry(entry, allEntries) {
  const pageNumber = getSlideNumber(entry.name);
  const xml = entry.data.toString('utf8');
  const textBlocks = extractTextBlocks(xml);
  const images = extractImages(xml, readRelationships(pageNumber, allEntries));
  const structure = [
    ...textBlocks.map((block, index) => ({
      type: 'text',
      order: index + 1,
      text: block.text,
    })),
    ...images.map((image, index) => ({
      type: 'image',
      order: textBlocks.length + index + 1,
      description: image.target ? `图片占位：${image.target}` : '图片占位',
    })),
  ];

  return {
    pageNumber,
    textBlocks,
    images,
    structure,
  };
}

function extractTextBlocks(xml) {
  const paragraphMatches = xml.match(/<a:p[\s\S]*?<\/a:p>/g) || [];
  return paragraphMatches
    .map((paragraph) => {
      const text = [...paragraph.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)]
        .map((match) => decodeXml(match[1]))
        .join('');
      return text.trim();
    })
    .filter(Boolean)
    .map((text) => ({ text }));
}

function extractImages(xml, relationships) {
  const embedIds = [...xml.matchAll(/<a:blip[^>]+r:embed="([^"]+)"/g)].map((match) => match[1]);
  return embedIds.map((relationshipId, index) => ({
    id: relationshipId,
    order: index + 1,
    target: relationships[relationshipId] || '',
  }));
}

function readRelationships(pageNumber, allEntries) {
  const relsEntry = allEntries.find((entry) => entry.name === `ppt/slides/_rels/slide${pageNumber}.xml.rels`);
  if (!relsEntry) {
    return {};
  }

  const xml = relsEntry.data.toString('utf8');
  return [...xml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g)].reduce((map, match) => {
    map[match[1]] = match[2];
    return map;
  }, {});
}

function getSlideNumber(name) {
  return Number(name.match(/slide(\d+)\.xml$/)?.[1] || 0);
}

function decodeXml(value) {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function stripDataUrlPrefix(value) {
  return String(value || '').replace(/^data:[^;]+;base64,/, '');
}
