import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
        ],
    },
    // Добавляем headers для CORS (чтобы разрешить запросы к /api/* из браузера)
    async headers() {
        return [
            {
                source: '/api/:path*', // Применяется ко всем путям под /api/
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    }, // Разрешает запросы от любого домена (для dev; в prod указать конкретный домен)
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,POST,PUT,DELETE',
                    }, // Разрешённые методы
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type,Authorization,X-CSRFTOKEN',
                    }, // Разрешённые заголовки
                ],
            },
        ]
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
