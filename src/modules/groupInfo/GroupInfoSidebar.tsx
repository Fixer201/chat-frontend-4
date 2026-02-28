// GroupInfoSidebar.tsx
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

import TabContentPreview from './TabContentPreview' // Компонент предпросмотра контента вкладки (в основном режиме)
import TabLayout from './TabLayout' // Компонент лейаута для режима вкладки
import ParticipantsContent from './tabs/ParticipantsContent' // Контент вкладки "Участники"
import MediaContent from './tabs/MediaContent' // Контент вкладки "Медиа"
import FilesContent from './tabs/FilesContent' // Контент вкладки "Файлы"
import VoiceContent from './tabs/VoiceContent' // Контент вкладки "Голосовые"
import LinksContent from './tabs/LinksContent' // Контент вкладки "Ссылки"
import DropdownMenuButton from '@shared/ui/dropdown/DropdownMenu' // Выпадающее меню с действиями
import ClearChatModal from './modals/ClearChatModal' // Модалка очистки чата
import LeaveGroupModal from './modals/LeaveGroupModal' // Модалка выхода из группы
import DeleteGroupModal from './modals/DeleteGroupModal' // Модалка удаления группы
import { useGroupInfoSidebar } from './useGroupInfoSidebar' // Хук для управления состоянием сайдбара
import { getNoun } from '@shared/lib/getNoun' // Функция для склонения существительных
import {
    getChatByIdFromStorage,
    loadChatsFromStorage,
    saveChatsToStorage,
    updateChatInStorage,
} from '@shared/lib/localStorageChats' // Работа с localStorage для чатов
import EditGroupView from './EditGroupView' // Компонент редактирования группы
import { transformFromApi } from '@shared/lib/transformChatData' // Трансформация данных чата
import { ApiChatItem } from '@shared/types/chat' // Типы API чатов
import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard' // Хук для копирования в буфер
import { Toast } from '@shared/ui/toast/Toast' // Toast-уведомления
import { CountdownCircle } from '@shared/ui/countdown/CountdownCircle' // Кружок с обратным отсчётом для отмены действий

// Типы для вкладок
type TabId =
    | 'participants'
    | 'media'
    | 'files'
    | 'voice'
    | 'links'

// Функция для получения контента вкладки по её ID
function getTabContent(
    tabId: TabId,
    chatKey: string,
    chatUid: string,
    setDynamicTabTitle: (t: string | null) => void, // Колбэк для установки динамического заголовка
    onParticipantsChange?: (count: number) => void, // Колбэк при изменении количества участников
    isCurrentUserOwner?: boolean, // Флаг, является ли текущий пользователь владельцем
) {
    switch (tabId) {
        case 'participants':
            return (
                <ParticipantsContent
                    chatKey={chatKey}
                    onTitleChange={setDynamicTabTitle} // Может менять заголовок (например, "Участники (5)")
                    onParticipantsChange={
                        onParticipantsChange
                    }
                    isCurrentUserOwner={isCurrentUserOwner} // Передаём право на удаление участников
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

// Интерфейс пропсов компонента
interface GroupInfoSidebarProps {
    chatId: number // ID чата
    chatType: string // Тип чата (public-group, private-group и т.д.)
    chatKey: string // Уникальный ключ чата
    chatUid: string // UID чата
    name: string // Название группы
    participantsCount: number // Количество участников
    description?: string // Описание группы
    inviteLink?: string // Ссылка-приглашение
    notificationsEnabled: boolean // Статус уведомлений
    onNotificationsChange?: (enabled: boolean) => void // Колбэк изменения уведомлений
    onClose?: () => void // Колбэк закрытия сайдбара
    onClearChat?: (deleteForEveryone: boolean) => void // Колбэк очистки чата
    onLeaveGroup?: () => void // Колбэк выхода из группы
    onDeleteGroup?: () => void // Колбэк удаления группы
    avatarUrl?: string | null // URL аватара
    onGroupUpdated?: () => void // Колбэк обновления группы
    isCurrentUserOwner?: boolean // Является ли текущий пользователь владельцем
}

export default function GroupInfoSidebar({
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
    onLeaveGroup,
    onDeleteGroup,
    avatarUrl,
    onGroupUpdated,
    isCurrentUserOwner = false, // По умолчанию не владелец
}: GroupInfoSidebarProps) {
    // Состояния для модальных окон
    const [isCopied, setIsCopied] = useState(false) // Устаревшее, используется useCopyToClipboard
    const [clearChatModalOpen, setClearChatModalOpen] =
        useState(false) // Модалка очистки чата
    const [leaveGroupModalOpen, setLeaveGroupModalOpen] =
        useState(false) // Модалка выхода из группы
    const [deleteGroupModalOpen, setDeleteGroupModalOpen] =
        useState(false) // Модалка удаления группы
    const [
        participantsCountState,
        setParticipantsCountState,
    ] = useState(participantsCount) // Локальное состояние количества участников (обновляется динамически)
    const [isEditing, setIsEditing] = useState(false) // Режим редактирования группы
    const [copied, copyToClipboard] =
        useCopyToClipboard(700) // Хук для копирования (copied сбрасывается через 700мс)
    const [toastOpen, setToastOpen] = useState(false) // Toast "Ссылка скопирована"

    // Состояния для toast-ов с отменой действий
    const [deletionToastOpen, setDeletionToastOpen] =
        useState(false) // Toast удаления группы
    const [countdown, setCountdown] = useState(4) // Обратный отсчёт для удаления
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(
        null,
    ) // Таймер для удаления

    const [leaveToastOpen, setLeaveToastOpen] =
        useState(false) // Toast выхода из группы
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

    // Получаем все состояния и функции из кастомного хука
    const {
        activeTab,
        viewMode,
        isTransitioning,
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
    const handleEditGroup = useCallback(() => {
        setIsEditing(true)
    }, [])

    // Функция сжатия изображения для аватара
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
                    // Преобразуем в base64 JPEG с заданным качеством
                    resolve(
                        canvas.toDataURL(
                            'image/jpeg',
                            quality,
                        ),
                    )
                }
                img.onerror = reject
                img.src = URL.createObjectURL(file) // Создаём временный URL
            })
        },
        [],
    )

    // Сохранение отредактированных данных группы
    const handleSaveEdit = useCallback(
        async (updatedData: {
            name: string
            description: string
            type: string
            notificationsEnabled: boolean
            avatarFile?: File | null
        }) => {
            // Получаем текущие данные чата из localStorage
            const currentChat =
                getChatByIdFromStorage(chatId)
            if (!currentChat) return

            // Определяем новый тип чата (public-group или private-group)
            const newChatType =
                updatedData.type === 'open'
                    ? 'public-group'
                    : 'private-group'

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
            onGroupUpdated?.() // Уведомляем родителя об обновлении
        },
        [
            chatId,
            notificationsEnabled,
            onNotificationsChange,
            onGroupUpdated,
            compressImage,
        ],
    )

    // Обработчик изменения количества участников
    const handleParticipantsChange = useCallback(
        (newCount: number) => {
            setParticipantsCountState(newCount)
        },
        [],
    )

    // Копирование ссылки-приглашения
    const handleCopyLink = useCallback(() => {
        if (inviteLink) {
            copyToClipboard(inviteLink) // Копируем в буфер
            setToastOpen(true) // Показываем toast
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
            setClearChatModalOpen(false) // Закрываем модалку
            setClearToastOpen(true) // Показываем toast с обратным отсчётом
            setClearCountdown(4)

            // Запускаем таймер обратного отсчёта
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

                        // Вызов реальной очистки в следующем цикле событий
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

    // Выход из группы
    const handleLeaveGroupConfirm =
        useCallback(async () => {
            setLeaveGroupModalOpen(false)
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
                            onLeaveGroup?.()
                        }, 0)

                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }, [onLeaveGroup])

    // Отмена выхода
    const handleCancelLeave = useCallback(() => {
        if (leaveTimerRef.current) {
            clearInterval(leaveTimerRef.current)
            leaveTimerRef.current = null
        }
        setLeaveToastOpen(false)
        setLeaveCountdown(4)
    }, [])

    // Удаление группы (только для владельца)
    const handleDeleteGroupConfirm =
        useCallback(async () => {
            setDeleteGroupModalOpen(false)
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
                            onDeleteGroup?.()
                        }, 0)

                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }, [onDeleteGroup])

    // Отмена удаления
    const handleCancelDeletion = useCallback(() => {
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current)
            countdownTimerRef.current = null
        }
        setDeletionToastOpen(false)
        setCountdown(4)
    }, [])

    // Очистка таймеров при размонтировании
    useEffect(() => {
        return () => {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current)
            }
            if (leaveTimerRef.current) {
                clearInterval(leaveTimerRef.current)
            }
            if (clearTimerRef.current) {
                clearInterval(clearTimerRef.current)
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
                dynamicTitle={dynamicTabTitle || undefined} // Динамический заголовок (например, "Участники (5)")
                onScroll={handleTabScrollEvent} // Обработчик скролла для возврата
                onAttemptReturn={handleAttemptReturn} // Попытка возврата свайпом
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
                    isCurrentUserOwner, // Передаём флаг владельца для вкладки участников
                )}
            </TabLayout>
        )
    }

    // Режим редактирования группы
    if (isEditing) {
        return (
            <EditGroupView
                initialName={name}
                initialDescription={description || ''}
                initialType={
                    chatType.includes('public')
                        ? 'open'
                        : 'closed'
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

    // Основной режим (информация о группе)
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
                    />
                </Button>

                <h2
                    className={`
                      ml-3 flex-1 text-left text-lg font-medium
                      tracking-extra-tight text-text-black
                    `}
                >
                    Информация о группе
                </h2>

                <div className="flex items-center gap-3">
                    {/* Кнопка редактирования доступна только владельцу */}
                    {isCurrentUserOwner && (
                        <Button
                            onClick={handleEditGroup}
                            aria-label="Редактировать группу"
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

                    {/* Выпадающее меню с действиями */}
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
                        ariaLabel="Настройки группы"
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
                            // Пункт "Покинуть группу" для всех, кроме владельца
                            !isCurrentUserOwner && {
                                label: 'Покинуть группу',
                                icon: (
                                    <Image
                                        src="/icons/leave.svg"
                                        alt=""
                                        width={24}
                                        height={24}
                                    />
                                ),
                                onClick: () =>
                                    setLeaveGroupModalOpen(
                                        true,
                                    ),
                                hasDivider: true, // Разделитель перед пунктом
                            },
                            // Пункт "Удалить группу" только для владельца
                            isCurrentUserOwner && {
                                label: 'Удалить группу',
                                icon: (
                                    <Image
                                        src="/icons/delete.svg"
                                        alt=""
                                        width={24}
                                        height={24}
                                    />
                                ),
                                onClick: () =>
                                    setDeleteGroupModalOpen(
                                        true,
                                    ),
                                hasDivider: true,
                                isDanger: true, // Красный цвет для опасного действия
                            },
                        ].filter(Boolean)} // Отфильтровываем false (убираем неактуальные пункты)
                    />
                </div>
            </div>

            {/* Основной контент (скроллируемый) */}
            <div
                ref={mainContentRef}
                className={cn(
                    'scrollbar-hide flex-1 overflow-auto',
                    'h-[calc(100%-64px)] touch-none overscroll-none', // Отключаем стандартные жесты браузера
                )}
                onWheel={handleMainWheel} // Обработчик колесика
                onTouchStart={handleMainTouchStart} // Обработчик touch-событий
                onTouchMove={handleMainTouchMove}
                onScroll={handleMainScroll} // Обработчик скролла
            >
                <div className="relative">
                    {/* Аватар группы на весь экран */}
                    <div className="relative h-60 w-full overflow-hidden">
                        <Image
                            key={avatarUrl}
                            src={avatarSrc}
                            alt={name}
                            fill
                            className="object-cover"
                            onError={handleAvatarError} // При ошибке загрузки - заглушка
                            priority // Приоритетная загрузка (LCP)
                        />
                    </div>
                    {/* Градиент с названием и количеством участников */}
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
                                'участник',
                                'участника',
                                'участников',
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

                    {/* Описание группы */}
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

                    {/* Ссылка-приглашение (только для публичных групп) */}
                    {chatType === 'public-group' &&
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
                                        приглашение в группу
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

                    {/* Горизонтальные табы */}
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
                                        {/* Индикатор активного таба (полоска снизу) */}
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

                    {/* Preview контента активного таба (в основном режиме) */}
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
            {/* Показываем LeaveGroupModal только если пользователь НЕ владелец */}
            {!isCurrentUserOwner && (
                <LeaveGroupModal
                    open={leaveGroupModalOpen}
                    onClose={() =>
                        setLeaveGroupModalOpen(false)
                    }
                    onConfirm={handleLeaveGroupConfirm}
                    groupName={name}
                />
            )}
            {/* Показываем DeleteGroupModal только если пользователь владелец */}
            {isCurrentUserOwner && (
                <DeleteGroupModal
                    open={deleteGroupModalOpen}
                    onClose={() =>
                        setDeleteGroupModalOpen(false)
                    }
                    onConfirm={handleDeleteGroupConfirm}
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
                        className="text-white"
                    />
                }
            />

            {/* Toast для удаления группы с отменой */}
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
                            Группа удалена
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

            {/* Toast для выхода из группы с отменой */}
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
                            Вы покинули Группу
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
