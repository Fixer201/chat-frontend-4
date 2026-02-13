/**
 * Файловое вложение сообщения — универсальный тип для обоих направлений:
 *
 * **При отправке** (клиент → сервер через WebSocket):
 *   - `filename` — имя файла, выбранного пользователем
 *   - `data` — содержимое файла в формате base64 (без data-URL префикса)
 *   Формируется в SendFileModal.fileToBase64().
 *
 * **При получении** (сервер → клиент через API/WebSocket):
 *   - `file_url` — абсолютный URL для скачивания/предпросмотра оригинала
 *   - `file_webp_url` — URL WebP-версии (для изображений, оптимизация трафика)
 *   - `file_type` — MIME-тип файла (например, 'image/jpeg', 'application/pdf')
 *   - `filename` — извлекается из file_url при нормализации
 *
 * Нормализация (маппинг серверных полей → фронтовые) происходит в:
 *   - useWebSocketChat.normalizeIncomingMessage() — для WS-сообщений
 *   - useMessages.loadMessages() — для REST API-ответов
 */
export type MessageFile = {
    // --- Поля для отправки (base64) ---
    filename?: string
    data?: string

    // --- Поля от сервера (URL + метаданные) ---
    uid?: string
    file_url?: string
    file_webp_url?: string
    file_type?: string

    // --- Кэшированный размер файла (байты) ---
    //
    // API не возвращает размер файла ни через REST, ни через WebSocket.
    // Поэтому размер вычисляется на клиенте из двух источников:
    //
    // 1. **Optimistic-сообщения** — при отправке файла: base64.length × 0.75.
    //    Значение сохраняется здесь и переносится на серверное сообщение
    //    при замене optimistic → confirmed (см. useWebSocketChat onmessage).
    //
    // 2. **История после перезагрузки** — HEAD-запрос к file_url для получения
    //    Content-Length (см. useFileSize в MessageFileAttachment).
    //
    // Если поле отсутствует — UI не показывает строку размера.
    file_size?: number
}

export type RepliedMessage = {
    uid?: string
    content: string
    from_user?: string
    first_name?: string
    last_name?: string
    files_list?: MessageFile[]
}

export type ForwardedMessage = {
    uid?: string
    content: string
    from_user?: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    avatar_webp_url?: string
    files_list?: MessageFile[]
}

export type Message = {
    uid?: string // ID сообщения (приходит от сервера)
    toUserId?: string // кому отправляем (опционально для входящих)
    chatKey: string // ключ чата
    content: string // текст сообщения
    status: string // publish/draft
    from_user?: string // от кого сообщение (приходит от сервера)
    created_at?: number // timestamp создания (unix timestamp в секундах)
    updated_at?: number // timestamp обновления (unix timestamp в секундах)

    // Статусы прочтения (для своих сообщений)
    delivered_at?: number // timestamp доставки (unix timestamp в секундах)
    read_at?: number // timestamp прочтения (unix timestamp в секундах)

    // Вложения и связанные сообщения
    files?: MessageFile[] // прикрепленные файлы
    repliedMessages?: RepliedMessage[] // ответы на другие сообщения
    forwardedMessages?: ForwardedMessage[] // пересланные сообщения
}

/**
 * Файл в ответе сервера (REST API и WebSocket).
 * Отличается от фронтового MessageFile: вместо base64 — URL для скачивания.
 * Маппинг ApiFileItem → MessageFile выполняется в normalizeFileItem().
 */
export interface ApiFileItem {
    id?: number
    uid?: string
    file_url?: string
    file_webp_url?: string
    file_type?: string
    created_at?: number
    updated_at?: number
}

export interface ApiMessage {
    id: number
    uid: string
    from_user: {
        uid: string
        username: string
        nickname: string
        first_name: string
        last_name: string
        avatar_url: string
        avatar_webp_url: string
    }
    to_user: {
        uid: string
        username: string
        nickname: string
        first_name: string
        last_name: string
        avatar_url: string
        avatar_webp_url: string
    }
    content: string
    replied_messages: {
        id: number
        uid: string
        from_user: string
        first_name: string
        last_name: string
        content: string
        files_list: ApiFileItem[]
    }[]
    forwarded_messages: {
        id: number
        uid: string
        from_user: string
        first_name: string
        last_name: string
        content: string
        files_list: ApiFileItem[]
        avatar_webp_url: string
    }[]
    files_list: ApiFileItem[]
    new: boolean
    created_at: number
    updated_at: number
    chat_id: number
    chat_key: string
    message_rtc: number
}

/**
 * Преобразует серверный объект файла (ApiFileItem) в фронтовый (MessageFile).
 *
 * Ключевые маппинги:
 * - `file_url` → сохраняется как есть для скачивания и превью
 * - `filename` → извлекается из URL (последний сегмент пути),
 *   декодируется через decodeURIComponent для кириллических имён
 * - `file_type` → MIME-тип для определения: изображение или документ
 *
 * Используется в:
 * - useWebSocketChat.normalizeIncomingMessage() — для WS-сообщений
 * - useMessages.loadMessages() — для REST API-ответов
 */
export function normalizeFileItem(
    item: ApiFileItem,
): MessageFile {
    // Извлекаем человекочитаемое имя файла из URL.
    // URL может содержать query-параметры (?token=...) и закодированные
    // символы (%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82.pdf → Привет.pdf)
    const urlPath = item.file_url?.split('?')[0] || ''
    const filename =
        decodeURIComponent(
            urlPath.split('/').pop() || '',
        ) || undefined

    return {
        uid: item.uid,
        file_url: item.file_url,
        file_webp_url: item.file_webp_url,
        file_type: item.file_type,
        filename,
    }
}
