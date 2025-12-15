'use client'

import { useEffect } from 'react'
import { Avatar } from '@shared/ui/avatar/Avatar'
import { useChats } from '@shared/hooks/useChats'
import { formatLastSeen } from '@shared/lib/formatLastSeen';

export default function ChatsList() {
    const {
        chats,
        loadChats,
  } = useChats();

  useEffect(() => {
    loadChats(15);
  }, [loadChats]);
    return (
        <div className='overflow-y-scroll grow h-10/12 bg-[#F5F6F8]'>
            <div className="grid grid-cols-1">
            {chats.map((chat) => (
                <Avatar
                    src="/images/chatHeader/userAvatar.svg"
                    name={`${chat.chat.firstName} ${chat.chat.lastName}`}
                    mode="chat"
                    messagePreview={chat.lastMessage.content}
                    timestamp={formatLastSeen(chat.lastActivityAt*1000)}
                    unreadCount={chat.newMessageCount}
                    key={chat.id}
                    className='border-b border-[#E4E4E4] bg-[#F5F6F8]'
                />
            ))}
            </div>
        </div>
    )
}
