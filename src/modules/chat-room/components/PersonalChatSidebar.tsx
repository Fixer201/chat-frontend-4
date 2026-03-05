'use client'

import { cn } from '@shared/lib/utils'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import {
    useState,
    useCallback,
    useEffect,
    useRef,
    useMemo,
} from 'react'

import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard'
import { Toast } from '@shared/ui/toast/Toast'
import { CountdownCircle } from '@shared/ui/countdown/CountdownCircle'
import { getStatusText } from '@shared/lib/getStatusText'
import getAvatarSrc from '@shared/lib/getAvatarSrc'
import { Contact } from '@shared/hooks/useContactData'
import MediaContent from '@modules/groupInfo/tabs/MediaContent'
import FilesContent from '@modules/groupInfo/tabs/FilesContent'
import VoiceContent from '@modules/groupInfo/tabs/VoiceContent'
import LinksContent from '@modules/groupInfo/tabs/LinksContent'
import NewTabLayout from '@modules/groupInfo/NewTabLayout'
import DropdownMenuButton from '@shared/ui/dropdown/DropdownMenu'
import TabContentPreview from '@modules/groupInfo/TabContentPreview'
import ClearChatModal from '@modules/groupInfo/modals/ClearChatModal'
import { formatBirthday } from '@shared/lib/formatDateBirthday'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { useAddContact } from '@shared/hooks/useAddContact'
import { useApiFetcher } from '@shared/hooks/useApiFetcher'
import BlockModal from '@modules/chats-list/components/BlockModal'

// Типы для вкладок
type TabId = 'media' | 'files' | 'voice' | 'links'

// Контент для полноэкранной вкладки
function getTabContent(tabId: TabId, chatUid: string) {
    switch (tabId) {
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

interface PersonalChatSidebarProps {
    contact: Contact // данные собеседника
    chatKey: string // уникальный ключ чата
    chatUid: string // UID чата
    notificationsEnabled: boolean // статус уведомлений
    onNotificationsChange?: (enabled: boolean) => void
    onClose: () => void
    onClearChat?: (deleteForEveryone: boolean) => void
}

export default function PersonalChatSidebar({
    contact,
    chatKey,
    chatUid,
    notificationsEnabled,
    onNotificationsChange,
    onClose,
    onClearChat,
}: PersonalChatSidebarProps) {
    // Состояния для модалок и toast
    const [clearChatModalOpen, setClearChatModalOpen] =
        useState(false)
    const [clearToastOpen, setClearToastOpen] =
        useState(false)
    const [clearCountdown, setClearCountdown] = useState(4)
    const clearTimerRef = useRef<NodeJS.Timeout | null>(
        null,
    )

    // Состояния вкладок
    const [activeTab, setActiveTab] =
        useState<TabId>('media')
    const [viewMode, setViewMode] = useState<
        'main' | 'tab'
    >('main')

    // Хук для копирования в буфер обмена
    const [copiedNickname, copyNicknameToClipboard] =
        useCopyToClipboard(700)
    const [copiedPhone, copyPhoneToClipboard] =
        useCopyToClipboard(700)

    // Хук для добавления в контакты
    const { addContact, isAdding: isAddingToContacts } =
        useAddContact()

    // Имя для отображения
    const displayName = useMemo(() => {
        return (
            `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
            contact.nickname ||
            contact.phone ||
            contact.username ||
            'Контакт'
        )
    }, [contact])

    // Статус
    const statusText = useMemo(() => {
        return getStatusText(contact, '')
    }, [contact])

    // Обработчик ошибки загрузки аватара
    const [avatarError, setAvatarError] = useState(false)
    const handleAvatarError = useCallback(
        () => setAvatarError(true),
        [],
    )
    const avatarSrc = avatarError
        ? '/images/altImage.png'
        : getAvatarSrc(contact)

    // Переключение уведомлений
    const handleToggleNotifications = useCallback(() => {
        onNotificationsChange?.(!notificationsEnabled)
    }, [notificationsEnabled, onNotificationsChange])

    // Получаем список контактов из Redux
    const contactsList = useSelector(
        (state: RootState) => state.contacts.list,
    )

    // Проверка, есть ли контакт в списке контактов
    const isContactInList = useMemo(() => {
        if (
            !contact.uid &&
            !contact.nickname &&
            !contact.phone
        )
            return false

        return contactsList.some(
            (c) =>
                c.uid === contact.uid ||
                c.userUid === contact.uid ||
                (contact.nickname &&
                    c.nickname === contact.nickname) ||
                (contact.phone &&
                    c.phone === contact.phone),
        )
    }, [
        contactsList,
        contact.uid,
        contact.nickname,
        contact.phone,
    ])

    //состояние для блокировки контакта
    const [blockModalOpen, setBlockModalOpen] =
        useState(false)

    // функция подтверждения блокировки
    const fetchData = useApiFetcher()

    const handleBlockConfirm = useCallback(async () => {
        try {
            // эндпоинт может отличаться, уточните в API
            await fetchData(
                `/api/v1/contact/blacklist/add/${contact.uid}/`,
                {
                    method: 'POST',
                },
            )
            setBlockModalOpen(false)
            // после блокировки можно закрыть сайдбар или показать уведомление
            onClose() // например, закрыть сайдбар
        } catch (error) {
            console.error('Ошибка блокировки:', error)
        }
    }, [contact.uid, fetchData, onClose])

    // Очистка чата с отложенным выполнением и отменой
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

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (clearTimerRef.current)
                clearInterval(clearTimerRef.current)
        }
    }, [])

    // Переход в полноэкранный режим вкладки
    const handleMainTabClick = useCallback(
        (tabId: TabId) => {
            setActiveTab(tabId)
            setViewMode('tab')
        },
        [],
    )

    // Возврат из полноэкранного режима
    const handleBackFromTab = useCallback(() => {
        setViewMode('main')
    }, [])

    // Список вкладок для отображения
    const tabs = useMemo(
        () => [
            { id: 'media' as TabId, label: 'Медиа' },
            { id: 'files' as TabId, label: 'Файлы' },
            { id: 'voice' as TabId, label: 'Голосовые' },
            { id: 'links' as TabId, label: 'Ссылки' },
        ],
        [],
    )

    // Функция для копирования текста
    const handleCopyNickname = useCallback(() => {
        if (contact.nickname) {
            copyNicknameToClipboard(contact.nickname)
        }
    }, [contact.nickname, copyNicknameToClipboard])

    const handleCopyPhone = useCallback(() => {
        if (contact.phone) {
            copyPhoneToClipboard(contact.phone)
        }
    }, [contact.phone, copyPhoneToClipboard])

    // функция добавления в контакты
    const handleAddToContacts = useCallback(async () => {
        await addContact(contact)
    }, [addContact, contact])

    // Если мы в полноэкранном режиме вкладки
    if (viewMode === 'tab') {
        return (
            <NewTabLayout
                activeTab={activeTab}
                onBack={handleBackFromTab}
                onTabClick={(tabId) => {
                    setActiveTab(tabId as TabId)
                }}
                tabTitle={
                    tabs.find((t) => t.id === activeTab)
                        ?.label || ''
                }
            >
                {getTabContent(activeTab, chatUid)}
            </NewTabLayout>
        )
    }

    // Основной режим (информация о контакте + превью вкладок)
    return (
        <div
            className={`
              relative flex h-full flex-col overflow-hidden rounded-md
              bg-gray-main
            `}
        >
            {/* Шапка с кнопкой закрытия и меню */}
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
                      flex-1 text-left text-lg font-medium tracking-extra-tight
                      text-text-black
                    `}
                >
                    Информация
                </h2>

                <div className="flex items-center gap-3">
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
                        ariaLabel="Действия с чатом"
                        items={[
                            {
                                label: 'Поделиться профилем',
                                icon: (
                                    <Image
                                        src="/icons/share.svg"
                                        alt=""
                                        width={24}
                                        height={24}
                                    />
                                ),
                                //тут нужна логика пересылки профиля
                                onClick: () => {},
                            },

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
                            {
                                label: 'Заблокировать',
                                icon: (
                                    <Image
                                        src="/icons/block.svg"
                                        alt=""
                                        width={24}
                                        height={24}
                                    />
                                ),
                                onClick: () =>
                                    setBlockModalOpen(true),
                                className: 'text-text-red',
                            },
                        ]}
                    />
                </div>
            </div>

            {/* Основной контент (скроллируемый) */}
            <div className="flex-1 overflow-y-auto">
                {/* Большой аватар */}
                <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                        src={avatarSrc}
                        alt={displayName}
                        fill
                        className="object-cover"
                        onError={handleAvatarError}
                        priority
                    />
                    {/* Градиент с именем и статусом */}
                    <div
                        className={`
                          absolute right-0 bottom-0 left-0 rounded-b-md
                          bg-linear-to-t from-black/70 to-transparent p-4
                        `}
                    >
                        <h3 className="text-2xl font-semibold text-white">
                            {displayName}
                        </h3>
                        <p className="mt-1 text-lg text-white/90">
                            {statusText}
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 px-4 py-3">
                    {/* Переключатель уведомлений */}
                    <div
                        className={`
                          flex items-center justify-between border-b
                          border-gray-border pb-4
                        `}
                    >
                        <span className="text-base font-medium text-text-black">
                            Уведомления
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
                                    : 'bg-gray-300',
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
                                        : 'translate-x-1',
                                )}
                            />
                        </button>
                    </div>

                    {/* Блок информации о контакте */}
                    <div className="rounded-md bg-white py-4">
                        <div className="space-y-4">
                            {/* Никнейм (обязательный) - всегда показываем */}
                            <div
                                className={`
                                  flex min-h-14 items-center justify-between
                                `}
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs text-text-gray">
                                        Никнейм
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`
                                              text-base
                                              text-accent-violet-primary
                                            `}
                                        >
                                            @
                                        </span>
                                        <span
                                            className={`
                                              text-base
                                              text-accent-violet-primary
                                            `}
                                        >
                                            {contact.nickname ||
                                                ''}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    onClick={
                                        handleCopyNickname
                                    }
                                    aria-label="Копировать никнейм"
                                    variant="ghost"
                                    size="sm"
                                    className={`
                                      flex shrink-0 items-center justify-center
                                      self-center rounded-full p-0
                                      text-text-black
                                      hover:bg-accent-violet-ultra-light
                                    `}
                                >
                                    <Image
                                        src="/icons/detailInfo/copyLink.svg"
                                        alt="Копировать"
                                        width={24}
                                        height={24}
                                        className={cn(
                                            copiedNickname
                                                ? 'opacity-50'
                                                : 'opacity-100',
                                        )}
                                    />
                                </Button>
                            </div>

                            {/* Разделитель после никнейма */}
                            <div className="border-b border-gray-border"></div>

                            {/* Номер телефона (если есть) */}
                            {contact.phone && (
                                <>
                                    <div
                                        className={`
                                          flex min-h-14 items-center
                                          justify-between
                                        `}
                                    >
                                        <div className="flex flex-col">
                                            <span
                                                className={`
                                                  text-xs text-text-gray
                                                `}
                                            >
                                                Телефон
                                            </span>
                                            <span
                                                className={`
                                                  mt-0.5 text-base
                                                  text-accent-violet-primary
                                                `}
                                            >
                                                {
                                                    contact.phone
                                                }
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={
                                                handleCopyPhone
                                            }
                                            aria-label="Копировать номер телефона"
                                            variant="ghost"
                                            size="sm"
                                            className={`
                                              flex shrink-0 items-center
                                              justify-center self-center
                                              rounded-full p-0 text-text-black
                                              hover:bg-accent-violet-ultra-light
                                            `}
                                        >
                                            <Image
                                                src="/icons/detailInfo/copyLink.svg"
                                                alt="Копировать"
                                                width={24}
                                                height={24}
                                                className={cn(
                                                    copiedPhone
                                                        ? 'opacity-50'
                                                        : 'opacity-100',
                                                )}
                                            />
                                        </Button>
                                    </div>
                                    <div className="border-b border-gray-border"></div>
                                </>
                            )}

                            {/* Дата рождения (если есть) */}
                            {contact.birthday && (
                                <>
                                    <div
                                        className={`
                                          flex min-h-14 items-center
                                          justify-between
                                        `}
                                    >
                                        <div className="flex flex-col">
                                            <span
                                                className={`
                                                  text-xs text-text-gray
                                                `}
                                            >
                                                День
                                                рождения
                                            </span>
                                            <span
                                                className={`
                                                  mt-0.5 text-base
                                                  text-text-black
                                                `}
                                            >
                                                {formatBirthday(
                                                    contact.birthday,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="border-b border-gray-border"></div>
                                </>
                            )}

                            {/* О себе (если есть) */}
                            {contact.additionalInformation && (
                                <>
                                    <div className="flex min-h-14 flex-col">
                                        <span className="text-xs text-text-gray">
                                            О себе
                                        </span>
                                        <span
                                            className={`
                                              mt-0.5 text-base break-words
                                              text-text-black
                                            `}
                                        >
                                            {
                                                contact.additionalInformation
                                            }
                                        </span>
                                    </div>
                                    <div className="border-b border-gray-border"></div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Блок добавления в контакты (только если пользователь НЕ в контактах) */}
                    {!isContactInList && (
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={handleAddToContacts}
                            onKeyDown={(e) => {
                                if (
                                    e.key === 'Enter' ||
                                    e.key === ' '
                                ) {
                                    e.preventDefault()
                                    handleAddToContacts()
                                }
                            }}
                            className={cn(
                                `
                                  flex h-11 w-full items-center justify-between
                                  px-4
                                `,
                                `
                                  transition-colors
                                  hover:bg-accent-violet-ultra-light
                                `,
                                'cursor-pointer',
                                isAddingToContacts &&
                                    'cursor-wait opacity-70',
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Image
                                    src="/icons/addtoGroup.svg"
                                    alt=""
                                    width={16}
                                    height={16}
                                    className="text-accent-violet-primary"
                                />
                                <span
                                    className={`
                                      text-base text-accent-violet-primary
                                    `}
                                >
                                    {isAddingToContacts
                                        ? 'Добавление...'
                                        : 'Добавить в контакты'}
                                </span>
                            </div>

                            {isAddingToContacts && (
                                <div
                                    className={`
                                      h-4 w-4 animate-spin rounded-full border-2
                                      border-accent-violet-primary
                                      border-t-transparent
                                    `}
                                />
                            )}
                        </div>
                    )}

                    {/* Горизонтальные табы */}
                    <div className="mt-2">
                        <div className="scrollbar-hide flex overflow-x-auto">
                            <div
                                className={`
                                  flex space-x-4 border-b-2 border-b-gray-border
                                  px-4 pb-0
                                `}
                            >
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() =>
                                            handleMainTabClick(
                                                tab.id,
                                            )
                                        }
                                        className={cn(
                                            `
                                              relative min-w-25 shrink-0 px-2
                                              py-2 text-base font-medium
                                              whitespace-nowrap transition-all
                                              duration-200
                                              hover:cursor-pointer
                                              hover:text-accent-violet-primary
                                              focus:outline-none
                                            `,
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

                    {/* Превью контента активной вкладки */}
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
                            onParticipantsChange={() => {}}
                        />
                    </div>
                </div>
            </div>

            {/* Модальное окно очистки чата */}
            <ClearChatModal
                open={clearChatModalOpen}
                onClose={() => setClearChatModalOpen(false)}
                onConfirm={handleClearChatConfirm}
                groupName={displayName}
            />

            <BlockModal
                open={blockModalOpen}
                onClose={() => setBlockModalOpen(false)}
                onConfirm={handleBlockConfirm}
                contactName={displayName}
            />

            {/* Toast с отменой очистки */}
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
                          hover:text-text-gray
                        `}
                    >
                        Отмена
                    </button>
                </div>
            </Toast>
        </div>
    )
}
