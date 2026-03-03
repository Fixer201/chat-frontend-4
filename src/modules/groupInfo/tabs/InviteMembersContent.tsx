// InviteMembersContent.tsx
'use client'

import { Button } from '@shared/ui/button/Button'
import ContactsListInvitation from '@modules/contacts/components/ContactsListInvitation' // Список контактов для приглашения
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { setContacts } from '@redux/slices/contactsSlice'
import {
    Contact, // Тип контакта
} from '@shared/types/contact'
import type { Participant } from '@shared/types/chat'

// Интерфейс пропсов
interface InviteMembersContentProps {
    groupId?: string // ID группы (опционально)
    currentParticipants: Participant[] // Текущие участники группы
    onInvite?: (selectedContacts: Contact[]) => void // Функция приглашения
    onCancel?: () => void // Функция отмены
    isInviting?: boolean // Флаг процесса приглашения
    error?: string | null // Текст ошибки
}

export default function InviteMembersContent({
    groupId,
    currentParticipants,
    onInvite,
    onCancel,
    isInviting = false,
    error = null,
}: InviteMembersContentProps) {
    // Состояние: ID выбранных контактов
    const [selectedContactIds, setSelectedContactIds] =
        useState<string[]>([])

    const dispatch = useDispatch()

    // Получаем данные из Redux
    const selectedUid = useSelector(
        (state: RootState) => state.SelectedContactTemp.uid, // Выбранный контакт
    )
    const allContactsList = useSelector(
        (state: RootState) => state.contactsTemp.list, // Все контакты пользователя
    )

    // Фильтруем контакты - убираем тех, кто уже в группе
    const currentParticipantIds = currentParticipants.map(
        (p) => p.uid,
    )
    const availableContacts = allContactsList.filter(
        (contact) =>
            !currentParticipantIds.includes(contact.uid), // Оставляем только не в группе
    )

    // Обработчик выбора/снятия контакта
    const handleSelectContact = (uid: string) => {
        setSelectedContactIds(
            (prev) =>
                prev.includes(uid)
                    ? prev.filter((id) => id !== uid) // Убираем, если уже выбран
                    : [...prev, uid], // Добавляем, если не выбран
        )
    }

    // Получаем полные объекты выбранных контактов
    const selectedContacts = availableContacts.filter(
        (contact) =>
            selectedContactIds.includes(contact.uid),
    )

    // Обработчик установки выбранного контакта (для Redux)
    const handleSetSelectedContact = (uid: string) => {
        dispatch(setContacts(uid))
    }

    // Обработчик клика по кнопке приглашения
    const handleInviteClick = () => {
        if (onInvite && selectedContacts.length > 0) {
            onInvite(selectedContacts) // Вызываем внешний обработчик с выбранными контактами
        }
    }

    return (
        <>
            {/* Отображение ошибки (если есть) */}
            {error && (
                <div
                    className={`
                      mx-4 mt-4 mb-4 rounded-md bg-system-red-surface p-3
                    `}
                >
                    <p className="text-sm text-system-red">
                        {error}
                    </p>
                </div>
            )}

            {/* Список контактов для приглашения */}
            <div className="flex-1 overflow-hidden">
                <ContactsListInvitation
                    selectedContacts={selectedContactIds} // Выбранные контакты
                    handleSelectContact={
                        handleSelectContact // Обработчик выбора
                    }
                    selectedUid={selectedUid} // Выбранный в Redux контакт
                    contactsList={availableContacts} // Доступные контакты
                    handleSetSelectedContact={
                        handleSetSelectedContact // Установка выбранного в Redux
                    }
                />
            </div>

            {/* Кнопка приглашения - фиксированная внизу */}
            <div
                className={`
                  sticky bottom-0 flex shrink-0 items-center justify-center
                  gap-2 border-t border-app-divider bg-gray-main px-4 pt-4 pb-4
                `}
            >
                <Button
                    onClick={handleInviteClick}
                    disabled={
                        selectedContacts.length === 0 || // Нет выбранных контактов
                        isInviting // Или уже идет приглашение
                    }
                    variant="solid"
                    size="md"
                    className={`
                      h-14 w-full max-w-82 rounded-md
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                >
                    {isInviting ? (
                        // Состояние загрузки со спиннером
                        <span className="flex items-center gap-2">
                            <svg
                                className="h-5 w-5 animate-spin"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                            Приглашение...
                        </span>
                    ) : (
                        // Обычное состояние
                        <span className="text-base font-medium">
                            Пригласить в группу
                        </span>
                    )}
                </Button>
            </div>
        </>
    )
}
