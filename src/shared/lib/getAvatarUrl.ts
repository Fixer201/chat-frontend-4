// src/shared/lib/getAvatarUrl.ts
export function getAvatarUrl(src?: string | null): string {
    if (!src) return '/images/chatHeader/userAvatar.svg'
    // Если src уже является абсолютным URL или начинается с '/', возвращаем как есть
    if (
        src.startsWith('http://') ||
        src.startsWith('https://') ||
        src.startsWith('/')
    ) {
        return src
    }
    // Иначе добавляем базовый путь к папке с аватарками
    // В проекте аватарки лежат в /images/chatHeader/
    return `/images/chatHeader/${src}`
}
