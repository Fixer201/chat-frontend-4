'use client'

import ChatHeader from './ChatHeader'
import MessagesList from './MessagesList'
import MessageComposer from '@modules/message-composer/components/MessageComposer'
import { ChatItem } from '@shared/types/chat'
import { Message } from '@shared/types/message'
import { useState } from 'react'

export default function ChatRoom({
    chat,
    onBack,
}: Readonly<{
    chat: ChatItem
    onBack?: () => void
}>) {
    const [editingMessage, setEditingMessage] =
        useState<Message | null>(null)

    const handleEditMessage = (message: Message) => {
        setEditingMessage(message)
    }

    const handleCancelEdit = () => {
        setEditingMessage(null)
    }

    return (
        <div className="flex h-full flex-col rounded-md bg-gray-light">
            <ChatHeader
                chat={chat || null}
                onBack={onBack}
            />
            <div className="flex-1 overflow-y-auto">
                <MessagesList
                    chatKey={chat.chatKey}
                    onEditMessage={handleEditMessage}
                />
            </div>

            <MessageComposer
                key={editingMessage?.uid ?? 'new'}
                toUserId={chat.chat.uid}
                chatKey={chat.chatKey}
                editingMessage={editingMessage}
                onCancelEdit={handleCancelEdit}
            />
        </div>
    )
}
