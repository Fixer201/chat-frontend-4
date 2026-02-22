'use client'

import { cn } from '@shared/lib/utils'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import {
    useState,
    useCallback,
    useEffect,
    useRef,
} from 'react'

import TabContentPreview from './TabContentPreview'
import TabLayout from './TabLayout'
import ParticipantsContent from './tabs/ParticipantsContent'
import MediaContent from './tabs/MediaContent'
import FilesContent from './tabs/FilesContent'
import VoiceContent from './tabs/VoiceContent'
import LinksContent from './tabs/LinksContent'
import DropdownMenuButton from '@shared/ui/dropdown/DropdownMenu'
import ClearChatModal from './modals/ClearChatModal'
import LeaveGroupModal from './modals/LeaveGroupModal'
import DeleteGroupModal from './modals/DeleteGroupModal'
import { useGroupInfoSidebar } from './useGroupInfoSidebar'
import { getNoun } from '@shared/lib/getNoun'
import {
    getChatByIdFromStorage,
    loadChatsFromStorage,
    saveChatsToStorage,
} from '@shared/lib/localStorageChats'
import EditChannelView from './EditChannelView' // предполагается, что создадите аналогичный компонент
import { transformFromApi } from '@shared/lib/transformChatData'
import { ApiChatItem } from '@shared/types/chat'
import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard'
import { Toast } from '@shared/ui/toast/Toast'
import { CountdownCircle } from '@shared/ui/countdown/CountdownCircle'

type TabId =
    | 'participants'
    | 'media'
    | 'files'
    | 'voice'
    | 'links'

function getTabContent(
    tabId: TabId,
    chatKey: string,
    chatUid: string,
    setDynamicTabTitle: (t: string | null) => void,
    onParticipantsChange?: (count: number) => void,
    isCurrentUserOwner?: boolean,
) {
    switch (tabId) {
        case 'participants':
            return (
                <ParticipantsContent
                    chatKey={chatKey}
                    onTitleChange={setDynamicTabTitle}
                    onParticipantsChange={
                        onParticipantsChange
                    }
                    isCurrentUserOwner={isCurrentUserOwner}
                />
            )
        case 'media':
            return <MediaContent chatUid={chatUid} />
        case 'files':
            return <FilesContent chatUid={chatUid} />
        case 'voice':
            return <VoiceContent chatUid={chatUid} />
        case 'links':
            return <LinksContent chatUid={chatUid} />
        default:
            return null
    }
}

interface ChannelInfoSidebarProps {
    chatId: number
    chatType: string
    chatKey: string
    chatUid: string
    name: string
    participantsCount: number
    description?: string
    inviteLink?: string
    notificationsEnabled: boolean
    onNotificationsChange?: (enabled: boolean) => void
    onClose?: () => void
    onClearChat?: (deleteForEveryone: boolean) => void
    onLeaveChannel?: () => void // переименовано для ясности
    onDeleteChannel?: () => void // переименовано для ясности
    avatarUrl?: string | null
    onChannelUpdated?: () => void // переименовано для ясности
    isCurrentUserOwner?: boolean
}

export default function ChannelInfoSidebar({
    chatId,
    chatType,
    chatKey,
    chatUid,
    name,
    participantsCount,
    description,
    inviteLink,
    notificationsEnabled,
    onNotificationsChange,
    onClose,
    onClearChat,
    onLeaveChannel,
    onDeleteChannel,
    avatarUrl,
    onChannelUpdated,
    isCurrentUserOwner = false,
}: ChannelInfoSidebarProps) {
    const [isCopied, setIsCopied] = useState(false)
    const [clearChatModalOpen, setClearChatModalOpen] =
        useState(false)
    const [
        leaveChannelModalOpen,
        setLeaveChannelModalOpen,
    ] = useState(false)
    const [
        deleteChannelModalOpen,
        setDeleteChannelModalOpen,
    ] = useState(false)
    const [
        participantsCountState,
        setParticipantsCountState,
    ] = useState(participantsCount)
    const [isEditing, setIsEditing] = useState(false)
    const [copied, copyToClipboard] =
        useCopyToClipboard(700)
    const [toastOpen, setToastOpen] = useState(false)
    const [deletionToastOpen, setDeletionToastOpen] =
        useState(false)
    const [countdown, setCountdown] = useState(4)
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(
        null,
    )
    const [leaveToastOpen, setLeaveToastOpen] =
        useState(false)
    const [leaveCountdown, setLeaveCountdown] = useState(4)
    const leaveTimerRef = useRef<NodeJS.Timeout | null>(
        null,
    )
    const [clearToastOpen, setClearToastOpen] =
        useState(false)
    const [clearCountdown, setClearCountdown] = useState(4)
    const clearTimerRef = useRef<NodeJS.Timeout | null>(
        null,
    )
    const [avatarError, setAvatarError] = useState(false)

    const handleAvatarError = useCallback(() => {
        setAvatarError(true)
    }, [setAvatarError])

    const avatarSrc = avatarError
        ? '/images/altImage.png'
        : avatarUrl || '/images/altImage.png'

    const {
        activeTab,
        viewMode,
        isMouseOver,
        setIsMouseOver,
        dynamicTabTitle,
        setDynamicTabTitle,
        hideTabScrollbarDuringReturn,
        tabScrollPositions,
        tabsRef,
        containerRef,
        mainContentRef,
        tabsContainerRef,
        tabs,
        handleMainTabClick,
        handleBackFromTab,
        handleMainTouchStart,
        handleMainTouchMove,
        handleMainWheel,
        handleMainScroll,
        handleTabScrollEvent,
        handleTabContentTabClick,
        handleAttemptReturn,
        getTabTitle,
    } = useGroupInfoSidebar()

    const handleEditChannel = useCallback(() => {
        setIsEditing(true)
    }, [])

    const compressImage = useCallback(
        (
            file: File,
            maxWidth = 512,
            maxHeight = 512,
            quality = 0.8,
        ): Promise<string> => {
            return new Promise((resolve, reject) => {
                const img = new window.Image()
                img.onload = () => {
                    const canvas =
                        document.createElement('canvas')
                    let width = img.width
                    let height = img.height

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round(
                                height * (maxWidth / width),
                            )
                            width = maxWidth
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round(
                                width *
                                    (maxHeight / height),
                            )
                            height = maxHeight
                        }
                    }

                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx?.drawImage(img, 0, 0, width, height)
                    resolve(
                        canvas.toDataURL(
                            'image/jpeg',
                            quality,
                        ),
                    )
                }
                img.onerror = reject
                img.src = URL.createObjectURL(file)
            })
        },
        [],
    )

    const handleSaveEdit = useCallback(
        async (updatedData: {
            name: string
            description: string
            type: 'public' | 'private' // ожидаем 'public'/'private'
            notificationsEnabled: boolean
            avatarFile?: File | null
        }) => {
            const currentChat =
                getChatByIdFromStorage(chatId)
            if (!currentChat) return

            // преобразуем 'public'/'private' в финальный тип канала
            const newChatType =
                updatedData.type === 'public'
                    ? 'public-channel'
                    : 'private-channel'

            const updatedChat: ApiChatItem = {
                ...currentChat,
            }
            updatedChat.name = updatedData.name
            updatedChat.description =
                updatedData.description
            updatedChat.chat_type = newChatType

            if (updatedData.avatarFile) {
                try {
                    const compressedBase64 =
                        await compressImage(
                            updatedData.avatarFile,
                        )
                    updatedChat.chat = {
                        ...currentChat.chat,
                        avatar_url: compressedBase64,
                    }
                } catch (error) {
                    console.error(
                        'Ошибка сжатия аватара',
                        error,
                    )
                }
            }

            const allChats = loadChatsFromStorage() || []
            const index = allChats.findIndex(
                (c) => c.id === chatId,
            )
            if (index !== -1) {
                allChats[index] = updatedChat
                saveChatsToStorage(allChats)
            }

            if (
                updatedData.notificationsEnabled !==
                notificationsEnabled
            ) {
                onNotificationsChange?.(
                    updatedData.notificationsEnabled,
                )
            }

            setIsEditing(false)
            onChannelUpdated?.()
        },
        [
            chatId,
            notificationsEnabled,
            onNotificationsChange,
            onChannelUpdated,
            compressImage,
        ],
    )

    const handleParticipantsChange = useCallback(
        (newCount: number) => {
            setParticipantsCountState(newCount)
        },
        [],
    )

    const handleCopyLink = useCallback(() => {
        if (inviteLink) {
            copyToClipboard(inviteLink)
            setToastOpen(true)
        }
    }, [inviteLink, copyToClipboard])

    const handleToggleNotifications = useCallback(() => {
        onNotificationsChange?.(!notificationsEnabled)
    }, [notificationsEnabled, onNotificationsChange])

    const handleClearChatConfirm = useCallback(
        async (deleteForEveryone: boolean) => {
            setClearChatModalOpen(false)
            setClearToastOpen(true)
            setClearCountdown(4)

            clearTimerRef.current = setInterval(() => {
                setClearCountdown((prev) => {
                    if (prev <= 1) {
                        if (clearTimerRef.current) {
                            clearInterval(
                                clearTimerRef.current,
                            )
                            clearTimerRef.current = null
                        }
                        setClearToastOpen(false)
                        setTimeout(() => {
                            onClearChat?.(deleteForEveryone)
                        }, 0)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        },
        [onClearChat],
    )

    const handleCancelClear = useCallback(() => {
        if (clearTimerRef.current) {
            clearInterval(clearTimerRef.current)
            clearTimerRef.current = null
        }
        setClearToastOpen(false)
        setClearCountdown(4)
    }, [])

    useEffect(() => {
        return () => {
            if (clearTimerRef.current) {
                clearInterval(clearTimerRef.current)
            }
        }
    }, [])

    const handleLeaveChannelConfirm =
        useCallback(async () => {
            setLeaveChannelModalOpen(false)
            setLeaveToastOpen(true)
            setLeaveCountdown(4)

            leaveTimerRef.current = setInterval(() => {
                setLeaveCountdown((prev) => {
                    if (prev <= 1) {
                        if (leaveTimerRef.current) {
                            clearInterval(
                                leaveTimerRef.current,
                            )
                            leaveTimerRef.current = null
                        }
                        setLeaveToastOpen(false)
                        setTimeout(() => {
                            onLeaveChannel?.()
                        }, 0)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }, [onLeaveChannel])

    const handleCancelLeave = useCallback(() => {
        if (leaveTimerRef.current) {
            clearInterval(leaveTimerRef.current)
            leaveTimerRef.current = null
        }
        setLeaveToastOpen(false)
        setLeaveCountdown(4)
    }, [])

    useEffect(() => {
        return () => {
            if (leaveTimerRef.current) {
                clearInterval(leaveTimerRef.current)
            }
        }
    }, [])

    const handleDeleteChannelConfirm =
        useCallback(async () => {
            setDeleteChannelModalOpen(false)
            setDeletionToastOpen(true)
            setCountdown(4)

            countdownTimerRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        if (countdownTimerRef.current) {
                            clearInterval(
                                countdownTimerRef.current,
                            )
                            countdownTimerRef.current = null
                        }
                        setDeletionToastOpen(false)
                        setTimeout(() => {
                            onDeleteChannel?.()
                        }, 0)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }, [onDeleteChannel])

    const handleCancelDeletion = useCallback(() => {
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current)
            countdownTimerRef.current = null
        }
        setDeletionToastOpen(false)
        setCountdown(4)
    }, [])

    useEffect(() => {
        return () => {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current)
            }
        }
    }, [])

    if (viewMode === 'tab') {
        return (
            <TabLayout
                activeTab={activeTab}
                onBack={handleBackFromTab}
                onTabClick={handleTabContentTabClick}
                tabTitle={getTabTitle(activeTab)}
                dynamicTitle={dynamicTabTitle || undefined}
                onScroll={handleTabScrollEvent}
                onAttemptReturn={handleAttemptReturn}
                hideScrollbar={hideTabScrollbarDuringReturn}
                initialScrollTop={
                    tabScrollPositions[activeTab]
                }
            >
                {getTabContent(
                    activeTab,
                    chatKey,
                    chatUid,
                    setDynamicTabTitle,
                    handleParticipantsChange,
                    isCurrentUserOwner,
                )}
            </TabLayout>
        )
    }

    if (isEditing) {
        return (
            <EditChannelView
                initialName={name}
                initialDescription={description || ''}
                initialType={
                    chatType === 'public-channel'
                        ? 'public'
                        : 'private'
                } // ← исправлено
                initialAvatarUrl={avatarUrl}
                initialNotificationsEnabled={
                    notificationsEnabled
                }
                inviteLink={inviteLink}
                onSave={handleSaveEdit} // см. пункт 2
                onCancel={() => setIsEditing(false)}
            />
        )
    }

    return (
        <div
            className={`
              relative flex h-full flex-col overflow-hidden rounded-md
              bg-gray-main
            `}
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}
        >
            {/* Header */}
            <div
                className={`
                  flex items-center justify-between gap-3 rounded-t-md border-b
                  border-app-divider bg-gray-main px-4 py-4
                `}
            >
                <Button
                    onClick={onClose}
                    aria-label="Закрыть"
                    variant="ghost"
                    size="sm"
                    className={`
                      flex items-center justify-center rounded-full p-0
                      text-text-black
                      hover:bg-accent-violet-ultra-light
                    `}
                >
                    <Image
                        src="/icons/detailInfo/detailInfoClose.svg"
                        alt="Закрыть"
                        width={24}
                        height={24}
                    />
                </Button>

                <h2
                    className={`
                      ml-3 flex-1 text-left text-lg font-medium
                      tracking-extra-tight text-text-black
                    `}
                >
                    Информация о канале
                </h2>

                <div className="flex items-center gap-3">
                    {isCurrentUserOwner && (
                        <Button
                            onClick={handleEditChannel}
                            aria-label="Редактировать канал"
                            variant="ghost"
                            size="sm"
                            className={`
                              flex items-center justify-center rounded-full p-0
                              text-text-black
                              hover:bg-accent-violet-ultra-light
                            `}
                        >
                            <Image
                                src="/icons/detailInfo/detailInfoSettings.svg"
                                alt="Редактировать"
                                width={24}
                                height={24}
                            />
                        </Button>
                    )}

                    <DropdownMenuButton
                        triggerIcon={
                            <Image
                                src="/icons/detailInfo/detailInfoDropdown.svg"
                                alt="Настройки"
                                width={24}
                                height={24}
                                className="hover:cursor-pointer"
                            />
                        }
                        triggerClassName="flex items-center justify-center rounded-full p-0 text-text-black hover:bg-accent-violet-ultra-light"
                        menuWidth={220}
                        placement="bottom-right"
                        ariaLabel="Настройки канала"
                        items={[
                            {
                                label: 'Очистить чат',
                                icon: (
                                    <Image
                                        src="/icons/clean.svg"
                                        alt=""
                                        width={24}
                                        height={24}
                                    />
                                ),
                                onClick: () =>
                                    setClearChatModalOpen(
                                        true,
                                    ),
                            },
                            !isCurrentUserOwner && {
                                label: 'Покинуть канал',
                                icon: (
                                    <Image
                                        src="/icons/leave.svg"
                                        alt=""
                                        width={24}
                                        height={24}
                                    />
                                ),
                                onClick: () =>
                                    setLeaveChannelModalOpen(
                                        true,
                                    ),
                                hasDivider: true,
                            },
                            isCurrentUserOwner && {
                                label: 'Удалить канал',
                                icon: (
                                    <Image
                                        src="/icons/delete.svg"
                                        alt=""
                                        width={24}
                                        height={24}
                                    />
                                ),
                                onClick: () =>
                                    setDeleteChannelModalOpen(
                                        true,
                                    ),
                                hasDivider: true,
                                isDanger: true,
                            },
                        ].filter(Boolean)}
                    />
                </div>
            </div>

            {/* Основной контент */}
            <div
                ref={mainContentRef}
                className={cn(
                    'scrollbar-hide flex-1 overflow-auto',
                    'h-[calc(100%-64px)] touch-none overscroll-none',
                )}
                onWheel={handleMainWheel}
                onTouchStart={handleMainTouchStart}
                onTouchMove={handleMainTouchMove}
                onScroll={handleMainScroll}
            >
                <div className="relative">
                    <div className="relative h-60 w-full overflow-hidden">
                        <Image
                            key={avatarUrl}
                            src={avatarSrc}
                            alt={name}
                            fill
                            className="object-cover"
                            onError={handleAvatarError}
                            priority
                        />
                    </div>
                    <div
                        className={`
                          absolute right-0 bottom-0 left-0 rounded-b-md
                          bg-gradient-to-t from-black/70 to-transparent p-4
                        `}
                    >
                        <h3 className="text-2xl font-semibold text-white">
                            {name}
                        </h3>
                        <p className="mt-1 text-lg text-white/90">
                            {participantsCountState}{' '}
                            {getNoun(
                                participantsCountState,
                                'подписчик',
                                'подписчика',
                                'подписчиков',
                            )}
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 px-4 py-3">
                    {/* Уведомления */}
                    <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-text-black">
                            Уведомление
                        </span>
                        <button
                            onClick={
                                handleToggleNotifications
                            }
                            aria-label={
                                notificationsEnabled
                                    ? 'Отключить уведомления'
                                    : 'Включить уведомления'
                            }
                            className={cn(
                                `
                                  relative inline-flex h-8 w-14 items-center
                                  rounded-full transition-colors
                                  hover:cursor-pointer
                                  focus:outline-none
                                `,
                                notificationsEnabled
                                    ? 'bg-blue-500'
                                    : `bg-gray-300`,
                            )}
                        >
                            <span
                                className={cn(
                                    `
                                      inline-block h-6 w-6 transform
                                      rounded-full bg-white transition-transform
                                    `,
                                    notificationsEnabled
                                        ? 'translate-x-6'
                                        : `translate-x-1`,
                                )}
                            />
                        </button>
                    </div>

                    {/* Описание */}
                    <div className="mx-0 my-2 rounded-md bg-white-bg p-1">
                        <div
                            className={`
                              flex flex-col justify-between p-0.5 pr-8
                            `}
                        >
                            <span
                                className={`
                                  p-0 text-xs font-medium tracking-extra-tight
                                  text-text-gray
                                `}
                            >
                                Описание
                            </span>
                            <span
                                className={`
                                  p-0 text-base break-words text-black
                                `}
                            >
                                {description ||
                                    'пустое описание'}
                            </span>
                        </div>
                    </div>

                    {/* Ссылка-приглашение */}
                    {chatType === 'public-channel' &&
                        inviteLink && (
                            <div
                                className={`
                              mx-0 my-1 rounded-md bg-white-bg p-1
                            `}
                            >
                                <div
                                    className={`
                                  flex flex-col justify-between p-0.5
                                `}
                                >
                                    <span
                                        className={`
                                          mb-1 p-0 text-xs font-medium
                                          tracking-extra-tight text-text-gray
                                        `}
                                    >
                                        Ссылка на
                                        приглашение в канал
                                    </span>
                                    <div
                                        className={`
                                          flex items-center justify-between
                                        `}
                                    >
                                        <span
                                            className={`
                                              pr-2 text-base break-all
                                              text-accent-violet-primary
                                            `}
                                        >
                                            {inviteLink}
                                        </span>
                                        <Button
                                            onClick={
                                                handleCopyLink
                                            }
                                            aria-label="Копировать ссылку"
                                            variant="ghost"
                                            size="sm"
                                            className={`
                                              flex shrink-0 items-center
                                              justify-center rounded-full p-0
                                              text-text-black
                                              hover:bg-accent-violet-ultra-light
                                            `}
                                        >
                                            <Image
                                                src="/icons/detailInfo/copyLink.svg"
                                                alt="Копировать ссылку"
                                                width={24}
                                                height={24}
                                                className={cn(
                                                    copied
                                                        ? 'opacity-50'
                                                        : `opacity-100`,
                                                )}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Табы */}
                    <div
                        ref={tabsContainerRef}
                        className="mt-1"
                    >
                        <div
                            ref={containerRef}
                            className={`scrollbar-hide flex overflow-x-auto`}
                        >
                            <div
                                className={`
                                  flex space-x-4 border-b-2 border-b-gray-200
                                  px-4 pb-0
                                `}
                            >
                                {tabs.map((tab, index) => (
                                    <button
                                        key={tab.id}
                                        ref={(el) => {
                                            tabsRef.current[
                                                index
                                            ] = el
                                        }}
                                        onClick={() =>
                                            handleMainTabClick(
                                                tab.id,
                                                index,
                                            )
                                        }
                                        className={cn(
                                            `
                                              flex-shrink-0 py-2 text-base
                                              font-medium whitespace-nowrap
                                              transition-all duration-200
                                            `,
                                            `
                                              relative
                                              hover:cursor-pointer
                                              hover:text-accent-violet-hover
                                              focus:outline-none
                                            `,
                                            'min-w-[100px] px-2',
                                            activeTab ===
                                                tab.id
                                                ? 'text-accent-violet-primary'
                                                : `
                                                  text-text-black
                                                  hover:text-text-gray
                                                `,
                                        )}
                                    >
                                        {tab.label}
                                        {activeTab ===
                                            tab.id && (
                                            <div
                                                className={`
                                                  absolute right-0 bottom-0
                                                  left-0 h-1.5 rounded-full
                                                  bg-accent-violet-primary
                                                `}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview контента активного таба */}
                    <div
                        className={`
                          relative mt-2 h-50 max-h-full overflow-hidden
                          rounded-b-md
                        `}
                    >
                        <TabContentPreview
                            chatKey={chatKey}
                            chatUid={chatUid}
                            activeTab={activeTab}
                            onParticipantsChange={
                                handleParticipantsChange
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Модальные окна */}
            <ClearChatModal
                open={clearChatModalOpen}
                onClose={() => setClearChatModalOpen(false)}
                onConfirm={handleClearChatConfirm}
                groupName={name}
            />
            {!isCurrentUserOwner && (
                <LeaveGroupModal
                    open={leaveChannelModalOpen}
                    onClose={() =>
                        setLeaveChannelModalOpen(false)
                    }
                    onConfirm={handleLeaveChannelConfirm}
                    groupName={name}
                />
            )}
            {isCurrentUserOwner && (
                <DeleteGroupModal
                    open={deleteChannelModalOpen}
                    onClose={() =>
                        setDeleteChannelModalOpen(false)
                    }
                    onConfirm={handleDeleteChannelConfirm}
                    groupName={name}
                />
            )}

            {/* Toast-уведомление */}
            <Toast
                open={toastOpen}
                onClose={() => setToastOpen(false)}
                message="Ссылка-приглашение скопирована"
                icon={
                    <Image
                        src="/icons/detailInfo/copyLink.svg"
                        alt=""
                        width={20}
                        height={20}
                        className="text-white"
                    />
                }
            />

            {/* Toast для удаления канала */}
            <Toast
                open={deletionToastOpen}
                onClose={handleCancelDeletion}
            >
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CountdownCircle
                            seconds={countdown}
                        />
                        <span className="text-sm font-medium">
                            Канал удалён
                        </span>
                    </div>
                    <button
                        onClick={handleCancelDeletion}
                        className={`
                          text-sm font-medium text-white transition-colors
                          hover:text-gray-200
                        `}
                    >
                        Отмена
                    </button>
                </div>
            </Toast>

            {/* Toast для выхода из канала */}
            <Toast
                open={leaveToastOpen}
                onClose={handleCancelLeave}
            >
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CountdownCircle
                            seconds={leaveCountdown}
                        />
                        <span className="text-sm font-medium">
                            Вы покинули канал
                        </span>
                    </div>
                    <button
                        onClick={handleCancelLeave}
                        className={`
                          text-sm font-medium text-white transition-colors
                          hover:text-gray-200
                        `}
                    >
                        Отмена
                    </button>
                </div>
            </Toast>

            {/* Toast для очистки чата */}
            <Toast
                open={clearToastOpen}
                onClose={handleCancelClear}
            >
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CountdownCircle
                            seconds={clearCountdown}
                        />
                        <span className="text-sm font-medium">
                            Чат очищен
                        </span>
                    </div>
                    <button
                        onClick={handleCancelClear}
                        className={`
                          text-sm font-medium text-white transition-colors
                          hover:text-gray-200
                        `}
                    >
                        Отмена
                    </button>
                </div>
            </Toast>
        </div>
    )
}
