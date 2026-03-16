import { useState, useCallback, useMemo } from 'react'
import { Contact } from '@shared/hooks/useContactData'
import { ChatItem } from '@shared/types/chat'

export function useChatSidebar(chat: ChatItem) {
    const [isSidebarOpen, setIsSidebarOpen] =
        useState(false)
    const [notificationsEnabled, setNotificationsEnabled] =
        useState(false)

    // Преобразуем данные чата в объект контакта (мемоизировано)
    const contactFromChat = useMemo((): Contact | null => {
        if (chat.chatType !== 'chat') return null
        return {
            uid: chat.chat.uid,
            firstName: chat.chat.firstName,
            lastName: chat.chat.lastName,
            nickname: chat.chat.nickname,
            avatar: chat.chat.avatar,
            avatarUrl: chat.chat.avatarUrl,
        } as Contact
    }, [chat])

    // Обновляем контакт в сайдбаре при смене чата (только если сайдбар открыт)
    const sidebarContact = isSidebarOpen
        ? contactFromChat
        : null

    const handleOpenSidebar = useCallback(() => {
        setIsSidebarOpen(true)
    }, [])

    const handleCloseSidebar = useCallback(() => {
        setIsSidebarOpen(false)
    }, [])

    const handleClearChat = useCallback(
        (deleteForEveryone: boolean) => {
            console.log('Clear chat', deleteForEveryone)
        },
        [],
    )

    const handleNotificationsChange = useCallback(
        (enabled: boolean) => {
            setNotificationsEnabled(enabled)
            console.log('Notifications enabled:', enabled)
        },
        [],
    )

    return {
        isSidebarOpen,
        sidebarContact,
        notificationsEnabled,
        handleOpenSidebar,
        handleCloseSidebar,
        handleClearChat,
        handleNotificationsChange,
    }
}
