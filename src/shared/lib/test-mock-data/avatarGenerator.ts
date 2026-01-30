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
    // width/height сохранены для обратной совместимости API — вызывающий код передаёт их
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    width: number = 300,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    height: number = 300,
    source: string = DEFAULT_AVATAR_SOURCE,
): string => {
    // Всегда возвращаем локальную заглушку для безопасности
    // Используем seed для определения типа чата и выбора соответствующей иконки

    const seedStr = String(seed)

    // Определяем тип по seed
    if (seedStr.includes('group_')) {
        return '/images/chatHeader/userAvatar.svg'
    } else if (seedStr.includes('channel_')) {
        return '/images/chatHeader/userAvatar.svg'
    } else if (source === AVATAR_SOURCES.RANDOM_USER) {
        // Только для randomuser.me (если он разрешен в next.config.js)
        try {
            let hash = 0
            for (let i = 0; i < seedStr.length; i++) {
                hash =
                    seedStr.charCodeAt(i) +
                    ((hash << 5) - hash)
            }
            const index = Math.abs(hash) % 100
            const gender = hash % 2 === 0 ? 'men' : 'women'
            return `https://randomuser.me/api/portraits/${gender}/${index}.jpg`
        } catch {
            // Fallback на локальную
            return '/images/chatHeader/userAvatar.svg'
        }
    }

    // Для всех остальных случаев - локальная заглушка
    return '/images/chatHeader/userAvatar.svg'
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
