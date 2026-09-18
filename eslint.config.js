import { defineConfig, globalIgnores } from 'eslint/config';
import ts from 'eslint-config-cheminfo-typescript';

export default defineConfig(
  globalIgnores(['coverage', 'demo', 'dist', 'docs', 'lib']),
  ts,
);
