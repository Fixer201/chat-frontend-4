'use client'
// Компонент списка чатов
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { useChats } from '@shared/hooks/useChats'
import { formatLastSeen } from '@shared/lib/formatLastSeen'
import { useSearch } from '@shared/hooks/useSearch'
import { ChatListItem } from './ChatListItem'
import ChatDeleteModal from './ChatDeleteModal'
import ChatSuccessToast from './ChatSuccessToast'
import EmptySearchState from '../../../shared/ui/emptySearchState/EmptySearchState'
import EmptyChatsState from './emptyChatsState/EmptyChatsState'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import { useRouter } from 'next/navigation'
import Search from '@shared/ui/Search'
import CreateMenuButton from './CreateMenuButton'
import { cn } from '@shared/lib/utils'
// Интерфейс пропсов компонента ChatsList
interface ChatsListProps {
    onCreateGroup?: () => void
    onCreateChannel?: () => void
}
// Основной компонент списка чатов
export default function ChatsList({
    onCreateGroup,
    onCreateChannel,
}: ChatsListProps) {
    // useRouter для навигации между страницами
    // В отличие от useNavigate в React Router, next/navigation использует useRouter
    const router = useRouter()
    // Состояние для значения поиска
    // Используем useState, а не useRef, потому что изменение должно вызывать ререндер
    const [searchValue, setSearchValue] = useState('')
    // Состояние для отображения модального окна удаления чата
    // Boolean состояние для управления видимостью модалки
    const [deleteModalOpen, setDeleteModalOpen] =
        useState(false)
    // Состояние для отслеживания процесса удаления (загрузки)
    // Нужно для блокировки UI во время асинхронной операции
    const [isDeleting, setIsDeleting] = useState(false)
    // Состояние для отображения тоста об успешном добавлении в контакты
    const [successToastOpen, setSuccessToastOpen] =
        useState(false)
    // Состояние для хранения имени добавленного контакта (для тоста)
    // Храним строку, чтобы показать в тосте, какой именно контакт добавлен
    const [addedContactName, setAddedContactName] =
        useState('')
    // Состояние для хранения информации о чате, который планируется удалить
    // Хранит объект {id, name} для отображения в модальном окне подтверждения
    const [chatToDelete, setChatToDelete] = useState<{
        id: number
        name: string
    } | null>(null)
    // Используем кастомный хук useChats для управления состоянием чатов
    // Этот хук абстрагирует работу с Redux и предоставляет простой API
    const {
        chats, // Массив чатов из Redux store, через хук useChats
        loading, // Флаг загрузки из Redux store, через хук useChats
        loadChats, // Функция загрузки чатов (thunk action), через хук useChats
        chatSettings, // Настройки для каждого чата (избранное, уведомления и т.д.)
        toggleFavorite: handleFavoriteChat, // Функция прикрепления/открепления
        toggleNotifications: handleMuteChat, // Функция включения/выключения уведомлений
        markAsRead: handleMarkAsRead, // Функция пометки как прочитанного
        markAsUnread: handleMarkAsUnread, // Функция пометки как непрочитанного
        deleteChat, // Функция удаления чата
        addToContacts, // Функция добавления в контакты
        selectedChatId, // ID выбранного чата
        selectChat, // Функция выбора чата
    } = useChats()

    // useEffect для загрузки чатов при монтировании компонента
    // Используем loadChats как зависимость, но он мемоизирован в хуке useChats
    useEffect(() => {
        loadChats(15) // Загружаем 15 чатов при первом рендере
    }, [loadChats]) // loadChats стабильна благодаря useCallback в хуке useChats

    // useCallback для мемоизации обработчика начала нового чата
    // Зависимость [router] - функция изменится только если изменится router
    const handleStartChat = useCallback(() => {
        router.push('/contacts')
    }, [router])

    // Массив статусов сообщений для демонстрационных целей
    // В реальном приложении получается с сервера для каждого сообщения
    const messageStatuses: (
        | 'sent'
        | 'delivered'
        | 'read'
        | null
    )[] = ['sent', 'delivered', 'read', null]

    // Используем хук useSearch для фильтрации чатов по строке поиска
    // Хук возвращает отфильтрованный массив на основе searchValue
    const { filteredValue } = useSearch(
        chats?.filter(
            (chat) => !chatSettings[chat.id]?.isDeleted, // Исключаем удаленные чаты из поиска
        ) || [], // fallback на пустой массив если chats undefined
        searchValue,
        [
            'chat.firstName', // Поиск по имени вложенного объекта
            'chat.lastName',
            (chat) =>
                `${chat.chat.firstName} ${chat.chat.lastName}`, // Поиск по полному имени (функция)
            'lastMessage.content', // Поиск по тексту последнего сообщения
        ],
    )

    // Сортируем чаты: избранные в начале списка
    // Используем spread оператор [...filteredValue] чтобы не мутировать оригинальный массив
    const sortedChats = [...filteredValue].sort((a, b) => {
        const aIsFavorite =
            chatSettings[a.id]?.isFavorite || false
        const bIsFavorite =
            chatSettings[b.id]?.isFavorite || false
        // Избранные чаты должны быть первыми (-1 означает, что a идет перед b)
        if (aIsFavorite && !bIsFavorite) return -1
        if (!aIsFavorite && bIsFavorite) return 1
        return 0 // Если оба избранные или оба не избранные - сохраняем порядок
    })

    // Функция выбора чата по клику
    // useCallback не используется, так как функция простая и не передается как prop
    const toSelectChat = (id: number): void => {
        if (id === selectedChatId) {
            selectChat(null) // Если чат уже выбран, снимаем выбор
        } else {
            selectChat(id) // Иначе выбираем чат
        }
    }

    // useCallback для обработчика клика по кнопке удаления чата
    // Мемоизация нужна, так как функция передается как prop в ChatListItem
    // и может вызывать лишние ререндеры дочерних компонентов без мемоизации
    const handleDeleteClick = useCallback(
        (chatId: number, chatName: string) => {
            // Сохраняем информацию о чате для модального окна
            setChatToDelete({ id: chatId, name: chatName })
            setDeleteModalOpen(true) // Открываем модальное окно
        },
        [],
    )

    // useCallback для обработчика подтверждения удаления чата
    // Асинхронная функция для имитации API запроса
    const handleDeleteConfirm = useCallback(async () => {
        if (!chatToDelete || isDeleting) return // Защита от повторных вызовов

        setIsDeleting(true)

        try {
            // Имитация задержки при удалении (в реальном приложении здесь был бы API-запрос)
            // Используем Promise для асинхронной задержки
            await new Promise((resolve) =>
                setTimeout(resolve, 1000),
            )

            console.log('Удалить чат:', chatToDelete.id)
            // Вызываем функцию удаления из хука useChats
            // В реальном приложении здесь был бы dispatch Redux action
            deleteChat(chatToDelete.id) // Вызываем функцию удаления из хука useChats
            // Закрываем модальное окно и сбрасываем состояние
            setDeleteModalOpen(false)
            setChatToDelete(null)
        } catch (error) {
            console.error('Ошибка при удалении:', error)
        } finally {
            // Снимаем блокировку в любом случае (успех или ошибка)
            setIsDeleting(false)
        }
    }, [chatToDelete, isDeleting, deleteChat]) // Зависимости: функция изменится если изменится chatToDelete, isDeleting или deleteChat

    // Обработчик отмены удаления чата
    const handleDeleteCancel = useCallback(() => {
        setDeleteModalOpen(false)
        setChatToDelete(null) // Важно сбросить chatToDelete, чтобы при следующем открытии не было старого значения
    }, []) // Без зависимостей - функция стабильна

    // Обработчик добавления чата в контакты
    const handleAddToContacts = useCallback(
        (
            chatId: number,
            firstName: string,
            lastName: string,
        ) => {
            const fullName = `${firstName} ${lastName}`
            setAddedContactName(fullName) // Сохраняем имя для отображения в тосте
            addToContacts(chatId) // Вызываем функцию добавления из хука useChats
            setSuccessToastOpen(true) // Показываем тост об успехе
        },
        [addToContacts], // addToContacts стабильна благодаря useCallback в хуке useChats
    )

    // Обработчик закрытия тоста об успешном добавлении
    const handleSuccessToastClose = useCallback(() => {
        setSuccessToastOpen(false)
    }, []) // Без зависимостей

    // useMemo для вычисления, нужно ли показывать состояние пустого поиска
    // Вычисление мемоизируется и пересчитывается только при изменении searchValue или filteredValue
    const showEmptySearchState = useMemo(() => {
        return (
            searchValue.trim() !== '' && // Поиск не пустой
            filteredValue &&
            filteredValue.length === 0 // И ничего не найдено
        )
    }, [searchValue, filteredValue]) // Пересчет только при изменении этих значений

    // Мемоизированное значение: нужно ли показывать состояние отсутствия чатов
    const showEmptyChatsState = useMemo(() => {
        return (
            !loading && // Загрузка завершена
            chats &&
            chats.length === 0 && // Чатов нет
            searchValue.trim() === '' // Поиск не выполняется
        )
    }, [loading, chats, searchValue]) // Оптимизация: избегаем повторных вычислений при каждом рендере

    // Рендер компонента
    return (
        <>
            <div className="flex h-(--screen-height-list) min-h-0 flex-col">
                {/* Верхняя панель с поиском и кнопкой создания */}
                <div
                    className={`flex h-19 w-full items-center gap-2.5 p-4`}
                >
                    <Search
                        value={searchValue}
                        onChange={setSearchValue} // Передаем setter функцию напрямую
                        placeholder={'Поиск'}
                        clearIconSrc="/images/search/closeSearch.svg"
                        showClearButton={true}
                    />

                    <CreateMenuButton
                        onSelectGroup={
                            onCreateGroup ||
                            (() => alert('Создать группу'))
                        }
                        onSelectChannel={
                            onCreateChannel ||
                            (() => alert('Создать канал'))
                        }
                    />
                </div>
                {/* Основная область со списком чатов */}
                <div
                    className={cn(
                        `min-h-0 flex-1 overflow-auto`,
                        `max-h-(--screen-112)`,
                    )}
                >
                    {/* Если идет загрузка, показываем индикатор */}
                    {loading ? (
                        <div
                            className={`flex h-full items-center justify-center`}
                        >
                            <div className="text-text-gray">
                                Загрузка...
                            </div>
                        </div>
                    ) : showEmptySearchState ? (
                        // Если поиск не дал результатов
                        <div
                            className={`
                              flex flex-1 items-center justify-center p-4
                            `}
                        >
                            <EmptySearchState />
                        </div>
                    ) : showEmptyChatsState ? (
                        // Если чатов вообще нет
                        <div
                            className={`
                              flex flex-1 items-center justify-center p-4
                            `}
                        >
                            <EmptyChatsState
                                onStartChat={
                                    handleStartChat
                                }
                            />
                        </div>
                    ) : (
                        // Отображаем список чатов с кастомным скроллбаром
                        <CustomScrollbar>
                            <div className="flex flex-col">
                                {sortedChats?.map(
                                    (chat, index) => {
                                        // Получаем настройки для текущего чата
                                        const settings =
                                            chatSettings[
                                                chat.id
                                            ] || {
                                                isFavorite:
                                                    chat.isFavorite ||
                                                    false,
                                                isChatRead:
                                                    chat.newMessageCount ===
                                                    0,
                                                notificationsEnabled:
                                                    chat.notifications ??
                                                    true,
                                                isDeleted: false,
                                                isInContacts:
                                                    chat
                                                        .chat
                                                        .isInContacts ||
                                                    false,
                                                originalUnreadCount:
                                                    chat.newMessageCount ||
                                                    0,
                                            }
                                        // Пропускаем удаленные чаты
                                        if (
                                            settings.isDeleted
                                        )
                                            return null
                                        // Рассчитываем количество непрочитанных для бейджа
                                        let badgeCount:
                                            | number
                                            | undefined =
                                            undefined
                                        if (
                                            !settings.isChatRead
                                        ) {
                                            badgeCount =
                                                settings.originalUnreadCount &&
                                                settings.originalUnreadCount >
                                                    0
                                                    ? settings.originalUnreadCount
                                                    : 0
                                        }
                                        // Определяем URL аватарки, используя fallback при отсутствии
                                        const avatarSrc =
                                            chat.chat.avatarUrl?.trim()
                                                ? chat.chat
                                                      .avatarUrl
                                                : '/images/chatHeader/userAvatar.svg'
                                        // Рендерим элемент списка чатов
                                        return (
                                            <ChatListItem
                                                src={
                                                    avatarSrc
                                                }
                                                name={`${chat.chat.firstName} ${chat.chat.lastName}`}
                                                messagePreview={
                                                    chat
                                                        .lastMessage
                                                        .content
                                                }
                                                timestamp={formatLastSeen(
                                                    chat.lastActivityAt *
                                                        1000,
                                                )}
                                                unreadCount={
                                                    badgeCount
                                                }
                                                key={
                                                    chat.id
                                                }
                                                selected={
                                                    chat.id ===
                                                    selectedChatId
                                                }
                                                onClick={() =>
                                                    toSelectChat(
                                                        chat.id,
                                                    )
                                                }
                                                notificationsEnabled={
                                                    settings.notificationsEnabled
                                                }
                                                messageStatus={
                                                    messageStatuses[
                                                        index %
                                                            messageStatuses.length
                                                    ]
                                                }
                                                onDeleteChat={() =>
                                                    handleDeleteClick(
                                                        chat.id,
                                                        `${chat.chat.firstName} ${chat.chat.lastName}`,
                                                    )
                                                }
                                                onFavoriteChat={() =>
                                                    handleFavoriteChat(
                                                        chat.id,
                                                    )
                                                }
                                                onMuteChat={() =>
                                                    handleMuteChat(
                                                        chat.id,
                                                    )
                                                }
                                                onMarkAsRead={() =>
                                                    handleMarkAsRead(
                                                        chat.id,
                                                    )
                                                }
                                                onMarkAsUnread={() =>
                                                    handleMarkAsUnread(
                                                        chat.id,
                                                    )
                                                }
                                                onAddToContacts={() =>
                                                    handleAddToContacts(
                                                        chat.id,
                                                        chat
                                                            .chat
                                                            .firstName,
                                                        chat
                                                            .chat
                                                            .lastName,
                                                    )
                                                }
                                                isFavorite={
                                                    settings.isFavorite
                                                }
                                                isChatRead={
                                                    settings.isChatRead
                                                }
                                                isInContacts={
                                                    chat
                                                        .chat
                                                        .isInContacts
                                                }
                                            />
                                        )
                                    },
                                )}
                            </div>
                        </CustomScrollbar>
                    )}
                </div>
            </div>
            {/* Модальное окно подтверждения удаления чата */}
            {/* Рендерится всегда, но управляется пропом open */}
            <ChatDeleteModal
                open={deleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                chatName={chatToDelete?.name || ''}
            />
            {/* Тост об успешном добавлении в контакты */}
            <ChatSuccessToast
                open={successToastOpen}
                onClose={handleSuccessToastClose}
                userName={addedContactName}
            />
        </>
    )
}
