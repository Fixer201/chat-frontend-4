import ChatHeader from './ChatHeader'
import MessagesList from './MessagesList'
import MessageComposer from '@modules/message-composer/components/MessageComposer'
import { ChatItem } from '@shared/types/chat'

export default function ChatRoom({
    chat,
    onBack,
}: Readonly<{
    chat: ChatItem
    onBack?: () => void
}>) {
    return (
        <div className="flex h-full flex-col rounded-md bg-gray-light">
            <ChatHeader
                chat={chat || null}
                onBack={onBack}
            />
            <div className="flex-1 overflow-y-auto">
                <MessagesList chatKey={chat.chatKey} />
            </div>

            <MessageComposer
                toUserId={chat.chat.uid}
                chatKey={chat.chatKey}
            />
        </div>
    )
}
