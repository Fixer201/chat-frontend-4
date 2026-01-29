'use client'

import { Message } from '@shared/types/message'
import { useAppSelector } from '@redux/store'
import { MOCK_CURRENT_USER_ID } from '@shared/mocks/messages'
import SentIcon from '@public/images/messageStatus/sent.svg'
import DeliveredIcon from '@public/images/messageStatus/delivered.svg'
import ReadIcon from '@public/images/messageStatus/read.svg'
import { MessageContextMenu } from './MessageContextMenu'
import { useState } from 'react'

interface MessageItemProps {
    readonly message: Message
    readonly onEdit?: (message: Message) => void
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
    onEdit,
}: MessageItemProps) {
    const currentUser = useAppSelector(
        (state) => state.user.currentUser,
    ) as { id?: string } | null

    // Фоллбэк на моковый ID пока не реализованы контакты на бэкенде
    const currentUserId =
        currentUser?.id || MOCK_CURRENT_USER_ID

    const isOwn = message.from_user == currentUserId
    const readStatus = getReadStatus(message, isOwn)

    const [contextMenuOpen, setContextMenuOpen] =
        useState(false)
    const [contextMenuPosition, setContextMenuPosition] =
        useState({ top: 0, left: 0 })

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return ''
        return new Date(
            timestamp * 1000,
        ).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const handleContextMenu = (
        e: React.MouseEvent<HTMLDivElement>,
    ) => {
        e.preventDefault()
        setContextMenuPosition({
            top: e.clientY,
            left: e.clientX,
        })
        setContextMenuOpen(true)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content)
    }

    const handleEdit = () => {
        onEdit?.(message)
    }

    const handleMenuItemClick = (handler?: () => void) => {
        handler?.()
        setContextMenuOpen(false)
    }

    return (
        <>
            <div
                className={
                    isOwn
                        ? 'flex justify-end'
                        : 'flex justify-start'
                }
            >
                <div
                    onContextMenu={handleContextMenu}
                    style={{
                        maxWidth:
                            'var(--message-max-width)',
                    }}
                    className={
                        isOwn
                            ? `
                              cursor-context-menu rounded-lg bg-teal-secondary
                              px-4 py-2 text-text-black
                            `
                            : `
                              cursor-context-menu rounded-lg bg-message-bg-other
                              px-4 py-2 text-text-black
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
                            {message.updated_at &&
                                message.updated_at !==
                                    message.created_at && (
                                    <span
                                        className={`ml-1 text-xs text-text-gray`}
                                    >
                                        (изменено)
                                    </span>
                                )}
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
            <MessageContextMenu
                open={contextMenuOpen}
                onOpenChange={setContextMenuOpen}
                position={contextMenuPosition}
                isOwnMessage={isOwn}
                onCopy={handleCopy}
                onEdit={isOwn ? handleEdit : undefined}
                onMenuItemClick={handleMenuItemClick}
            />
        </>
    )
}
