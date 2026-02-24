import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import importX from 'eslint-plugin-import-x'
import eslintConfigPrettier from 'eslint-config-prettier'

// Убираем проблемный импорт из 'eslint/config'
// Просто создаем массив конфигурации напрямую

const eslintConfig = [
    // Next.js конфигурации
    ...nextVitals,
    ...nextTs,

    // Ignore patterns - правильный синтаксис для ESLint 8
    {
        ignores: [
            '.next/**',
            'out/**',
            'build/**',
            'next-env.d.ts',
            'node_modules/**',
        ],
    },

    // Tailwind CSS rules
    {
        plugins: {
            'better-tailwindcss':
                eslintPluginBetterTailwindcss,
        },
        rules: {
            ...eslintPluginBetterTailwindcss.configs[
                'recommended-error'
            ].rules,
        },
        settings: {
            'better-tailwindcss': {
                entryPoint: 'src/app/globals.css',
            },
        },
    },

    // Import organization
    {
        plugins: {
            'import-x': importX,
        },
        settings: {
            'import-x/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                },
            },
        },
        rules: {
            'import-x/no-cycle': 'error',
            'import-x/no-duplicates': 'error',
        },
    },

    // Accessibility rules
    {
        rules: {
            'jsx-a11y/alt-text': 'error',
            'jsx-a11y/anchor-has-content': 'error',
            'jsx-a11y/heading-has-content': 'error',
            'jsx-a11y/label-has-associated-control':
                'error',
            'jsx-a11y/click-events-have-key-events':
                'error',
            'jsx-a11y/no-noninteractive-tabindex': 'error',
            'jsx-a11y/no-access-key': 'error',
            'jsx-a11y/aria-role': 'error',
            'jsx-a11y/aria-props': 'error',
            'jsx-a11y/aria-unsupported-elements': 'error',
            'react/jsx-key': 'error',
            'react/jsx-no-target-blank': 'error',
            'react/no-unescaped-entities': 'error',
        },
    },

    // Prettier - обязательно последним
    eslintConfigPrettier,
]

export default eslintConfig
