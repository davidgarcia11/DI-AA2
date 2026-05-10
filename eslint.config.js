import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // Tests: añadir globales de Vitest (test, expect, describe, vi…) para no
  // tener que importarlas en cada fichero. Sigue siendo válido importarlas si
  // se prefiere para que el editor las autocomplete.
  {
    files: ['**/*.test.{js,jsx}', '**/setupTests.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
  },
  // Backend mock: corre en Node, necesita los globales correspondientes.
  {
    files: ['server.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
