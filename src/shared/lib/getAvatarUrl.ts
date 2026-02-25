export function getAvatarUrl(src?: string | null): string {
    if (!src) return '/images/chatHeader/userAvatar.svg'
    if (
        src.startsWith('http://') ||
        src.startsWith('https://') ||
        src.startsWith('/')
    ) {
        return src
    }
    return `/images/chatHeader/${src}`
}

import { DEFAULT_AVATAR } from '@shared/config/constants'
import { ChatAvatar } from '@shared/types/chat'

/**
 * Возвращает URL аватара с приоритетом:
 * 1. avatarWebpUrl (если задана и не пустая)
 * 2. avatarUrl (если задана и не пустая)
 * 3. Локальный WebP файл (avatarWebp)
 * 4. Локальный файл (avatar)
 * 5. Placeholder
 */
function getAvatarSrc(chat: ChatAvatar): string {
    const isValidString = (s: unknown): s is string =>
        typeof s === 'string' && s.length > 0

    const isLocalPath = (path: unknown): path is string =>
        typeof path === 'string' && path.startsWith('/')

    // Принимаем любые непустые строки для CDN/Blob ссылок
    if (isValidString(chat.avatarWebpUrl))
        return chat.avatarWebpUrl
    if (isValidString(chat.avatarUrl)) return chat.avatarUrl

    // Для локальных путей проверяем, что они начинаются с '/'
    if (isLocalPath(chat.avatarWebp)) return chat.avatarWebp
    if (isLocalPath(chat.avatar)) return chat.avatar

    return DEFAULT_AVATAR
}

export default getAvatarSrc
