/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Cookies from 'js-cookie'

import ForwardIcon from '@public/icons/settings-sidebar/Forward.svg'
import BlackListIcon from '@public/icons/settings-sidebar/BlackList.svg'
import SupportIcon from '@public/icons/settings-sidebar/Support.svg'
import LogOutIcon from '@public/icons/settings-sidebar/LogOut.svg'
import EditIcon from '@public/icons/settings-sidebar/Edite.svg'
import DeleteIcon from '@public/icons/settings-sidebar/Delete.svg'

import { cn } from '@shared/lib/utils'
import { useDisclosure } from '@shared/hooks/useDisclosure'
import { useProfile } from '@shared/hooks/useProfile'
import Modal from '@shared/ui/modal/Modal'

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

const DEFAULT_AVATAR_SRC =
    '/images/chatHeader/userAvatar.svg'

export default function SettingsMenu() {
    const router = useRouter()
    const pathname = usePathname()
    const { profile, loading } = useProfile()
    // Локальные стейты для удаления аккаунта (мягкое удаление через бэк)
    const [deleteError, setDeleteError] = useState<
        string | null
    >(null)
    const [deleteLoading, setDeleteLoading] =
        useState(false)
    const {
        isOpen: isLogoutModalOpen,
        onOpen: openLogoutModal,
        onClose: closeLogoutModal,
    } = useDisclosure()
    const {
        isOpen: isDeleteModalOpen,
        onOpen: openDeleteModal,
        onClose: closeDeleteModal,
    } = useDisclosure()

    const handleLogoutConfirm = useCallback(() => {
        // TODO: integrate real logout flow once backend is ready
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        router.push('/auth/register')
        closeLogoutModal()
    }, [closeLogoutModal, router])

    // Удаление профиля: шлём DELETE на прокси, чистим токены и редиректим
    const handleDeleteConfirm = useCallback(async () => {
        if (deleteLoading) return

        const accessToken = Cookies.get('access_token')
        const targetUid =
            (profile as { uid?: string })?.uid ||
            (profile as { id?: number })?.id

        if (!targetUid) {
            setDeleteError(
                'Нет идентификатора пользователя',
            )
            return
        }

        setDeleteError(null)
        setDeleteLoading(true)

        try {
            const response = await fetch(
                `/api/auth/profile/${targetUid}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: accessToken
                            ? `Bearer ${accessToken}`
                            : '',
                    },
                },
            )

            const rawText = await response.text()
            let data: Record<string, unknown> = {}
            try {
                data = rawText ? JSON.parse(rawText) : {}
            } catch (e) {
                console.warn(
                    'Delete profile: response is not JSON',
                    rawText,
                    e,
                )
            }

            if (!response.ok) {
                const message =
                    (data?.detail as string) ||
                    (data?.error as string) ||
                    `Ошибка удаления ${response.status}`
                setDeleteError(message)
                return
            }

            // Soft delete done: clear tokens and redirect
            Cookies.remove('access_token')
            Cookies.remove('refresh_token')
            closeDeleteModal()
            router.push('/auth/register')
        } catch (err) {
            console.error('Delete profile error', err)
            setDeleteError('Ошибка сети при удалении')
        } finally {
            setDeleteLoading(false)
        }
    }, [closeDeleteModal, deleteLoading, profile, router])

    useEffect(() => {
        if (profile) {
            console.log('Settings profile data:', profile)
        }
    }, [profile])

    const displayName = [
        profile?.first_name,
        profile?.last_name,
    ]
        .filter(Boolean)
        .join(' ')

    const displayPhone = profile?.phone ?? ''

    const displayNickname = profile?.nickname
        ? `@${profile.nickname}`
        : ''

    const isProfilePending = loading && !profile

    const profileAvatarSrc = (() => {
        if (!profile) return null

        const directUrl =
            (
                profile as {
                    avatar_url?: string
                    avatar_webp_url?: string
                }
            ).avatar_url ||
            (
                profile as {
                    avatar_url?: string
                    avatar_webp_url?: string
                }
            ).avatar_webp_url
        if (directUrl) return directUrl as string

        const rawAvatar = (
            profile as {
                avatar?: string
            }
        ).avatar as string | undefined
        if (rawAvatar) {
            if (rawAvatar.startsWith('http')) {
                return rawAvatar
            }
            if (rawAvatar.startsWith('/')) {
                return rawAvatar
            }
            return `/${rawAvatar}`
        }

        return null
    })()
    const asideClass = cn(
        'h-11/12 w-full rounded-md border border-app-divider bg-gray-main',
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
                      border-b border-app-divider bg-gray-main p-4
                    `}
                >
                    <h1
                        className={`
                          text-lg font-medium tracking-extra-tight
                          text-text-black
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
                                src={
                                    profileAvatarSrc ||
                                    DEFAULT_AVATAR_SRC
                                }
                                alt="Аватар пользователя"
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="flex flex-col">
                            <span
                                className={`
                                  text-lg font-medium tracking-extra-tight
                                  text-text-black
                                `}
                            >
                                {isProfilePending
                                    ? 'Загрузка...'
                                    : displayName}
                            </span>
                            <span className="text-sm text-text-black">
                                {isProfilePending
                                    ? '—'
                                    : displayPhone}
                            </span>
                            <span className="text-sm text-text-black">
                                {isProfilePending
                                    ? '—'
                                    : displayNickname}
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
                                         flex w-full items-center
                                          gap-3 border-b border-app-divider p-4
                                          text-left text-base text-text-black
                                          transition-colors
                                          hover:bg-accent-violet-ultra-light
                                        `,
                                        index !==
                                            menuItems.length -
                                                1 &&
                                            `border-b border-app-divider`,
                                        isActive &&
                                            `bg-accent-violet-ultra-light`,
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
                        onClick={openLogoutModal}
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
                    onClick={openDeleteModal}
                >
                    <DeleteIcon className="text-current" />
                    Удалить профиль
                </button>
            </div>
            <Modal
                open={isLogoutModalOpen}
                onClose={closeLogoutModal}
                title="Выход из аккаунта"
                titleAlign="left"
                description="Вы действительно хотите выйти из аккаунта?"
                descriptionColor="muted"
                blurBackground
                buttons={[
                    {
                        label: 'Отмена',
                        variant: 'ghost',
                        onClick: closeLogoutModal,
                    },
                    {
                        label: 'Выйти',
                        variant: 'solid',
                        color: 'primary',
                        onClick: handleLogoutConfirm,
                    },
                ]}
            />
            <Modal
                open={isDeleteModalOpen}
                onClose={closeDeleteModal}
                title="Удаление профиля"
                titleAlign="left"
                description={
                    deleteError ??
                    'Это действие необратимо. Все данные будут удалены без возможности восстановления.'
                }
                descriptionColor="muted"
                blurBackground
                buttons={[
                    {
                        label: deleteLoading
                            ? 'Удаление...'
                            : 'Удалить',
                        variant: 'ghost',
                        color: 'danger',
                        onClick: handleDeleteConfirm,
                    },
                    {
                        label: 'Отмена',
                        variant: 'solid',
                        color: 'primary',
                        onClick: closeDeleteModal,
                    },
                ]}
            />
        </aside>
    )
}
