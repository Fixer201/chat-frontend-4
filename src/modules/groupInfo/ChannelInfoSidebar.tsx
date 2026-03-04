// ChannelInfoSidebar.tsx
'use client'

import { cn } from '@shared/lib/utils'
import type { MenuItem } from '@shared/ui/dropdown/DropdownMenu'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import {
    useState,
    useCallback,
    useEffect,
    useRef,
} from 'react'

import TabContentPreview from './TabContentPreview' // Компонент предпросмотра контента вкладки
import TabLayout from './TabLayout' // Лейаут для режима полноэкранной вкладки
import ParticipantsContent from './tabs/ParticipantsContent' // Контент вкладки "Участники"
import MediaContent from './tabs/MediaContent' // Контент вкладки "Медиа"
import FilesContent from './tabs/FilesContent' // Контент вкладки "Файлы"
import VoiceContent from './tabs/VoiceContent' // Контент вкладки "Голосовые"
import LinksContent from './tabs/LinksContent' // Контент вкладки "Ссылки"
import DropdownMenuButton from '@shared/ui/dropdown/DropdownMenu' // Выпадающее меню с действиями
import ClearChatModal from './modals/ClearChatModal' // Модалка очистки чата
import LeaveGroupModal from './modals/LeaveGroupModal' // Модалка выхода (переиспользуется для канала)
import DeleteGroupModal from './modals/DeleteGroupModal' // Модалка удаления (переиспользуется для канала)
import { useGroupInfoSidebar } from './useGroupInfoSidebar' // Хук для управления состоянием сайдбара
import { getNoun } from '@shared/lib/getNoun' // Функция для склонения существительных
import {
    getChatByIdFromStorage,
    loadChatsFromStorage,
    saveChatsToStorage,
} from '@shared/lib/localStorageChats' // Работа с localStorage для чатов
import EditChannelView from './EditChannelView' // Компонент редактирования канала
import { transformFromApi } from '@shared/lib/transformChatData' // Трансформация данных чата
import { ApiChatItem } from '@shared/types/chat' // Типы API чатов
import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard' // Хук для копирования в буфер
import { Toast } from '@shared/ui/toast/Toast' // Toast-уведомления
import { CountdownCircle } from '@shared/ui/countdown/CountdownCircle' // Кружок с обратным отсчётом

// Типы для вкладок (аналогично GroupInfoSidebar)
type TabId =
    | 'participants'
    | 'media'
    | 'files'
    | 'voice'
    | 'links'

// Функция для получения контента вкладки по ID (аналогично GroupInfoSidebar)
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
                    onTitleChange={setDynamicTabTitle} // Может менять заголовок (например, "Подписчики (5)")
                    onParticipantsChange={
                        onParticipantsChange
                    }
                    isCurrentUserOwner={isCurrentUserOwner} // Передаём флаг владельца
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

// Интерфейс пропсов компонента канала
interface ChannelInfoSidebarProps {
    chatId: number // ID чата
    chatType: string // Тип чата (public-channel, private-channel)
    chatKey: string // Уникальный ключ чата
    chatUid: string // UID чата
    name: string // Название канала
    participantsCount: number // Количество подписчиков
    description?: string // Описание канала
    inviteLink?: string // Ссылка-приглашение
    notificationsEnabled: boolean // Статус уведомлений
    onNotificationsChange?: (enabled: boolean) => void // Колбэк изменения уведомлений
    onClose?: () => void // Колбэк закрытия сайдбара
    onClearChat?: (deleteForEveryone: boolean) => void // Колбэк очистки чата
    onLeaveChannel?: () => void // Колбэк выхода из канала
    onDeleteChannel?: () => void // Колбэк удаления канала
    avatarUrl?: string | null // URL аватара
    onChannelUpdated?: () => void // Колбэк обновления канала
    isCurrentUserOwner?: boolean // Является ли текущий пользователь владельцем
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
    isCurrentUserOwner = false, // По умолчанию не владелец
}: ChannelInfoSidebarProps) {
    // Состояния для модальных окон
    const [isCopied, setIsCopied] = useState(false) // Устаревшее, используется useCopyToClipboard
    const [clearChatModalOpen, setClearChatModalOpen] =
        useState(false) // Модалка очистки чата
    const [
        leaveChannelModalOpen,
        setLeaveChannelModalOpen,
    ] = useState(false) // Модалка выхода из канала
    const [
        deleteChannelModalOpen,
        setDeleteChannelModalOpen,
    ] = useState(false) // Модалка удаления канала
    const [
        participantsCountState,
        setParticipantsCountState,
    ] = useState(participantsCount) // Локальное состояние количества подписчиков
    const [isEditing, setIsEditing] = useState(false) // Режим редактирования канала
    const [copied, copyToClipboard] =
        useCopyToClipboard(700) // Хук для копирования
    const [toastOpen, setToastOpen] = useState(false) // Toast "Ссылка скопирована"

    // Состояния для toast-ов с отменой действий
    const [deletionToastOpen, setDeletionToastOpen] =
        useState(false) // Toast удаления канала
    const [countdown, setCountdown] = useState(4) // Обратный отсчёт для удаления
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(
        null,
    ) // Таймер для удаления

    const [leaveToastOpen, setLeaveToastOpen] =
        useState(false) // Toast выхода из канала
    const [leaveCountdown, setLeaveCountdown] = useState(4) // Обратный отсчёт для выхода
    const leaveTimerRef = useRef<NodeJS.Timeout | null>(
        null,
    ) // Таймер для выхода

    const [clearToastOpen, setClearToastOpen] =
        useState(false) // Toast очистки чата
    const [clearCountdown, setClearCountdown] = useState(4) // Обратный отсчёт для очистки
    const clearTimerRef = useRef<NodeJS.Timeout | null>(
        null,
    ) // Таймер для очистки

    // Обработка ошибки загрузки аватара
    const [avatarError, setAvatarError] = useState(false)
    const handleAvatarError = useCallback(() => {
        setAvatarError(true)
    }, [setAvatarError])

    // Вычисляем src для отображения (при ошибке показываем заглушку)
    const avatarSrc = avatarError
        ? '/images/altImage.png'
        : avatarUrl || '/images/altImage.png'

    // Получаем все состояния и функции из кастомного хука (тот же, что и для группы)
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

    // Переключение в режим редактирования
    const handleEditChannel = useCallback(() => {
        setIsEditing(true)
    }, [])

    // Функция сжатия изображения для аватара (аналогично группе)
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

                    // Пропорциональное уменьшение до maxWidth/maxHeight
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

    // Сохранение отредактированных данных канала
    const handleSaveEdit = useCallback(
        async (updatedData: {
            name: string
            description: string
            type: 'public' | 'private'
            notificationsEnabled: boolean
            avatarFile?: File | null
        }) => {
            // Получаем текущие данные чата из localStorage
            const currentChat =
                getChatByIdFromStorage(chatId)
            if (!currentChat) return

            // Определяем новый тип чата (public-channel или private-channel)
            const newChatType =
                updatedData.type === 'public'
                    ? 'public-channel'
                    : 'private-channel'

            // Создаём обновлённый объект чата
            const updatedChat: ApiChatItem = {
                ...currentChat,
            }
            updatedChat.name = updatedData.name
            updatedChat.description =
                updatedData.description
            updatedChat.chat_type = newChatType

            // Если выбран новый аватар - сжимаем и добавляем
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

            // Сохраняем в localStorage
            const allChats = loadChatsFromStorage() || []
            const index = allChats.findIndex(
                (c) => c.id === chatId,
            )
            if (index !== -1) {
                allChats[index] = updatedChat
                saveChatsToStorage(allChats)
            }

            // Если изменился статус уведомлений - вызываем колбэк
            if (
                updatedData.notificationsEnabled !==
                notificationsEnabled
            ) {
                onNotificationsChange?.(
                    updatedData.notificationsEnabled,
                )
            }

            setIsEditing(false) // Выходим из режима редактирования
            onChannelUpdated?.() // Уведомляем родителя об обновлении
        },
        [
            chatId,
            notificationsEnabled,
            onNotificationsChange,
            onChannelUpdated,
            compressImage,
        ],
    )

    // Обработчик изменения количества подписчиков
    const handleParticipantsChange = useCallback(
        (newCount: number) => {
            setParticipantsCountState(newCount)
        },
        [],
    )

    // Копирование ссылки-приглашения
    const handleCopyLink = useCallback(() => {
        if (inviteLink) {
            copyToClipboard(inviteLink)
            setToastOpen(true)
        }
    }, [inviteLink, copyToClipboard])

    // Переключение уведомлений
    const handleToggleNotifications = useCallback(() => {
        onNotificationsChange?.(!notificationsEnabled)
    }, [notificationsEnabled, onNotificationsChange])

    // --- Обработчики для действий с отложенным выполнением и возможностью отмены ---

    // Очистка чата
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

    // Отмена очистки
    const handleCancelClear = useCallback(() => {
        if (clearTimerRef.current) {
            clearInterval(clearTimerRef.current)
            clearTimerRef.current = null
        }
        setClearToastOpen(false)
        setClearCountdown(4)
    }, [])

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (clearTimerRef.current) {
                clearInterval(clearTimerRef.current)
            }
        }
    }, [])

    // Выход из канала
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

    // Отмена выхода
    const handleCancelLeave = useCallback(() => {
        if (leaveTimerRef.current) {
            clearInterval(leaveTimerRef.current)
            leaveTimerRef.current = null
        }
        setLeaveToastOpen(false)
        setLeaveCountdown(4)
    }, [])

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (leaveTimerRef.current) {
                clearInterval(leaveTimerRef.current)
            }
        }
    }, [])

    // Удаление канала (только для владельца)
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

    // Отмена удаления
    const handleCancelDeletion = useCallback(() => {
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current)
            countdownTimerRef.current = null
        }
        setDeletionToastOpen(false)
        setCountdown(4)
    }, [])

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current)
            }
        }
    }, [])

    // --- Рендер в зависимости от режима ---

    // Режим вкладки (полноэкранный контент)
    if (viewMode === 'tab') {
        return (
            <TabLayout
                activeTab={activeTab}
                onBack={handleBackFromTab} // Кнопка "Назад"
                onTabClick={handleTabContentTabClick} // Переключение вкладок внутри режима
                tabTitle={getTabTitle(activeTab)} // Заголовок по умолчанию
                dynamicTitle={dynamicTabTitle || undefined} // Динамический заголовок
                onScroll={handleTabScrollEvent} // Обработчик скролла для возврата
                onAttemptReturn={handleAttemptReturn} // Попытка возврата
                hideScrollbar={hideTabScrollbarDuringReturn} // Скрыть скроллбар при возврате
                initialScrollTop={
                    tabScrollPositions[activeTab] // Восстановление позиции скролла
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

    // Режим редактирования канала
    if (isEditing) {
        return (
            <EditChannelView
                initialName={name}
                initialDescription={description || ''}
                initialType={
                    chatType === 'public-channel'
                        ? 'public'
                        : 'private'
                }
                initialAvatarUrl={avatarUrl}
                initialNotificationsEnabled={
                    notificationsEnabled
                }
                inviteLink={inviteLink}
                onSave={handleSaveEdit} // Сохранение изменений
                onCancel={() => setIsEditing(false)} // Отмена редактирования
            />
        )
    }

    // Основной режим (информация о канале)
    return (
        <div
            className={`
              relative flex h-full flex-col overflow-hidden rounded-md
              bg-gray-main
            `}
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}
        >
            {/* Header с кнопкой закрытия и выпадающим меню */}
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
                        className="h-6 w-6"
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
                    {/* Кнопка редактирования доступна только владельцу */}
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
                                className="h-6 w-6"
                            />
                        </Button>
                    )}

                    {/* Выпадающее меню с действиями */}
                    <DropdownMenuButton
                        triggerIcon={
                            <Image
                                src="/icons/detailInfo/detailInfoDropdown.svg"
                                alt="Настройки"
                                width={24}
                                height={24}
                                className={`
                                  h-6 w-6
                                  hover:cursor-pointer
                                `}
                            />
                        }
                        triggerClassName="flex items-center justify-center rounded-full p-0 text-text-black hover:bg-accent-violet-ultra-light"
                        menuWidth={220}
                        placement="bottom-right"
                        ariaLabel="Настройки канала"
                        items={
                            [
                                {
                                    label: 'Очистить чат',
                                    icon: (
                                        <Image
                                            src="/icons/clean.svg"
                                            alt=""
                                            width={24}
                                            height={24}
                                            className="h-6 w-6"
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
                                            className="h-6 w-6"
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
                                            className="h-6 w-6"
                                        />
                                    ),
                                    onClick: () =>
                                        setDeleteChannelModalOpen(
                                            true,
                                        ),
                                    hasDivider: true,
                                    isDanger: true,
                                },
                            ].filter(Boolean) as MenuItem[]
                        }
                    />
                </div>
            </div>

            {/* Основной контент (скроллируемый) */}
            <div
                ref={mainContentRef}
                className={cn(
                    'scrollbar-hide flex-1 overflow-auto',
                    'h-[calc(100%-64px)] touch-none overscroll-none', // Отключаем стандартные жесты
                )}
                onWheel={handleMainWheel}
                onTouchStart={handleMainTouchStart}
                onTouchMove={handleMainTouchMove}
                onScroll={handleMainScroll}
            >
                <div className="relative">
                    {/* Аватар канала на весь экран */}
                    <div className="relative h-60 w-full overflow-hidden">
                        <Image
                            key={avatarUrl}
                            src={avatarSrc}
                            alt={name}
                            fill
                            className="object-cover"
                            onError={handleAvatarError} // При ошибке - заглушка
                            priority
                        />
                    </div>
                    {/* Градиент с названием и количеством подписчиков */}
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
                    {/* Переключатель уведомлений */}
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

                    {/* Описание канала */}
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
                                  p-0 text-base break-words text-text-black
                                `}
                            >
                                {description ||
                                    'пустое описание'}
                            </span>
                        </div>
                    </div>

                    {/* Ссылка-приглашение (только для публичных каналов) */}
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
                                                    'h-6 w-6',
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

                    {/* Горизонтальные табы (аналогично группе) */}
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
                                  flex space-x-4 border-b-2 border-b-gray-border
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
                                              hover:text-accent-violet-primary
                                              focus:outline-none
                                            `,
                                            'min-w-25 px-2',
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
                                        {/* Индикатор активного таба */}
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
            {/* Показываем LeaveGroupModal если пользователь НЕ владелец (переиспользуем для канала) */}
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
            {/* Показываем DeleteGroupModal если пользователь владелец (переиспользуем для канала) */}
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

            {/* Toast-уведомления */}
            {/* Простой toast для скопированной ссылки */}
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
                        className="h-5 w-5 text-white"
                    />
                }
            />

            {/* Toast для удаления канала с отменой */}
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

            {/* Toast для выхода из канала с отменой */}
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

            {/* Toast для очистки чата с отменой */}
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
