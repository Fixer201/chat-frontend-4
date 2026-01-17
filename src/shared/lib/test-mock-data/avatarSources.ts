// Константы и утилиты для работы с источниками аватарок
/**
 * Константы с источниками изображений
 * Каждый источник имеет уникальный ключ, название и функцию генерации URL
 */

// Объект с источниками аватарок
export const AVATAR_SOURCES = {
    PISSUM: 'picsum',
    UNSPLASH: 'unsplash',
    DICEBEAR: 'dicebear',
    RANDOM_USER: 'randomuser',
    FLICKR: 'flickr',
    ROBOHASH: 'robohash',
    PLACEHOLDER: 'placeholder',
} as const

// Тип для источника аватарки
export type AvatarSource = keyof typeof AVATAR_SOURCES

// Описания источников для отображения пользователю
export const SOURCE_DESCRIPTIONS = {
    [AVATAR_SOURCES.PISSUM]:
        'Picsum Photos - случайные фото',
    [AVATAR_SOURCES.UNSPLASH]:
        'Unsplash - качественные стоковые фото',
    [AVATAR_SOURCES.DICEBEAR]:
        'DiceBear - стилизованные аватары',
    [AVATAR_SOURCES.RANDOM_USER]:
        'Random User - фото людей',
    [AVATAR_SOURCES.FLICKR]:
        'Lorem Flickr - тематические фото',
    [AVATAR_SOURCES.ROBOHASH]:
        'RoboHash - уникальные роботы',
    [AVATAR_SOURCES.PLACEHOLDER]:
        'Placeholder - цветные плейсхолдеры',
}

// Источник по умолчанию
export const DEFAULT_AVATAR_SOURCE = AVATAR_SOURCES.PISSUM
