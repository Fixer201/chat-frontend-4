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
 * @param seed - Уникальный идентификатор для изображения (обеспечивает детерминированность)
 * @param width - Ширина изображения в пикселях
 * @param height - Высота изображения в пикселях
 * @param source - Источник изображения (ключ из AVATAR_SOURCES)
 */
export const generateAvatarUrl = (
    seed: string | number,
    width: number = 300,
    height: number = 300,
    source: string = DEFAULT_AVATAR_SOURCE,
): string => {
    // Fallback для недоступных источников
    // Возвращаем локальное изображение если источник указан как недоступный

    if (/(useAvatar)/.test(source)) {
        return '/images/chatHeader/userAvatar.svg'
    }
    const seedStr = String(seed) // Приводим seed к строке для использования в URL

    // switch statement для выбора генератора URL в зависимости от источника
    // Каждый источник имеет свой формат URL и параметры
    switch (source) {
        case AVATAR_SOURCES.PISSUM:
            // Picsum Photos - сервис случайных изображений
            // seed обеспечивает одинаковое изображение для одного и того же seed
            return `https://picsum.photos/seed/${seedStr}/${width}/${height}?grayscale`

        case AVATAR_SOURCES.UNSPLASH:
            // Unsplash - стоковые фотографии высокого качества
            // &sig=${seedStr} добавляет подпись для кэширования
            return `https://source.unsplash.com/random/${width}x${height}/?person,portrait&sig=${seedStr}`

        case AVATAR_SOURCES.DICEBEAR:
            // DiceBear - генератор стилизованных аватаров
            // SVG векторные изображения, хорошо масштабируются
            return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedStr}&size=${width}`

        case AVATAR_SOURCES.RANDOM_USER:
            // Random User - реалистичные фотографии людей
            // Детерминированный выбор фотографии на основе хэша от seed
            let hash = 0
            for (let i = 0; i < seedStr.length; i++) {
                // Простой хэш-алгоритм для преобразования строки в число
                hash =
                    seedStr.charCodeAt(i) +
                    ((hash << 5) - hash)
            }
            const index = Math.abs(hash) % 100 // Индекс от 0 до 99
            const gender = hash % 2 === 0 ? 'men' : 'women' // Определяем пол по четности хэша
            return `https://randomuser.me/api/portraits/${gender}/${index}.jpg`

        case AVATAR_SOURCES.FLICKR:
            // Lorem Flickr - тематические изображения
            const categories = [
                'person',
                'portrait',
                'face',
                'people',
            ]
            const category =
                categories[
                    seedStr.length % categories.length
                ] // Выбор категории по длине seed
            return `https://loremflickr.com/${width}/${height}/${category}`

        case AVATAR_SOURCES.ROBOHASH:
            // RoboHash - генерация уникальных роботов/монстров
            return `https://robohash.org/${seedStr}?size=${width}x${height}`

        case AVATAR_SOURCES.PLACEHOLDER:
            // Placeholder - простые цветные плейсхолдеры с текстом
            const colors = [
                '3498db',
                '2ecc71',
                'e74c3c',
                'f39c12',
                '9b59b6',
            ]
            const color =
                colors[seedStr.length % colors.length] // Выбор цвета по длине seed
            const text = seedStr.charAt(0).toUpperCase() // Первая буква seed как текст
            return `https://via.placeholder.com/${width}x${height}/${color}/ffffff?text=${text}`

        case AVATAR_SOURCES.UI_FACES:
            // Генерируем детерминированный ID от 1 до 70
            let facesHash = 0
            for (let i = 0; i < seedStr.length; i++) {
                facesHash =
                    (facesHash << 5) -
                    facesHash +
                    seedStr.charCodeAt(i)
                facesHash = facesHash & facesHash
            }
            const faceId = (Math.abs(facesHash) % 70) + 1
            return `https://xsgames.co/randomusers/assets/avatars/${gender}/${faceId.toString().padStart(2, '0')}.jpg`

        default:
            // По умолчанию используем Picsum
            // Fallback на случай неизвестного источника
            return '/images/chatHeader/userAvatar.svg'
    }
}

/**
 * Простая функция для проверки, работает ли источник
 * Выполняет HEAD запрос к тестовому URL для проверки доступности
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
        // HEAD запрос проверяет доступность без загрузки всего изображения
        const response = await fetch(testUrl, {
            method: 'HEAD',
        })
        return response.ok // true если статус 200-299
    } catch {
        return false // Если fetch выбросил ошибку (нет сети, CORS и т.д.)
    }
}

/**
 * Показывает все источники и их статус (для отладки)
 * Асинхронно проверяет все источники и логирует результаты
 */
export const showAllSourcesStatus =
    async (): Promise<void> => {
        console.log(
            'Проверяем доступность источников аватарок:',
        )

        // Проходим по всем источникам и проверяем их доступность
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
