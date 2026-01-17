// Генератор URL для аватарок из различных источников
/**
 * Простой генератор URL для разных источников изображений
 */

import {
    AVATAR_SOURCES,
    DEFAULT_AVATAR_SOURCE,
} from './avatarSources'

/**
 * Генерирует URL изображения в зависимости от источника
 * @param seed - Уникальный идентификатор для изображения
 * @param width - Ширина
 * @param height - Высота
 * @param source - Источник изображения
 */
export const generateAvatarUrl = (
    seed: string | number,
    width: number = 300,
    height: number = 300,
    source: string = DEFAULT_AVATAR_SOURCE,
): string => {
    // Fallback для недоступных источников
    if (source === 'недоступный_источник') {
        return '/images/chatHeader/userAvatar.svg'
    }
    const seedStr = String(seed)

    // Генерация URL в зависимости от источника
    switch (source) {
        case AVATAR_SOURCES.PISSUM:
            return `https://picsum.photos/seed/${seedStr}/${width}/${height}?grayscale`

        case AVATAR_SOURCES.UNSPLASH:
            return `https://source.unsplash.com/random/${width}x${height}/?person,portrait&sig=${seedStr}`

        case AVATAR_SOURCES.DICEBEAR:
            return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedStr}&size=${width}`

        case AVATAR_SOURCES.RANDOM_USER:
            // Генерация детерминированного хэша для выбора изображения
            let hash = 0
            for (let i = 0; i < seedStr.length; i++) {
                hash =
                    seedStr.charCodeAt(i) +
                    ((hash << 5) - hash)
            }
            const index = Math.abs(hash) % 100
            const gender = hash % 2 === 0 ? 'men' : 'women'
            return `https://randomuser.me/api/portraits/${gender}/${index}.jpg`

        case AVATAR_SOURCES.FLICKR:
            const categories = [
                'person',
                'portrait',
                'face',
                'people',
            ]
            const category =
                categories[
                    seedStr.length % categories.length
                ]
            return `https://loremflickr.com/${width}/${height}/${category}`

        case AVATAR_SOURCES.ROBOHASH:
            return `https://robohash.org/${seedStr}?size=${width}x${height}`

        case AVATAR_SOURCES.PLACEHOLDER:
            // Простой цветной плейсхолдер с текстом
            const colors = [
                '3498db',
                '2ecc71',
                'e74c3c',
                'f39c12',
                '9b59b6',
            ]
            const color =
                colors[seedStr.length % colors.length]
            const text = seedStr.charAt(0).toUpperCase()
            return `https://via.placeholder.com/${width}x${height}/${color}/ffffff?text=${text}`

        default:
            // По умолчанию используем Picsum
            return `https://picsum.photos/seed/${seedStr}/${width}/${height}`
    }
}

/**
 * Простая функция для проверки, работает ли источник
 */
export const checkIfSourceWorks = async (
    source: string,
): Promise<boolean> => {
    try {
        const testUrl = generateAvatarUrl(
            'test',
            10,
            10,
            source,
        )
        const response = await fetch(testUrl, {
            method: 'HEAD',
        })
        return response.ok
    } catch {
        return false
    }
}

/**
 * Показывает все источники и их статус (для отладки)
 */
export const showAllSourcesStatus =
    async (): Promise<void> => {
        console.log(
            'Проверяем доступность источников аватарок:',
        )

        for (const [key, source] of Object.entries(
            AVATAR_SOURCES,
        )) {
            const isWorking =
                await checkIfSourceWorks(source)
            console.log(
                `${key}: ${source} - ${isWorking ? '✓ Работает' : '✗ Не работает'}`,
            )
        }
    }
