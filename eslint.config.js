module.exports = [
    {
        languageOptions: {
            ecmaVersion: 2018,
            sourceType: 'module',
            globals: {
                ActiveXObject: 'readonly',
                console: 'readonly',
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                IntersectionObserver: 'readonly',
                MutationObserver: 'readonly',
                XMLHttpRequest: 'readonly',
                location: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly'
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
            ]
        }
    }
];
