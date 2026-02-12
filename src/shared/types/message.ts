export type MessageFile = {
    filename: string
    data: string
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
        files_list: MessageFile[]
    }[]
    forwarded_messages: {
        id: number
        uid: string
        from_user: string
        first_name: string
        last_name: string
        content: string
        files_list: MessageFile[]
        avatar_webp_url: string
    }[]
    files_list: MessageFile[]
    new: boolean
    created_at: number
    updated_at: number
    chat_id: number
    chat_key: string
    message_rtc: number
}
