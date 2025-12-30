'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import ForwardIcon from '@public/icons/settings-sidebar/Forward.svg'
import BlackListIcon from '@public/icons/settings-sidebar/BlackList.svg'
import SupportIcon from '@public/icons/settings-sidebar/Support.svg'
import LogOutIcon from '@public/icons/settings-sidebar/LogOut.svg'
import EditIcon from '@public/icons/settings-sidebar/Edite.svg'
import DeleteIcon from '@public/icons/settings-sidebar/Delete.svg'

import { cn } from '@shared/lib/utils'

import EditProfileForm from './EditProfileForm'
import SupportForm from './SupportForm'

const menuItems = [
    {
        label: 'Редактирование профиля',
        href: '/settings/profile',
        Icon: EditIcon,
    },
    {
        label: 'Чёрный список',
        href: '/settings/blacklist',
        Icon: BlackListIcon,
    },
    {
        label: 'Поддержка',
        href: '/settings/support',
        Icon: SupportIcon,
    },
]

export default function SettingsMenu() {
    const pathname = usePathname()
    const asideClass = cn(
        'h-11/12 w-full rounded-md border border-gray-200 bg-gray-main',
        'md:w-80',
        'lg:w-96',
    )

    if (pathname?.startsWith('/settings/profile')) {
        return (
            <aside className={asideClass}>
                <EditProfileForm />
            </aside>
        )
    }

    if (pathname?.startsWith('/settings/support')) {
        return (
            <aside className={asideClass}>
                <SupportForm />
            </aside>
        )
    }

    return (
        <aside className={asideClass}>
            <div className="flex h-full w-full flex-col rounded-md bg-gray-main">
                <div
                    className={`
                      mb-4 flex items-center justify-center rounded-t-md
                      border-b border-gray-200 bg-gray-main p-4
                    `}
                >
                    <h1
                        className={`
                          text-lg font-medium tracking-[0.01em] text-text-black
                        `}
                    >
                        Настройки
                    </h1>
                </div>
                <div className="mx-4 rounded-md bg-white-bg p-3">
                    <div className="flex items-center gap-3">
                        <div
                            className={`
                              flex h-20 w-20 items-center justify-center
                              rounded-full bg-accent-violet-light
                              text-accent-violet-primary
                            `}
                        >
                            <Image
                                src="/images/chatHeader/userAvatar.svg"
                                alt="Аватар пользователя"
                                width={80}
                                height={80}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span
                                className={`
                                  text-lg font-medium tracking-[0.01em]
                                  text-text-black
                                `}
                            >
                                Сергей Иванов
                            </span>
                            <span className="text-sm text-text-black">
                                +7 921 7797979
                            </span>
                            <span className="text-sm text-text-black">
                                @bond777
                            </span>
                        </div>
                    </div>
                </div>
                <div
                    className={`
                      mx-4 mt-4 flex flex-col overflow-hidden rounded-md
                      bg-white-bg
                    `}
                >
                    {menuItems.map(
                        ({ href, label, Icon }, index) => {
                            const isActive =
                                pathname === href

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        `
                                          flex w-full items-center gap-3
                                          border-b border-gray-200 p-4 text-left
                                          text-base text-text-black
                                          transition-colors
                                          hover:bg-(--color-accent-violet-ultra-light)
                                        `,
                                        index !==
                                            menuItems.length -
                                                1 &&
                                            `border-b border-gray-200`,
                                        isActive &&
                                            `
                                              bg-(--color-accent-violet-ultra-light)
                                            `,
                                    )}
                                    aria-current={
                                        isActive
                                            ? 'page'
                                            : undefined
                                    }
                                >
                                    <Icon className="text-accent-violet-primary" />
                                    {label}
                                    <ForwardIcon
                                        className={`mr-1 ml-auto text-text-gray`}
                                    />
                                </Link>
                            )
                        },
                    )}
                    <button
                        type="button"
                        className={`
                          flex w-full cursor-pointer items-center gap-3 p-4
                          text-left text-base text-text-black transition-colors
                          hover:bg-(--color-accent-violet-ultra-light)
                        `}
                    >
                        <LogOutIcon className="text-accent-violet-primary" />
                        Выйти из аккаунта
                    </button>
                </div>
                <button
                    type="button"
                    className={`
                      group mt-auto flex w-full cursor-pointer items-center
                      gap-3 px-5 py-4 text-left text-base text-system-red
                      transition-colors
                      hover:text-system-red-soft
                    `}
                >
                    <DeleteIcon className="text-current" />
                    Удалить профиль
                </button>
            </div>
        </aside>
    )
}
