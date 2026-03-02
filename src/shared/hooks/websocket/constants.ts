import {
    RepliedMessage,
    ForwardedMessage,
    MessageFile,
} from '@shared/types/message'

// Константы пустых массивов на уровне модуля — переиспользуются
// между вызовами normalizeIncomingMessage, избегая аллокации
// нового пустого массива на каждое входящее WS-сообщение
export const EMPTY_REPLIED: RepliedMessage[] = []
export const EMPTY_FORWARDED: ForwardedMessage[] = []
export const EMPTY_FILES: MessageFile[] = []

export const MAX_RECONNECT_ATTEMPTS = 3
export const LOCAL_CHATS_STORAGE_KEY = 'localChats'
export const LOCAL_CHAT_ID_THRESHOLD = 1_000_000_000_000
// Интервал повторного запроса статусов (30 сек)
export const STATUS_POLL_INTERVAL_MS = 30_000

// TODO: Временный флаг для переключения между моковыми и реальными данными
// Удалить после реализации контактов на бэкенде
export const USE_MOCK = false
