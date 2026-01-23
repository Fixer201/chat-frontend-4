'use client'

import { Message } from '@shared/types/message'
import { useAppSelector } from '@redux/store'
import { MOCK_CURRENT_USER_ID } from '@shared/mocks/messages'
import SentIcon from '@public/images/messageStatus/sent.svg'
import DeliveredIcon from '@public/images/messageStatus/delivered.svg'
import ReadIcon from '@public/images/messageStatus/read.svg'

interface MessageItemProps {
    readonly message: Message
}

type ReadStatus = 'sent' | 'delivered' | 'read'

function getReadStatus(
    message: Message,
    isOwn: boolean,
): ReadStatus | null {
    if (!isOwn) return null

    if (message.read_at) return 'read'
    if (message.delivered_at) return 'delivered'

    return 'sent'
}

function ReadCheckmark({
    status,
}: Readonly<{
    status: ReadStatus | null
}>) {
    if (!status) return null

    if (status === 'sent') {
        return (
            <SentIcon
                width={18}
                height={16}
                className="fill-text-gray"
            />
        )
    }

    if (status === 'delivered') {
        return (
            <DeliveredIcon
                width={18}
                height={12}
                className="fill-text-gray"
            />
        )
    }

    // Статус 'read' отображается акцентным цветом
    return (
        <ReadIcon
            width={18}
            height={11}
            className="fill-accent-violet-primary"
        />
    )
}

export default function MessageItem({
    message,
}: MessageItemProps) {
    const currentUser = useAppSelector(
        (state) => state.user.currentUser,
    ) as { id?: string } | null

    // Фоллбэк на моковый ID пока не реализованы контакты на бэкенде
    const currentUserId =
        currentUser?.id || MOCK_CURRENT_USER_ID

    const isOwn = message.from_user == currentUserId
    const readStatus = getReadStatus(message, isOwn)

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return ''
        return new Date(
            timestamp * 1000,
        ).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div
            className={
                isOwn
                    ? 'flex justify-end'
                    : 'flex justify-start'
            }
        >
            <div
                style={{
                    maxWidth: 'var(--message-max-width)',
                }}
                className={
                    isOwn
                        ? `
                          rounded-lg bg-teal-secondary px-4 py-2 text-text-black
                        `
                        : `
                          rounded-lg bg-message-bg-other px-4 py-2
                          text-text-black
                        `
                }
            >
                <div className="flex items-end justify-between gap-2">
                    <div
                        className={`
                          text-base font-normal wrap-break-word
                          whitespace-pre-wrap
                        `}
                    >
                        {message.content}
                    </div>
                    {message.created_at && (
                        <div
                            className={`
                              flex shrink-0 items-center gap-1 text-sm
                              whitespace-nowrap text-text-gray
                            `}
                        >
                            <span>
                                {formatTime(
                                    message.created_at,
                                )}
                            </span>
                            <ReadCheckmark
                                status={readStatus}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
