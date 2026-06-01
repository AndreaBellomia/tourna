// @ts-check
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { nestJsConfig } from '@repo/eslint-config/nestjs';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default nestJsConfig(tsconfigRootDir);
