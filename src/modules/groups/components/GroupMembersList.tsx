// src/modules/chat-room/components/GroupMembersList.tsx
'use client'

import { Button } from '@shared/ui/button/Button'
import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import ContactsListInvitation from '@modules/contacts/components/ContactsListInvitation'
interface GroupMembersListProps {
    groupName: string // Теперь принимаем название группы вместо ID
    onBack: () => void
    onFinish: () => void
}

export default function GroupMembersList({
    groupName,
    onBack,
    onFinish,
}: GroupMembersListProps) {
    return (
        <div
            className={`flex h-full flex-col rounded-md bg-gray-main`}
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
                className={`
                 w-full rounded-md border border-gray-200 bg-gray-main
                 md:w-80
                 lg:w-96
               `}
            >
                <ContactsListInvitation />
            </div>

            <div className="flex justify-center">
                <Button
                    onClick={onFinish}
                    disabled={!groupName.trim()}
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
