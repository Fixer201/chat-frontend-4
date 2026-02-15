'use client'
import { usePathname, useRouter } from 'next/navigation'

import { cn } from '@shared/lib/utils'
import ContactsIcon from '@public/icons/app-sidebar/contacts.svg'
import MessageIcon from '@public/icons/app-sidebar/message.svg'
import ServiceIcon from '@public/icons/app-sidebar/service.svg'
import SettingsIcon from '@public/icons/app-sidebar/settings.svg'

const iconBaseClass = 'h-8 w-8 transition-colors'

const navItems = [
    {
        id: 'messages',
        label: 'Чаты',
        Icon: MessageIcon,
        path: '/chats',
    },
    {
        id: 'service',
        label: 'Сервисы',
        Icon: ServiceIcon,
        path: '/test-components',
    },
    {
        id: 'contacts',
        label: 'Контакты',
        Icon: ContactsIcon,
        path: '/contacts',
    },
    {
        id: 'settings',
        label: 'Настройки',
        Icon: SettingsIcon,
        path: '/settings',
    },
]

export default function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <nav
            className={`
              fixed right-0 bottom-0 left-0 flex h-16 w-full flex-row
              items-center justify-around gap-3 border-t border-app-divider
              bg-white p-2
              md:static md:h-57 md:w-12 md:flex-col md:justify-between md:gap-3
              md:border-0 md:bg-transparent md:p-0
            `}
        >
            {navItems.map(({ id, label, Icon, path }) => {
                const isActive = Boolean(
                    path && pathname.startsWith(path),
                )

                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => {
                            if (path) {
                                router.push(path)
                            }
                        }}
                        aria-pressed={isActive}
                        className={cn(
                            `
                              flex h-16 w-12 cursor-pointer flex-col
                              items-center justify-center gap-1 rounded-lg
                              transition-colors
                              md:h-12 md:flex-row md:justify-center md:gap-0
                            `,
                            isActive
                                ? 'border border-app-divider bg-gray-main'
                                : `
                                  border border-transparent
                                  hover:bg-gray-main
                                `,
                        )}
                    >
                        <Icon
                            className={cn(
                                iconBaseClass,
                                isActive
                                    ? `text-accent-violet-primary`
                                    : `text-text-gray`,
                            )}
                            aria-hidden
                        />
                        <span
                            className={`
                          block text-center text-[14px] text-text-gray
                          md:hidden
                        `}
                        >
                            {' '}
                            {/* Подпись только на мобильных */}
                            {label}
                        </span>
                    </button>
                )
            })}
        </nav>
    )
}
