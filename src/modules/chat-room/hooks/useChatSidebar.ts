import { useState, useCallback } from 'react'
import { Contact } from '@shared/hooks/useContactData'

/**
 * Хук управления сайдбаром контактной информации.
 *
 * Контролирует открытие/закрытие правой боковой панели
 * с профилем собеседника и действиями над чатом
 * (очистка чата, настройка уведомлений).
 *
 * Выделен из ChatRoom для изоляции UI-состояния сайдбара
 * от основной логики чата.
 */
export function useChatSidebar() {
    const [isSidebarOpen, setIsSidebarOpen] =
        useState(false)
    const [sidebarContact, setSidebarContact] =
        useState<Contact | null>(null)

    const handleOpenSidebar = useCallback(
        (contact: Contact) => {
            setSidebarContact(contact)
            setIsSidebarOpen(true)
        },
        [],
    )

    const handleCloseSidebar = useCallback(() => {
        setIsSidebarOpen(false)
    }, [])

    // TODO: подключить реальную очистку чата через API
    const handleClearChat = useCallback(
        (deleteForEveryone: boolean) => {
            console.log('Clear chat', deleteForEveryone)
        },
        [],
    )

    // TODO: подключить реальное переключение уведомлений через API
    const [notificationsEnabled, setNotificationsEnabled] =
        useState(false)

    const handleNotificationsChange = useCallback(
        (enabled: boolean) => {
            setNotificationsEnabled(enabled)
            // здесь можно отправить запрос на сервер
            console.log('Notifications enabled:', enabled)
        },
        [],
    )

    return {
        isSidebarOpen,
        sidebarContact,
        handleOpenSidebar,
        handleCloseSidebar,
        handleClearChat,
        notificationsEnabled,
        handleNotificationsChange,
    }
}
