// src/shared/lib/localStorageGroupMedia.ts
import { MockFile } from '@shared/types/file'

const STORAGE_KEY = 'groups_media'

function loadAllGroupMedia(): Record<
    string,
    { count: number; results: MockFile[] }
> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            if (
                typeof parsed === 'object' &&
                parsed !== null
            ) {
                return parsed
            }
        }
    } catch (error) {
        console.error(
            'Ошибка при чтении медиа групп:',
            error,
        )
    }
    return {}
}

function saveAllGroupMedia(
    data: Record<
        string,
        { count: number; results: MockFile[] }
    >,
): void {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data),
        )
    } catch (error) {
        console.error(
            'Ошибка при сохранении медиа групп:',
            error,
        )
    }
}

export function loadGroupMedia(
    chatUid: string,
): { count: number; results: MockFile[] } | null {
    const all = loadAllGroupMedia()
    return all[chatUid] || null
}

export function saveGroupMedia(
    chatUid: string,
    media: { count: number; results: MockFile[] },
): void {
    const all = loadAllGroupMedia()
    all[chatUid] = media
    saveAllGroupMedia(all)
    console.log(
        `[saveGroupMedia] Сохранено ${media.count} файлов для chatUid ${chatUid}`,
    )
}

export function initGroupMedia(
    chatUid: string,
    mockMedia: MockFile[],
): { count: number; results: MockFile[] } {
    const existing = loadGroupMedia(chatUid)
    if (existing) {
        return existing
    }
    const newMedia = {
        count: mockMedia.length,
        results: mockMedia,
    }
    saveGroupMedia(chatUid, newMedia)
    return newMedia
}
