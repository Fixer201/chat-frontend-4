import {
    Message,
    MessageFile,
    normalizeFileItem,
    RepliedMessage,
    ForwardedMessage,
} from '@shared/types/message'
import {
    EMPTY_REPLIED,
    EMPTY_FORWARDED,
    EMPTY_FILES,
} from './constants'

/**
 * Нормализует сырой WS payload в объект Message.
 *
 * Входит: сырой `data` из `JSON.parse(event.data)` или вложенный `data.message`/`data.object`
 * Выходит: нормализованный `Message` или `null`
 *
 * Чистая функция, нет React-зависимостей — легко тестируется.
 */
export function normalizeIncomingMessage(
    payload: unknown,
): Message | null {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const data = payload as Record<string, unknown>
    const messageData =
        (data.message as
            | Record<string, unknown>
            | undefined) ??
        (data.object as
            | Record<string, unknown>
            | undefined) ??
        data

    const chatKey = messageData.chat_key
    const content = messageData.content

    if (
        typeof chatKey !== 'string' ||
        typeof content !== 'string'
    ) {
        return null
    }

    const normalized: Message = {
        uid: messageData.uid as string | undefined,
        chatKey,
        content,
        status: 'publish',
        from_user:
            (
                messageData.from_user as
                    | { uid?: string }
                    | undefined
            )?.uid ??
            (messageData.from_user as string | undefined),
        toUserId:
            (
                messageData.to_user as
                    | { uid?: string }
                    | undefined
            )?.uid ??
            (messageData.to_user_uid as string | undefined),
        created_at: messageData.created_at as
            | number
            | undefined,
        updated_at: messageData.updated_at as
            | number
            | undefined,
        delivered_at: messageData.created_at as
            | number
            | undefined,
        read_at:
            messageData.new === true
                ? undefined
                : (messageData.created_at as
                      | number
                      | undefined),
        files: (() => {
            const rawFiles = messageData.files_list as
                | Record<string, unknown>[]
                | undefined
            if (rawFiles?.length)
                return rawFiles.map((f) =>
                    normalizeFileItem(
                        f as Parameters<
                            typeof normalizeFileItem
                        >[0],
                    ),
                )
            return (
                (messageData.files as
                    | MessageFile[]
                    | undefined) ?? EMPTY_FILES
            )
        })(),
        repliedMessages: (() => {
            const rawReplied =
                (messageData.replied_messages ??
                    messageData.repliedMessages) as
                    | Record<string, unknown>[]
                    | undefined
            if (!rawReplied?.length) return EMPTY_REPLIED
            return rawReplied.map(
                (
                    r: Record<string, unknown>,
                ): RepliedMessage => ({
                    uid: r.uid as string | undefined,
                    content: (r.content as string) || '',
                    from_user: r.from_user as
                        | string
                        | undefined,
                    first_name: r.first_name as
                        | string
                        | undefined,
                    last_name: r.last_name as
                        | string
                        | undefined,
                    files_list: (
                        r.files_list as
                            | Record<string, unknown>[]
                            | undefined
                    )?.map((f) =>
                        normalizeFileItem(
                            f as Parameters<
                                typeof normalizeFileItem
                            >[0],
                        ),
                    ),
                }),
            )
        })(),
        forwardedMessages: (() => {
            const rawForwarded =
                (messageData.forwarded_messages ??
                    messageData.forwardedMessages) as
                    | Record<string, unknown>[]
                    | undefined
            if (!rawForwarded?.length)
                return EMPTY_FORWARDED
            return rawForwarded.map(
                (
                    f: Record<string, unknown>,
                ): ForwardedMessage => ({
                    uid: f.uid as string | undefined,
                    content: (f.content as string) || '',
                    from_user: f.from_user as
                        | string
                        | undefined,
                    first_name: f.first_name as
                        | string
                        | undefined,
                    last_name: f.last_name as
                        | string
                        | undefined,
                    avatar_url: f.avatar_url as
                        | string
                        | undefined,
                    avatar_webp_url: f.avatar_webp_url as
                        | string
                        | undefined,
                    files_list: (
                        f.files_list as
                            | Record<string, unknown>[]
                            | undefined
                    )?.map((fi) =>
                        normalizeFileItem(
                            fi as Parameters<
                                typeof normalizeFileItem
                            >[0],
                        ),
                    ),
                }),
            )
        })(),
    }

    return normalized
}
