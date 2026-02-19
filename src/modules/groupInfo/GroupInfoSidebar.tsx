'use client'

import { cn } from '@shared/lib/utils'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import { useState, useCallback } from 'react'

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
) {
    switch (tabId) {
        case 'participants':
            return (
                <ParticipantsContent
                    chatKey={chatKey}
                    onTitleChange={setDynamicTabTitle}
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
interface GroupInfoSidebarProps {
    chatKey: string
    chatUid: string
    /** Название группы */
    name: string
    /** Количество участников */
    participantsCount: number
    /** Описание группы (опционально) */
    description?: string
    /** Ссылка-приглашение (опционально) */
    inviteLink?: string
    /** Текущее состояние уведомлений */
    notificationsEnabled: boolean
    /** Колбэк при изменении уведомлений */
    onNotificationsChange?: (enabled: boolean) => void
    /** Колбэк при закрытии сайдбара */
    onClose?: () => void
    /** Колбэк при очистке чата */
    onClearChat?: (deleteForEveryone: boolean) => void
    /** Колбэк при выходе из группы */
    onLeaveGroup?: () => void
    /** Колбэк при удалении группы */
    onDeleteGroup?: () => void
}
export default function GroupInfoSidebar({
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
}: GroupInfoSidebarProps) {
    const [isCopied, setIsCopied] = useState(false)

    // Модальные окна
    const [clearChatModalOpen, setClearChatModalOpen] =
        useState(false)
    const [leaveGroupModalOpen, setLeaveGroupModalOpen] =
        useState(false)
    const [deleteGroupModalOpen, setDeleteGroupModalOpen] =
        useState(false)

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

    const handleCopyLink = useCallback(() => {
        if (!inviteLink) return
        navigator.clipboard.writeText(inviteLink)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 700)
    }, [inviteLink])

    const handleToggleNotifications = useCallback(() => {
        onNotificationsChange?.(!notificationsEnabled)
    }, [notificationsEnabled, onNotificationsChange])

    // Обработчики для модалок
    const handleClearChatConfirm = useCallback(
        async (deleteForEveryone: boolean) => {
            await onClearChat?.(deleteForEveryone)
            setClearChatModalOpen(false)
        },
        [onClearChat],
    )

    const handleLeaveGroupConfirm =
        useCallback(async () => {
            await onLeaveGroup?.()
            setLeaveGroupModalOpen(false)
        }, [onLeaveGroup])

    const handleDeleteGroupConfirm =
        useCallback(async () => {
            await onDeleteGroup?.()
            setDeleteGroupModalOpen(false)
        }, [onDeleteGroup])

    // Режим таба — отдельный layout
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
                )}
            </TabLayout>
        )
    }

    // Главный режим
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
                  ml-3 flex-1 text-left text-lg font-medium tracking-extra-tight
                  text-text-black
                `}
                >
                    Информация о группе
                </h2>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() =>
                            console.log(
                                'Дополнительные настройки',
                            )
                        }
                        aria-label="Дополнительные настройки"
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
                            alt="Детальные настройки"
                            width={24}
                            height={24}
                        />
                    </Button>

                    <DropdownMenuButton
                        triggerIcon={
                            <Image
                                src="/icons/detailInfo/detailInfoDropdown.svg"
                                alt="Настройки"
                                width={24}
                                height={24}
                                className={`
                              hover:cursor-pointer
                            `}
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
                            {
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
                                hasDivider: true,
                            },
                            {
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
                                isDanger: true,
                            },
                        ]}
                    />
                </div>
            </div>

            {/* Основной контент */}
            <div
                ref={mainContentRef}
                className={cn(
                    'scrollbar-hide flex-1 overflow-auto',
                    `
                  h-[calc(100%-64px)] touch-none overscroll-none
                `,
                )}
                onWheel={handleMainWheel}
                onTouchStart={handleMainTouchStart}
                onTouchMove={handleMainTouchMove}
                onScroll={handleMainScroll}
            >
                {/* Обложка группы */}
                <div className="relative">
                    <div className="relative h-60 w-full overflow-hidden">
                        <Image
                            src="/images/tempSIdebarInfo.png"
                            alt="Группа"
                            fill
                            className={`
                          object-cover
                        `}
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
                            {participantsCount}{' '}
                            {getNoun(
                                participantsCount,
                                'участник',
                                'участника',
                                'участников',
                            )}
                        </p>
                    </div>
                </div>

                {/* Блок с уведомлениями и информацией */}
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
                                    : `
                                  bg-gray-300
                                `,
                            )}
                        >
                            <span
                                className={cn(
                                    `
                                  inline-block h-6 w-6 transform rounded-full
                                  bg-white transition-transform
                                `,
                                    notificationsEnabled
                                        ? 'translate-x-6'
                                        : `
                                  translate-x-1
                                `,
                                )}
                            />
                        </button>
                    </div>

                    {/* Описание */}
                    {description && (
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
                                <span className="p-0 text-base text-black">
                                    {description}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Ссылка-приглашение */}
                    {inviteLink && (
                        <div className="mx-0 my-1 rounded-md bg-white-bg p-1">
                            <div className="flex flex-col justify-between p-0.5">
                                <span
                                    className={`
                                  mb-1 p-0 text-xs font-medium
                                  tracking-extra-tight text-text-gray
                                `}
                                >
                                    Ссылка на приглашение в
                                    группу
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
                                                isCopied
                                                    ? `
                                              opacity-50
                                            `
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
                            className={`
                          scrollbar-hide flex overflow-x-auto
                        `}
                        >
                            <div
                                className={`
                              flex space-x-4 border-b-2 border-b-gray-200 px-4
                              pb-0
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
                                              absolute right-0 bottom-0 left-0
                                              h-1.5 rounded-full
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
                      relative mt-2 h-50 max-h-full overflow-hidden rounded-b-md
                    `}
                    >
                        <TabContentPreview
                            chatKey={chatKey}
                            chatUid={chatUid}
                            activeTab={activeTab}
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
            <LeaveGroupModal
                open={leaveGroupModalOpen}
                onClose={() =>
                    setLeaveGroupModalOpen(false)
                }
                onConfirm={handleLeaveGroupConfirm}
                groupName={name}
            />
            <DeleteGroupModal
                open={deleteGroupModalOpen}
                onClose={() =>
                    setDeleteGroupModalOpen(false)
                }
                onConfirm={handleDeleteGroupConfirm}
                groupName={name}
            />
        </div>
    )
}
