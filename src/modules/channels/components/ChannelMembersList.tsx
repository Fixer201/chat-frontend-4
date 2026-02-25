// src/modules/chat-room/components/ChannelMembersList.tsx
'use client'

import { Button } from '@shared/ui/button/Button'
import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import ContactsListInvitation from '@modules/contacts/components/ContactsListInvitation'
import { cn } from '@shared/lib/utils'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { setContacts } from '@redux/slices/contactsSlice'
import { Contact } from '@shared/types/contact'
import { onNextProps } from '@shared/types/createGroup'

// Интерфейс пропсов компонента ChannelMembersList
interface ChannelMembersListProps {
    channelData: onNextProps
    onBack: () => void
    onFinish: (selectedContacts: Contact[]) => void
    isCreating?: boolean
    error?: string | null
}

// Компонент для выбора участников при создании канала
export default function ChannelMembersList({
    channelData,
    onBack,
    onFinish,
    isCreating = false,
    error = null,
}: ChannelMembersListProps) {
    // Состояние для хранения ID выбранных контактов
    const [selectedContactIds, setSelectedContactIds] =
        useState<string[]>([])

    const dispatch = useDispatch()

    // Получение данных из Redux store
    const selectedUid = useSelector(
        (state: RootState) => state.SelectedContactTemp.uid,
    )
    const contactsList = useSelector(
        (state: RootState) => state.contactsTemp.list,
    )

    // Обработчик выбора/отмены выбора контакта
    const handleSelectContact = (uid: string) => {
        setSelectedContactIds((prev) =>
            prev.includes(uid)
                ? prev.filter((id) => id !== uid)
                : [...prev, uid],
        )
    }

    // Фильтрация выбранных контактов по их ID
    const selectedContacts = contactsList.filter(
        (contact) =>
            selectedContactIds.includes(contact.uid),
    )

    const { name } = channelData

    // Обработчик установки выбранного контакта в Redux
    const handleSetSelectedContact = (uid: string) => {
        dispatch(setContacts(uid))
    }

    // Обработчик завершения выбора участников
    const handleFinishClick = () => {
        onFinish(selectedContacts)
    }

    return (
        <div className="flex h-full min-h-0 flex-col rounded-md bg-gray-main">
            {/* Шапка с кнопкой назад и заголовком */}
            <div
                className={`
                  flex items-center justify-start gap-3 rounded-t-md border-b
                  border-app-divider bg-gray-main px-6 py-4
                `}
            >
                <Button
                    onClick={onBack}
                    aria-label="Назад"
                    variant="ghost"
                    size="sm"
                    className={`
                      flex items-center justify-center rounded-full
                      text-text-black transition-colors
                      hover:bg-accent-violet-ultra-light
                    `}
                >
                    <BackIcon className="mx-1 cursor-pointer" />
                </Button>
                <h2
                    className={`
                      text-lg font-medium tracking-extra-tight text-text-black
                    `}
                >
                    Пригласить участников
                </h2>
            </div>

            {/* Отображение ошибки создания канала */}
            {error && (
                <div className="mx-4 mt-4 rounded-md bg-system-red-surface p-3">
                    <p className="text-sm text-system-red">
                        {error}
                    </p>
                </div>
            )}

            {/* Список контактов для выбора участников */}
            <div
                className={cn(
                    `
                      min-h-0 w-full flex-1 rounded-md border border-app-divider
                      bg-gray-main
                      md:w-80
                      lg:w-96
                    `,
                    'max-h-(--screen-height-list)',
                )}
            >
                {/* Компонент списка контактов с возможностью выбора */}
                <ContactsListInvitation
                    selectedContacts={selectedContactIds}
                    handleSelectContact={
                        handleSelectContact
                    }
                    selectedUid={selectedUid}
                    contactsList={contactsList}
                    handleSetSelectedContact={
                        handleSetSelectedContact
                    }
                />
            </div>

            {/* Кнопка завершения выбора участников и создания канала */}
            <div className="flex items-center justify-center px-4 pt-4 pb-8">
                <Button
                    onClick={handleFinishClick}
                    disabled={!name.trim() || isCreating}
                    variant="solid"
                    size="md"
                    className={`
                      h-14 w-full max-w-82 rounded-md
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                >
                    {isCreating ? (
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
                            Создание...
                        </span>
                    ) : (
                        <span className="text-base font-medium">
                            Создать канал
                        </span>
                    )}
                </Button>
            </div>
        </div>
    )
}
