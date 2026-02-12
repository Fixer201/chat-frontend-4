import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import importX from 'eslint-plugin-import-x'
import eslintConfigPrettier from 'eslint-config-prettier'

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,

    // Override default ignores of eslint-config-next.
    globalIgnores([
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        'node_modules/**',
    ]),

    // Tailwind CSS rules (better-tailwindcss) - enforces custom color tokens only
    {
        plugins: {
            'better-tailwindcss':
                eslintPluginBetterTailwindcss,
        },
        rules: {
            // Enable all recommended rules with error level (enforces best practices + custom tokens)
            ...eslintPluginBetterTailwindcss.configs[
                'recommended-error'
            ].rules,
        },
        settings: {
            'better-tailwindcss': {
                // Tailwind v4: path to CSS entry point where @theme is defined
                entryPoint: 'src/app/globals.css',
            },
        },
    },

    // Import organization (import-x) - prevents cycles and duplicates
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

    // Enhanced accessibility and React rules
    // (jsx-a11y already included in nextVitals, here we enforce stricter levels)
    {
        rules: {
            // Accessibility rules - convert warnings to errors per CSS-STYLING-GUIDE section 8
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

            // React rules - enforce best practices
            'react/jsx-key': 'error',
            'react/jsx-no-target-blank': 'error',
            'react/no-unescaped-entities': 'error',
        },
    },

    // Prettier integration - MUST be last to disable conflicting ESLint rules
    eslintConfigPrettier,
])

export default eslintConfig
