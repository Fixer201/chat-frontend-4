import { transformListFromApi } from '@shared/lib/transformChatData'
import { GroupParticipant } from '@shared/types/contact'

const STORAGE_KEY = 'groups_participants'

export interface GroupParticipantsEntry {
    chatKey: string
    participants: GroupParticipant[]
}

// Нормализует участников: если уже в camelCase (есть поле isOwner) — оставляет как есть,
// иначе преобразует из snake_case в camelCase
function normalizeParticipants(
    participants: GroupParticipant[],
): GroupParticipant[] {
    if (!participants || participants.length === 0)
        return []
    // Проверяем первого участника: если есть поле isOwner (camelCase) — данные уже нормализованы
    if (participants[0] && 'isOwner' in participants[0]) {
        return participants as GroupParticipant[]
    }
    // Иначе преобразуем из snake_case
    return transformListFromApi(
        participants,
    ) as GroupParticipant[]
}

export function loadAllGroupsParticipants(): GroupParticipantsEntry[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) {
                // Применяем нормализацию к каждому entry
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
                localStorage.removeItem(STORAGE_KEY)
            }
        }
    } catch (error) {
        console.error(
            'Ошибка при чтении участников групп:',
            error,
        )
    }
    return []
}

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

export function findGroupParticipantsByChatKey(
    chatKey: string,
): GroupParticipant[] | null {
    const entries = loadAllGroupsParticipants()
    const entry = entries.find((e) => e.chatKey === chatKey)
    return entry ? entry.participants : null
}

export function saveGroupParticipants(
    chatKey: string,
    participants: GroupParticipant[],
): void {
    // Применяем нормализацию перед сохранением, чтобы в хранилище был единый формат (camelCase)
    const normalizedParticipants = transformListFromApi(
        participants,
    ) as GroupParticipant[]
    const entries = loadAllGroupsParticipants()
    const index = entries.findIndex(
        (e) => e.chatKey === chatKey,
    )
    if (index !== -1) {
        entries[index].participants = normalizedParticipants
    } else {
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

export function removeGroupParticipant(
    chatKey: string,
    uid: string,
): void {
    const entries = loadAllGroupsParticipants()
    const entryIndex = entries.findIndex(
        (e) => e.chatKey === chatKey,
    )
    if (entryIndex !== -1) {
        entries[entryIndex].participants = entries[
            entryIndex
        ].participants.filter((p) => p.uid !== uid)
        saveAllGroupsParticipants(entries)
    }
}
