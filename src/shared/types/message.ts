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
    created_at?: number // timestamp создания
    updated_at?: number // timestamp обновления
    files?: MessageFile[]
    repliedMessages?: RepliedMessage[]
    forwardedMessages?: ForwardedMessage[]
}
