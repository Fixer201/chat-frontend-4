import { DEFAULT_AVATAR } from '@shared/config/constants'
import { ChatAvatar } from '@shared/types/chat'

/**
 * Возвращает URL аватара с приоритетом:
 * 1. WebP URL (CDN)
 * 2. Обычный URL (CDN)
 * 3. Локальный WebP файл
 * 4. Локальный файл
 * 5. Placeholder
 */
function getAvatarSrc(chat: ChatAvatar): string {
    const isValidUrl = (url: unknown): url is string =>
        typeof url === 'string' && url.length > 0

    const isRemoteUrl = (url: string) =>
        url.startsWith('http://') ||
        url.startsWith('https://')

    const isLocalPath = (path: unknown): path is string =>
        typeof path === 'string' && path.startsWith('/')

    if (
        isValidUrl(chat.avatarWebpUrl) &&
        isRemoteUrl(chat.avatarWebpUrl)
    )
        return chat.avatarWebpUrl
    if (
        isValidUrl(chat.avatarUrl) &&
        isRemoteUrl(chat.avatarUrl)
    )
        return chat.avatarUrl
    if (isLocalPath(chat.avatarWebp)) return chat.avatarWebp
    if (isLocalPath(chat.avatar)) return chat.avatar

    return DEFAULT_AVATAR
}

export default getAvatarSrc
