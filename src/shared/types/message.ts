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
    toUserId: string
    chatKey: string
    content: string
    status: string
    files?: MessageFile[]
    repliedMessages?: RepliedMessage[]
    forwardedMessages?: ForwardedMessage[]
}
