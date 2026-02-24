'use client'
import EmptyChatState from '@modules/chat-room/components/EmptyChatState'
import ContactsList from '@modules/contacts/components/ContactsList'
import { useState } from 'react'
import ChatRoom from '@modules/chat-room/components/ChatRoom'
import { useChats } from '@shared/hooks/useChats'
import toast from 'react-hot-toast'

export default function ContactsPage() {
    const [selectedChatId, setSelectedChatId] = useState<
        number | null
    >(null)
    const { chats, selectChat, createChat } = useChats()
    // Функция для выбора контакта: ищет чат или создаёт новый
    const handleContactSelect = async (userUid: string) => {
        const existingChat = chats.find(
            (chat) => chat.chat.uid === userUid,
        )
        if (existingChat) {
            setSelectedChatId(existingChat.id)
            selectChat(existingChat.id)
        } else {
            try {
                const newChat = await createChat(userUid)
                setSelectedChatId(newChat.chat.id)
                selectChat(newChat.chat.id)
            } catch (error) {
                console.error(
                    'Ошибка создания чата:',
                    error,
                )
                toast.error('Не удалось создать чат')
            }
        }
    }
    //  const router = useRouter()
    //  const handleContactSelect = (userUid: string) => {
    //         router.push(`/chats?contactId=${userUid}`)
    //     }

    const selectedChat = chats.find(
        (chat) => chat.id === selectedChatId,
    )
    return (
        <div
            className={`
              flex h-full w-full gap-2
              md:gap-6
            `}
        >
            {/* Левая колонка - список контактов */}
            <div
                className={`
                  w-full overflow-hidden rounded-md border border-app-divider
                  bg-gray-main
                  md:w-80
                  lg:w-96
                `}
            >
                <ContactsList
                    onContactSelect={handleContactSelect}
                />
            </div>

            {/* Правая колонка - пустой state (скрыт на mobile) */}
            <div
                className={`
                  hidden flex-1 rounded-md border border-app-divider
                  bg-gray-main
                  md:block
                `}
            >
                {selectedChat ? (
                    <ChatRoom
                        chat={selectedChat}
                        onBack={() =>
                            setSelectedChatId(null)
                        } // Сброс выбора при возврате
                    />
                ) : (
                    <EmptyChatState />
                )}
            </div>
        </div>
    )
}
