// src/shared/lib/localStorageChats.ts
import { ApiChatItem } from '@shared/types/chat'
import { generateLocalMockChatItems } from './test-mock-data/chat-mock-data'

const STORAGE_KEY = 'chats_cache'

/**
 * Загружает массив чатов из localStorage
 * @returns {ApiChatItem[] | null} массив чатов или null, если данных нет
 */
export function loadChatsFromStorage():
    | ApiChatItem[]
    | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            // Простейшая проверка, что это массив
            if (Array.isArray(parsed)) {
                return parsed as ApiChatItem[]
            }
        }
    } catch (error) {
        console.error(
            'Ошибка при чтении чатов из localStorage:',
            error,
        )
    }
    return null
}

/**
 * Сохраняет массив чатов в localStorage
 * @param chats массив чатов для сохранения
 */
export function saveChatsToStorage(
    chats: ApiChatItem[],
): void {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(chats),
        )
    } catch (error) {
        console.error(
            'Ошибка при сохранении чатов в localStorage:',
            error,
        )
    }
}

/**
 * Генерирует моковые чаты, сохраняет их в localStorage и возвращает
 * @param count количество чатов для генерации
 * @returns сгенерированный массив чатов
 */
export function generateAndCacheChats(
    count: number,
): ApiChatItem[] {
    const mockChats = generateLocalMockChatItems(count)
    saveChatsToStorage(mockChats)
    return mockChats
}

/**
 * Добавляет новый чат в существующий список в localStorage
 * @param newChat новый чат (ApiChatItem)
 */
export function addChatToStorage(
    newChat: ApiChatItem,
): void {
    const existing = loadChatsFromStorage() || []
    // Проверяем, нет ли уже чата с таким id (на всякий случай)
    const exists = existing.some(
        (chat) => chat.id === newChat.id,
    )
    if (!exists) {
        existing.unshift(newChat) // добавляем в начало, как обычно в мессенджерах
        saveChatsToStorage(existing)
    }
}
/**
 * Получает чат по ID из localStorage
 * @param id идентификатор чата
 * @returns ApiChatItem или null, если не найден
 */
export function getChatByIdFromStorage(
    id: number,
): ApiChatItem | null {
    const chats = loadChatsFromStorage()
    if (!chats) return null
    return chats.find((chat) => chat.id === id) || null
}
