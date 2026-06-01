import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const configDirectory = path.dirname(currentFilePath);

export const serverDirectory = path.resolve(configDirectory, '..');
export const serverEnvPath = path.join(serverDirectory, '.env');

export function buildEnv(source = process.env) {
  const port = Number(source.PORT || 3001);
  const textGenerationApiKey = source.TEXT_GENERATION_API_KEY || '';

  return {
    port: Number.isFinite(port) && port > 0 ? port : 3001,
    textGenerationApiKey,
    hasTextGenerationApiKey: Boolean(textGenerationApiKey),
    textGenerationApiUrl: source.TEXT_GENERATION_API_URL || 'https://api.openai.com/v1/chat/completions',
    textGenerationModel: source.TEXT_GENERATION_MODEL || 'gpt-4o-mini',
  };
}

export function loadEnv(envPath = serverEnvPath) {
  dotenv.config({ path: envPath });
  return buildEnv(process.env);
}

export const env = loadEnv();
