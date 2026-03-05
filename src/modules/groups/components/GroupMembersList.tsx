'use client'

import { Button } from '@shared/ui/button/Button'
import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import ContactsListInvitation from '@modules/contacts/components/ContactsListInvitation'
import { cn } from '@shared/lib/utils'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@redux/store'
import { setSelectedContact } from '@redux/slices/selectedContactSlice'
import { setContacts } from '@redux/slices/contactsSlice' // <-- импортируем экшен
import { Contact, ApiContact } from '@shared/types/contact' // <-- ApiContact для типизации ответа
import { onNextProps } from '@shared/types/createGroup'
import { useApiFetcher } from '@shared/hooks/useApiFetcher' // <-- хук для запросов

interface GroupMembersListProps {
    groupData: onNextProps
    onBack: () => void
    onFinish: (selectedContacts: Contact[]) => void
    isCreating?: boolean
    error?: string | null
}

export default function GroupMembersList({
    groupData,
    onBack,
    onFinish,
    isCreating = false,
    error = null,
}: GroupMembersListProps) {
    const [selectedContactIds, setSelectedContactIds] =
        useState<string[]>([])
    const dispatch = useDispatch()
    const fetchData = useApiFetcher()

    // Получение данных из Redux store
    const selectedUid = useAppSelector(
        (state) => state.SelectedContact.uid,
    )
    const contactsList = useAppSelector(
        (state) => state.contacts.list,
    )

    // Загрузка контактов, если их ещё нет
    useEffect(() => {
        const loadContacts = async () => {
            if (contactsList.length > 0) return // уже есть

            try {
                const data = await fetchData(
                    '/api/v1/contact/messenger-list/',
                    {
                        method: 'GET',
                    },
                )
                const contactsData: ApiContact[] =
                    data.results || []
                const mappedContacts: Contact[] =
                    contactsData.map((item) => {
                        const systemContact =
                            item.system_contact
                        return {
                            uid: item.uid,
                            userUid:
                                systemContact?.uid ??
                                item.owner_user ??
                                item.uid,
                            username: '',
                            nickname: item.nickname ?? '',
                            phone: item.phone,
                            firstName: item.first_name,
                            lastName: item.last_name,
                            patronymic: '',
                            avatar:
                                systemContact?.avatar ??
                                item.avatar ??
                                null,
                            avatarUrl:
                                systemContact?.avatar_url ??
                                item.avatar_url ??
                                null,
                            avatarWebp:
                                systemContact?.avatar_webp ??
                                item.avatar_webp ??
                                null,
                            avatarWebpUrl:
                                systemContact?.avatar_webp_url ??
                                item.avatar_webp_url ??
                                null,
                            additionalInformation: '',
                            birthday: 0,
                            chatId: 0,
                            isOnline:
                                systemContact?.is_online ??
                                item.is_online ??
                                false,
                            wasOnlineAt:
                                systemContact?.was_online_at ??
                                item.was_online_at ??
                                null,
                        }
                    })
                dispatch(setContacts(mappedContacts))
            } catch (error) {
                console.error(
                    'Ошибка загрузки контактов:',
                    error,
                )
            }
        }
        loadContacts()
    }, [contactsList.length, fetchData, dispatch])

    const handleSelectContact = (uid: string) => {
        setSelectedContactIds((prev) =>
            prev.includes(uid)
                ? prev.filter((id) => id !== uid)
                : [...prev, uid],
        )
    }

    const selectedContacts = contactsList.filter(
        (contact) =>
            selectedContactIds.includes(contact.uid),
    )

    const { name } = groupData

    const handleSetSelectedContact = (uid: string) => {
        dispatch(setSelectedContact(uid))
    }

    const handleFinishClick = () => {
        onFinish(selectedContacts)
    }

    return (
        <div
            className={`
          flex h-(--screen-height-list) min-h-0 flex-col rounded-md bg-gray-main
        `}
        >
            {/* Шапка */}
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

            {/* Ошибка */}
            {error && (
                <div className="mx-4 mt-4 rounded-md bg-system-red-surface p-3">
                    <p className="text-sm text-system-red">
                        {error}
                    </p>
                </div>
            )}

            {/* Список контактов */}
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

            {/* Кнопка создания */}
            <div className="flex items-center justify-center px-4 pt-4 pb-8">
                <Button
                    onClick={handleFinishClick}
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
                            Создать группу
                        </span>
                    )}
                </Button>
            </div>
        </div>
    )
}
