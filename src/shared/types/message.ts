export type MessageFile = {
    filename: string
    data: string
}

export type RepliedMessage = {
    content: string
}

export type ForwardedMessage = {
    content: string
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
