import assert from 'node:assert/strict';
import path from 'node:path';
import { env, loadEnv, serverDirectory, serverEnvPath } from '../config/env.js';

assert.ok(env.port, 'env.port should be available');
assert.equal(typeof env.hasTextGenerationApiKey, 'boolean', 'hasTextGenerationApiKey should be boolean');
assert.equal(serverEnvPath, path.join(serverDirectory, '.env'), 'env loader should target server/.env');

const missingEnvPath = path.join(serverDirectory, '.env.verify-missing');
assert.doesNotThrow(() => loadEnv(missingEnvPath), 'missing server env file should not crash');

console.log(`Env verification passed. hasTextGenerationApiKey=${env.hasTextGenerationApiKey}`);
