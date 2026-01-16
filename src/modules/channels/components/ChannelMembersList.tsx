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

interface ChannelMembersListProps {
    channelData: onNextProps // Принимаем все данные о группе
    onBack: () => void
    onFinish: (selectedContacts: Contact[]) => void
}

export default function ChannelMembersList({
    channelData,
    onBack,
    onFinish,
}: ChannelMembersListProps) {
    const [selectedContactIds, setSelectedContactIds] =
        useState<string[]>([])
    const dispatch = useDispatch()
    const selectedUid = useSelector(
        (state: RootState) => state.SelectedContact.uid,
    )
    const contactsList = useSelector(
        (state: RootState) => state.contacts.list,
    )
    const handleSelectContact = (uid: string) => {
        setSelectedContactIds((prev) =>
            prev.includes(uid)
                ? prev.filter((id) => id !== uid)
                : [...prev, uid],
        )
    }
    // Получаем полные объекты контактов по выбранным ID
    const selectedContacts = contactsList.filter(
        (contact) =>
            selectedContactIds.includes(contact.uid),
    )
    const { name } = channelData
    const handleSetSelectedContact = (uid: string) => {
        dispatch(setContacts(uid))
    }
    const handleFinishClick = () => {
        // Вызываем родительский обработчик
        onFinish(selectedContacts)
    }
    return (
        <div
            className={`flex h-full min-h-0 flex-col rounded-md bg-gray-main`}
        >
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
                      hover:bg-(--color-accent-violet-ultra-light)
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

            <div
                className={cn(
                    `
                      min-h-0 w-full flex-1 rounded-md border border-gray-200
                      bg-gray-main
                      md:w-80
                      lg:w-96
                    `,
                    `max-h-(--screen-112)`,
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

            <div
                className={`flex items-center justify-center px-4 pt-4 pb-8`}
            >
                <Button
                    onClick={handleFinishClick}
                    disabled={!name.trim()}
                    variant="solid"
                    size="md"
                    className={`
                      h-14 w-full max-w-82 rounded-md
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                >
                    <span className="text-base font-medium">
                        Далее
                    </span>
                </Button>
            </div>
        </div>
    )
}
