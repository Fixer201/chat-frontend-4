// src/shared/lib/localStorageGroupParticipants.ts
import { transformListFromApi } from '@shared/lib/transformChatData' // Функция для преобразования данных из API-формата
import { GroupParticipant } from '@shared/types/contact' // Тип участника группы

const STORAGE_KEY = 'groups_participants'

// Интерфейс записи участников для группы
export interface GroupParticipantsEntry {
    chatKey: string // Уникальный ключ чата/группы
    participants: GroupParticipant[] // Массив участников
}

// Нормализует участников: приводит к единому формату (camelCase)
function normalizeParticipants(
    participants: GroupParticipant[],
): GroupParticipant[] {
    if (!participants || participants.length === 0)
        return []

    // Проверяем первого участника: если есть поле isOwner (camelCase) — данные уже нормализованы
    if (participants[0] && 'isOwner' in participants[0]) {
        return participants as GroupParticipant[]
    }

    // Иначе преобразуем из snake_case (из API) в camelCase
    return transformListFromApi(
        participants,
    ) as GroupParticipant[]
}

// Загружает все записи участников групп из localStorage
export function loadAllGroupsParticipants(): GroupParticipantsEntry[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) {
                // Применяем нормализацию к каждой записи
                return parsed.map((entry) => ({
                    ...entry,
                    participants: normalizeParticipants(
                        entry.participants || [],
                    ),
                }))
            } else {
                console.warn(
                    'groups_participants is not an array, resetting',
                )
                localStorage.removeItem(STORAGE_KEY) // Очищаем некорректные данные
            }
        }
    } catch (error) {
        console.error(
            'Ошибка при чтении участников групп:',
            error,
        )
    }
    return [] // Возвращаем пустой массив в случае ошибки
}

// Сохраняет все записи участников групп в localStorage
export function saveAllGroupsParticipants(
    entries: GroupParticipantsEntry[],
): void {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(entries),
        )
    } catch (error) {
        console.error(
            'Ошибка при сохранении участников групп:',
            error,
        )
    }
}

// Находит участников группы по chatKey
export function findGroupParticipantsByChatKey(
    chatKey: string,
): GroupParticipant[] | null {
    const entries = loadAllGroupsParticipants()
    const entry = entries.find((e) => e.chatKey === chatKey)
    return entry ? entry.participants : null
}

// Сохраняет участников для конкретной группы
export function saveGroupParticipants(
    chatKey: string,
    participants: GroupParticipant[],
): void {
    // Применяем нормализацию перед сохранением
    const normalizedParticipants = transformListFromApi(
        participants,
    ) as GroupParticipant[]

    const entries = loadAllGroupsParticipants()
    const index = entries.findIndex(
        (e) => e.chatKey === chatKey,
    )

    if (index !== -1) {
        // Обновляем существующую запись
        entries[index].participants = normalizedParticipants
    } else {
        // Создаём новую запись
        entries.push({
            chatKey,
            participants: normalizedParticipants,
        })
    }

    saveAllGroupsParticipants(entries)
    console.log(
        `[saveGroupParticipants] Сохранено ${normalizedParticipants.length} участников для ключа ${chatKey}`,
    )
}

// Удаляет конкретного участника из группы
export function removeGroupParticipant(
    chatKey: string,
    uid: string,
): void {
    const entries = loadAllGroupsParticipants()
    const entryIndex = entries.findIndex(
        (e) => e.chatKey === chatKey,
    )

    if (entryIndex !== -1) {
        // Фильтруем участников - оставляем всех, кроме удаляемого
        entries[entryIndex].participants = entries[
            entryIndex
        ].participants.filter((p) => p.uid !== uid)

        saveAllGroupsParticipants(entries)
    }
}
