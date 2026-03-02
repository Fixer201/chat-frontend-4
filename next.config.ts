import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Next.js по умолчанию делает 308 редирект, убирая trailing slash из URL.
    // Django-бэкенд требует trailing slashes (APPEND_SLASH) и возвращает 404 без них.
    // Отключаем автоматический редирект, чтобы запросы вида /api/v1/chat/list/
    // доходили до catch-all route handler с сохранённым trailing slash.
    skipTrailingSlashRedirect: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'source.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
            },
            {
                protocol: 'https',
                hostname: 'randomuser.me',
            },
            {
                protocol: 'https',
                hostname: 'loremflickr.com',
            },
            { protocol: 'https', hostname: 'robohash.org' },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            {
                protocol: 'https',
                hostname: 'api.test.chat.ktsf.ru',
            },
        ],
    },
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
