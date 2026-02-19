// src/shared/lib/localStorageGroupParticipants.ts
import { GroupParticipant } from '@shared/types/contact'

const STORAGE_KEY = 'groups_participants'

export interface GroupParticipantsEntry {
    chatKey: string
    participants: GroupParticipant[]
}

export function loadAllGroupsParticipants(): GroupParticipantsEntry[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            // Проверяем, что parsed - массив
            if (Array.isArray(parsed)) {
                return parsed
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
    const entries = loadAllGroupsParticipants()
    const index = entries.findIndex(
        (e) => e.chatKey === chatKey,
    )
    if (index !== -1) {
        entries[index].participants = participants
    } else {
        entries.push({ chatKey, participants })
    }
    saveAllGroupsParticipants(entries)
    console.log(
        `[saveGroupParticipants] Сохранено ${participants.length} участников для ключа ${chatKey}`,
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
