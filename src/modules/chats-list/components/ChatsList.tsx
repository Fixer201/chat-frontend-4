'use client'

import { generateLocalMockChatItems } from '@shared/lib/test-mock-data/chat-mock-data'
import { ChatItem } from '@shared/types/chat-from-api'
import { useEffect, useState } from 'react'
import { Avatar } from '@shared/ui/avatar/Avatar'

export default function ChatsList() {
    const [chats, setChats] = useState<ChatItem[]>(
        [],
    )
    useEffect(() => {
        const loadChats =  () => {
            try {
                setChats( generateLocalMockChatItems(15))
            } catch (error) {
                console.log(error)
            }
        }
        loadChats()
    }, [])
    return (
        <div className='overflow-y-scroll grow h-10/12 bg-[#F5F6F8]'>
            <div className="grid grid-cols-1">
            {chats.map((chat) => (
                <Avatar
                    src="/images/chatHeader/userAvatar.svg"
                    name={`${chat.chat.first_name}`}
                    mode="chat"
                    messagePreview={chat.last_message.content}
                    timestamp='ПН'
                    unreadCount={chat.new_message_count}
                    key={chat.id}
                    className='border-b border-[#E4E4E4] bg-[#F5F6F8]'
                />
            ))}
            </div>
        </div>
    )
}
