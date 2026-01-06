import type { Config } from 'tailwindcss'

const config: Config = {
    content: {
        relative: true,
        files: [
            './src/**/*.{js,ts,jsx,tsx,mdx}',
            './node_modules/@ferrucc-io/emoji-picker/dist/**/*.{js,jsx,ts,tsx}',
        ],
    },
}

export default config
