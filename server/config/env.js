import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3001),
  textGenerationApiKey: process.env.TEXT_GENERATION_API_KEY || '',
};
