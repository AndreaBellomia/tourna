import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'
import onlyWarn from 'eslint-plugin-only-warn'

/**
 * Shared ESLint config for TypeScript packages in the monorepo.
 *
 * @param {string} dirname - Pass `import.meta.dirname` from the consuming project.
 * @returns {import('eslint').Linter.Config[]}
 */
export const config = (dirname) =>
  tseslint.config(
    {
      ignores: ['dist/**'],
    },
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
      plugins: {
        turbo: turboPlugin,
        onlyWarn,
      },
      rules: {
        'turbo/no-undeclared-env-vars': 'warn',
      },
      languageOptions: {
        parserOptions: {
          projectService: {
            allowDefaultProject: [
              'eslint.config.js',
              'eslint.config.mjs',
              'eslint.config.cjs',
              'postcss.config.js',
              'postcss.config.mjs',
              'tsdown.config.mts',
            ],
          },
          tsconfigRootDir: dirname,
        },
      },
    },
  )
