import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Конфигурация для Turbopack (используется в dev)
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
        },
    },

    // Конфигурация для Webpack (используется в build)
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
        })
        return config
    },
}

export default nextConfig
