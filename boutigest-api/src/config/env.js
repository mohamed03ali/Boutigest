import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
dotenv.config({ path: envPath });

export function assertRequiredEnvironment() {
  const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`Variables manquantes dans boutigest-api/.env: ${missingVariables.join(', ')}`);
  }
}