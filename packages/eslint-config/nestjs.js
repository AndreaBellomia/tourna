import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * A shared ESLint configuration for NestJS applications.
 *
 * @param {string} dirname - Pass `import.meta.dirname` from the consuming project.
 * @returns {import("eslint").Linter.Config[]}
 */
export const nestJsConfig = (dirname) =>
  tseslint.config(
    {
      ignores: ['eslint.config.mjs', 'dist/**'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        sourceType: 'commonjs',
        parserOptions: {
          projectService: {
            allowDefaultProject: [
              'eslint.config.js',
              'eslint.config.mjs',
              'eslint.config.cjs',
              'postcss.config.js',
              'postcss.config.mjs',
              'tsup.config.ts',
            ],
          },
          tsconfigRootDir: dirname,
        },
      },
    },
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  )
