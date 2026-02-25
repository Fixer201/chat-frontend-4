// src/shared/lib/localStorageGroupAudio.ts
import { MockFile } from '@shared/types/file' // Тип для моковых файлов (содержит только url)

// Ключ для хранения в localStorage
const STORAGE_KEY = 'groups_audio'

// Интерфейс записи аудио для группы
export interface GroupAudioEntry {
    chatKey: string // Уникальный ключ чата/группы
    audio: {
        count: number // Количество аудиофайлов
        results: MockFile[] // Массив моковых аудиофайлов
    }
}

// Загружает все аудио из localStorage
function loadAllGroupAudio(): Record<
    string,
    GroupAudioEntry['audio']
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
            'Ошибка при чтении аудио групп:',
            error,
        )
    }
    return {} // Возвращаем пустой объект в случае ошибки
}

// Сохраняет все аудио в localStorage
function saveAllGroupAudio(
    data: Record<string, GroupAudioEntry['audio']>,
): void {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data),
        )
    } catch (error) {
        console.error(
            'Ошибка при сохранении аудио групп:',
            error,
        )
    }
}

// Загружает аудио для конкретной группы по chatUid
export function loadGroupAudio(
    chatUid: string,
): GroupAudioEntry['audio'] | null {
    const all = loadAllGroupAudio()
    return all[chatUid] || null // Возвращаем null, если нет данных
}

// Сохраняет аудио для конкретной группы
export function saveGroupAudio(
    chatUid: string,
    audio: GroupAudioEntry['audio'],
): void {
    const all = loadAllGroupAudio()
    all[chatUid] = audio // Обновляем или добавляем запись
    saveAllGroupAudio(all)
    console.log(
        `[saveGroupAudio] Сохранено ${audio.count} аудиофайлов для chatUid ${chatUid}`,
    )
}

// Инициализирует аудио для группы (если ещё нет данных)
export function initGroupAudio(
    chatUid: string,
    mockAudio: MockFile[], // Моковые данные по умолчанию
): GroupAudioEntry['audio'] {
    const existing = loadGroupAudio(chatUid)
    if (existing) {
        return existing // Если уже есть - возвращаем существующие
    }
    // Если нет - создаём новые
    const newAudio = {
        count: mockAudio.length,
        results: mockAudio,
    }
    saveGroupAudio(chatUid, newAudio)
    return newAudio
}
