import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
    { ignores: ['dist/**', 'demo/**', 'test-results/**', 'playwright-report/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.ts', 'scripts/**/*.{js,mjs}', 'tests/**/*.ts', '*.config.ts'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser
            }
        },
        rules: {
            'indent': [
                'error',
                4,
                {
                    'ignoreComments': true
                }
            ],
            'linebreak-style': [
                'error',
                'unix'
            ],
            'quotes': [
                'error',
                'single',
                {
                    'avoidEscape': true
                }
            ],
            'semi': [
                'error',
                'always'
            ],
            'no-console': [
                'warn',
                {
                    'allow': ['warn', 'error']
                }
            ],
            'no-empty': [
                'error',
                {
                    'allowEmptyCatch': true
                }
            ],
            '@typescript-eslint/no-explicit-any': 'off'
        }
    },
    {
        files: ['scripts/**/*.{js,mjs}'],
        languageOptions: {
            globals: {
                ...globals.node
            }
        }
    }
);
