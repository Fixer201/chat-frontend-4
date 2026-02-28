'use client'

import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import Search from '@shared/ui/Search'
import { useChats } from '@shared/hooks/useChats'
import { createEscapeKeyHandler } from '@shared/lib/keyboard-handlers'
import { formatLastSeen } from '@shared/lib/formatLastSeen'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import getAvatarSrc from '@shared/lib/getAvatarSrc'
import type { ChatItem } from '@shared/types/chat'

/**
 * Модальное окно пересылки сообщения — выбор чата-получателя.
 *
 * Содержит поле поиска с фильтрацией по имени контакта
 * и список чатов с аватарами и статусами онлайн.
 * При клике по чату вызывает onConfirm с массивом chatKey
 * и автоматически закрывается.
 *
 * Реализация модалки — кастомная (не через shared Modal),
 * так как требуется нестандартная разметка со списком и поиском.
 */
interface ForwardMessageModalProps {
    open: boolean
    onClose: () => void
    /** Колбэк подтверждения: принимает массив chatKey выбранных чатов */
    onConfirm: (selectedChatKeys: string[]) => void
    loading?: boolean
}

export default function ForwardMessageModal({
    open,
    onClose,
    onConfirm,
    loading = false,
}: Readonly<ForwardMessageModalProps>) {
    const [searchValue, setSearchValue] = useState('')
    const { chats } = useChats()
    const contactsList = useSelector(
        (state: RootState) => state.contacts.list,
    )

    // Вычисляет отображаемое имя чата с fallback-логикой,
    // аналогичной ChatsList: chat.name → контакт → профиль чата
    const getDisplayName = useCallback(
        (chat: ChatItem): string => {
            if (chat.name) return chat.name

            if (chat.chatType === 'chat') {
                const contactMatch = contactsList.find(
                    (contact) =>
                        contact.userUid === chat.chat.uid ||
                        contact.uid === chat.chat.uid,
                )
                if (contactMatch) {
                    const contactName =
                        `${contactMatch.firstName || ''} ${contactMatch.lastName || ''}`.trim() ||
                        contactMatch.nickname ||
                        contactMatch.phone ||
                        chat.chat.nickname ||
                        chat.chat.username
                    if (contactName) return contactName
                }
            }

            return (
                `${chat.chat.firstName || ''} ${chat.chat.lastName || ''}`.trim() ||
                chat.chat.nickname ||
                chat.chat.username ||
                'Неизвестный чат'
            )
        },
        [contactsList],
    )

    // Возвращает URL аватара с учётом данных контакта
    const getItemAvatarSrc = useCallback(
        (chat: ChatItem): string => {
            if (chat.chatType === 'chat') {
                const contactMatch = contactsList.find(
                    (contact) =>
                        contact.userUid === chat.chat.uid ||
                        contact.uid === chat.chat.uid,
                )
                if (contactMatch)
                    return getAvatarSrc(contactMatch)
            }
            return getAvatarSrc(chat.chat)
        },
        [contactsList],
    )

    // Фильтрация чатов по имени — регистронезависимый поиск по подстроке.
    // При пустом поиске возвращаем полный список без лишних итераций.
    const filteredChats = useMemo(() => {
        if (!searchValue.trim()) return chats
        const q = searchValue.toLowerCase()
        return chats.filter((chat) =>
            getDisplayName(chat).toLowerCase().includes(q),
        )
    }, [chats, searchValue, getDisplayName])

    // Выбор чата: оборачиваем chatKey в массив для совместимости с API,
    // рассчитанным на множественный выбор (мультипересылка в будущем)
    const handleSelect = (chatKey: string) => {
        onConfirm([chatKey])
        handleClose()
    }

    // Закрытие модалки: обязательно сбрасываем поисковый запрос,
    // чтобы при повторном открытии список не был отфильтрован
    const handleClose = () => {
        setSearchValue('')
        onClose()
    }

    // Обработчик Escape: закрывает модалку по нажатию клавиши
    const handleKeyDown =
        createEscapeKeyHandler(handleClose)

    if (!open) return null

    return (
        <div
            className={`
              fixed inset-0 z-[9999] flex items-center justify-center
              bg-violet-shadow-dark
            `}
            onClick={handleClose}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Переслать"
        >
            <div
                className={`
                  flex w-full max-w-md flex-col overflow-hidden rounded-md
                  bg-white-bg shadow-context-shadow
                `}
                style={{ maxHeight: '60vh' }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
            >
                {/* Шапка модалки: заголовок «Переслать» и кнопка закрытия */}
                <div
                    className={`
                      flex items-center justify-between border-b
                      border-gray-border px-4 py-3
                    `}
                >
                    <span className="text-base font-medium text-text-black">
                        Переслать
                    </span>
                    {/* Кнопка закрытия: cursor-pointer + hover для визуальной обратной связи */}
                    <button
                        type="button"
                        onClick={handleClose}
                        className={`
                          cursor-pointer rounded-lg p-1 text-text-gray
                          transition-colors
                          hover:bg-gray-main hover:text-text-black
                          focus-visible:outline-2
                          focus-visible:outline-accent-violet-primary
                          active:scale-95
                        `}
                    >
                        <Image
                            src="/images/search/iconsClose.svg"
                            alt="Закрыть"
                            width={20}
                            height={20}
                        />
                    </button>
                </div>

                {/* Поиск */}
                <div className="px-4 py-2">
                    <Search
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Поиск"
                    />
                </div>

                {/* Список чатов: каждый элемент — кнопка с аватаром, именем и статусом.
                    При отсутствии результатов поиска показываем заглушку «Ничего не найдено». */}
                <div className="custom-scroll flex-1 overflow-y-auto">
                    {filteredChats.length === 0 ? (
                        <div className="py-8 text-center text-sm text-text-gray">
                            Ничего не найдено
                        </div>
                    ) : (
                        filteredChats.map((chat) => (
                            <button
                                key={chat.id}
                                type="button"
                                disabled={loading}
                                onClick={() =>
                                    handleSelect(
                                        chat.chatKey,
                                    )
                                }
                                className={`
                                  flex w-full cursor-pointer items-center gap-3
                                  px-4 py-2.5 transition-colors
                                  hover:bg-accent-violet-ultra-light
                                `}
                            >
                                <div
                                    className={`
                                      relative h-10 w-10 shrink-0
                                      overflow-hidden rounded-full bg-gray-200
                                    `}
                                >
                                    <Image
                                        src={getItemAvatarSrc(
                                            chat,
                                        )}
                                        alt={getDisplayName(
                                            chat,
                                        )}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                    />
                                </div>
                                <div
                                    className={`
                                      flex min-w-0 flex-col items-start
                                    `}
                                >
                                    <span
                                        className={`
                                          max-w-full truncate text-sm
                                          font-medium text-text-black
                                        `}
                                    >
                                        {getDisplayName(
                                            chat,
                                        )}
                                    </span>
                                    <span
                                        className={`
                                          max-w-full truncate text-xs
                                          ${
                                              chat.chat
                                                  .isOnline
                                                  ? 'text-accent-violet-primary'
                                                  : 'text-text-gray'
                                          }
                                        `}
                                    >
                                        {chat.chat.isOnline
                                            ? 'в сети'
                                            : formatLastSeen(
                                                  chat.chat
                                                      .wasOnlineAt *
                                                      1000,
                                              )}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
