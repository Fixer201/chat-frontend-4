'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BlockModal from '@modules/chats-list/components/BlockModal'
import {
    removeContacts,
    setContacts,
} from '@redux/slices/contactsSlice'
import { setSelectedContact } from '@redux/slices/selectedContactSlice'
import { RootState } from '@redux/store'
import { useApiFetcher } from '@shared/hooks/useApiFetcher'
import { useSearch } from '@shared/hooks/useSearch'
import { getContactWord } from '@shared/lib/getContactWord'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import EmptySearchState from '@shared/ui/emptySearchState/EmptySearchState'
import Modal from '@shared/ui/modal/Modal'
import Search from '@shared/ui/Search'
import { Spinner } from '@shared/ui/Spinner'
import { ApiContact, Contact } from '@shared/types/contact'
import { ContactItem } from './ContactItem'

export default memo(function ContactsList() {
    const [searchValue, setSearchValue] = useState('')
    const [deleteMode, setDeleteMode] = useState(false)
    const [selectedContacts, setSelectedContacts] =
        useState<string[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<Contact[]>([])
    // Состояние модалки блокировки и выбранного контакта.
    // Best practice: храним минимум данных, чтобы исключить рассинхрон UI/данных.
    const [blockModalOpen, setBlockModalOpen] =
        useState(false) // Для теста чёрного списка
    const [contactToBlock, setContactToBlock] = useState<{
        uid: string
        name: string
        phone?: string
        nickname?: string
    } | null>(null) // Для теста чёрного списка
    const dispatch = useDispatch()
    const router = useRouter()
    const selectedUid = useSelector(
        (state: RootState) => state.SelectedContact.uid,
    )
    const contactsList = useSelector(
        (state: RootState) => state.contacts.list,
    )
    const { filteredValue: filteredContacts } = useSearch(
        contactsList,
        searchValue,
        [
            (contact) =>
                `${contact.firstName} ${contact.lastName}`.toLowerCase(),
            (contact) => `${contact.phone}`,
            (contact) => `${contact.nickname}`,
        ],
    )
    const { filteredValue: filteredUsers } = useSearch(
        users,
        searchValue,
        [
            (user) =>
                `${user.firstName} ${user.lastName}`.toLowerCase(),
            (user) => `${user.phone}`,
            (user) => `${user.nickname}`,
        ],
    )
    // Функция для определения, является ли строка телефоном (простая проверка: только цифры и опционально +)
    const isPhone = (str: string) => {
        const cleaned = str.replace(/\s/g, '') // Убираем пробелы
        return /^\+?\d+$/.test(cleaned)
    }
    const fetchData = useApiFetcher()

    // Загрузка контактов
    useEffect(() => {
        const loadContacts = async () => {
            try {
                const data = await fetchData(
                    'https://api.test.chat.ktsf.ru/api/v1/contact/messenger-list/',
                    {
                        method: 'GET',
                    },
                )
                const contactsData: ApiContact[] =
                    data.results || []
                const mappedContacts: Contact[] =
                    contactsData.map(
                        (item: ApiContact) => ({
                            uid: item.user_uid ?? item.uid,
                            userUid:
                                item.user_uid ?? item.uid,
                            username: '',
                            nickname: '',
                            phone: item.phone,
                            firstName: item.first_name,
                            lastName: item.last_name,
                            patronymic: '',
                            avatar: item.avatar,
                            avatarUrl: item.avatar_url,
                            avatarWebp: item.avatar_webp,
                            avatarWebpUrl:
                                item.avatar_webp_url,
                            additionalInformation: '',
                            birthday: 0,
                            chatId: 0,
                            isOnline: item.is_online,
                            wasOnlineAt: item.was_online_at,
                        }),
                    )
                dispatch(setContacts(mappedContacts))
            } catch (error: unknown) {
                console.error(
                    'Ошибка загрузки контактов:',
                    error,
                )
                if (error instanceof Error) {
                    if (
                        error.message ===
                            'RefreshTokenExpired' ||
                        error.message ===
                            'AccessTokenNotFound'
                    ) {
                        router.push('/auth/login') // Перенаправление на логин вместо notFound()
                    }
                }
            } finally {
                setLoading(false)
            }
        }
        loadContacts()
    }, [dispatch, fetchData, router])

    // Загрузка пользователей А-чата на основе searchValue
    useEffect(() => {
        const loadUsers = async () => {
            if (!searchValue.trim()) {
                setUsers([]) // Сбрасываем, если поиск пустой
                return
            }
            try {
                const data = await fetchData(
                    'https://api.test.chat.ktsf.ru/api/v1/contact/check/full-list/',
                    {
                        method: 'POST',
                        body: JSON.stringify([
                            {
                                phone_or_nickname:
                                    searchValue,
                            },
                        ]),
                    },
                )
                // Маппим ответ API в Contact[]
                const mappedUsers: Contact[] = data.map(
                    (item: {
                        uid: string
                        phone: string
                        is_online: boolean
                    }) => {
                        const isSearchPhone =
                            isPhone(searchValue)
                        return {
                            uid: item.uid,
                            userUid: item.uid,
                            username: '',
                            nickname: isSearchPhone
                                ? ''
                                : searchValue, // Никнейм только если поиск по нему
                            phone: item.phone,
                            firstName: isSearchPhone
                                ? item.phone
                                : searchValue, // Телефон для телефона, searchValue для никнейма
                            lastName: '',
                            patronymic: '',
                            avatar: '',
                            avatarUrl: '',
                            avatarWebp: '',
                            avatarWebpUrl: '',
                            additionalInformation: '',
                            birthday: 0,
                            chatId: 0,
                            isOnline: item.is_online,
                            wasOnlineAt: 0,
                        }
                    },
                )
                setUsers(mappedUsers)
            } catch (error: unknown) {
                console.error(
                    'Ошибка загрузки пользователей А-чата:',
                    error,
                )
                if (error instanceof Error) {
                    if (
                        error.message ===
                            'RefreshTokenExpired' ||
                        error.message ===
                            'AccessTokenNotFound'
                    ) {
                        router.push('/auth/login')
                    }
                }
                setUsers([])
            }
        }
        loadUsers()
    }, [searchValue, fetchData, router])

    // Сброс выделенного контакта при входе в режим удаления
    useEffect(() => {
        if (deleteMode) {
            dispatch(setSelectedContact(null))
        }
    }, [deleteMode, dispatch])

    // Функция для выбора контактов для удаления
    const handleSelectContact = (uid: string) => {
        setSelectedContacts((prev) =>
            prev.includes(uid)
                ? prev.filter((id) => id !== uid)
                : [...prev, uid],
        )
    }

    // Функция открытия модального окна
    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    // Функция закрытия модального окна
    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    // Функция подтверждения удаления
    const handleConfirmDelete = () => {
        try {
            dispatch(removeContacts(selectedContacts))
            setSelectedContacts([])
            setDeleteMode(false)
            setIsModalOpen(false)
        } catch (error) {
            console.error(
                'Ошибка при удалении контактов:',
                error,
            )
        }
    }

    // Функция для переключения режима удаления со сбросом выбранных контактов
    const handleToggleDeleteMode = (mode: boolean) => {
        setDeleteMode(mode)
        if (mode) {
            setSelectedContacts([])
        }
    }

    // Функция для сброса выделения
    const handleClearSelection = () => {
        setSelectedContacts([])
    }

    // Открываем подтверждение блокировки: сохраняем выбранный контакт в state
    // и показываем модалку. Это упрощает повторные клики/повторные подтверждения.
    const handleOpenBlock = (
        uid: string,
        name: string,
        phone?: string,
        nickname?: string,
    ) => {
        setContactToBlock({
            uid,
            name,
            phone,
            nickname,
        }) // Для теста чёрного списка
        setBlockModalOpen(true) // Для теста чёрного списка
    }

    // Подтверждаем блокировку: API требует user_uid.
    // Best practice: при наличии phone/nickname уточняем user_uid через lookup
    // (API /contact/check/full-list/), чтобы избежать 404 "No User matches".
    const handleConfirmBlock = async () => {
        if (!contactToBlock) return
        try {
            let userUid = contactToBlock.uid

            if (
                contactToBlock.phone ||
                contactToBlock.nickname
            ) {
                try {
                    const lookupData = await fetchData(
                        'https://api.test.chat.ktsf.ru/api/v1/contact/check/full-list/',
                        {
                            method: 'POST',
                            body: JSON.stringify([
                                {
                                    phone_or_nickname:
                                        contactToBlock.phone ||
                                        contactToBlock.nickname,
                                },
                            ]),
                        },
                    )

                    const lookupArray = Array.isArray(
                        lookupData,
                    )
                        ? lookupData
                        : []
                    if (lookupArray.length > 0) {
                        userUid = lookupArray[0].uid
                    }
                } catch (lookupError) {
                    console.warn(
                        'Не удалось получить user_uid для блокировки:',
                        lookupError,
                    )
                }
            }

            // Блокировка выполняется по user_uid (path param), как требует API.
            await fetchData(
                `https://api.test.chat.ktsf.ru/api/v1/contact/blacklist/add/${encodeURIComponent(userUid)}/`,
                {
                    method: 'POST',
                },
            ) // Для теста чёрного списка
        } catch (error) {
            console.error(
                'Ошибка блокировки контакта (test):',
                error,
            )
        } finally {
            // Всегда сбрасываем состояние, чтобы избежать "залипания" модалки.
            setBlockModalOpen(false) // Для теста чёрного списка
            setContactToBlock(null) // Для теста чёрного списка
        }
    }

    const handleCancelBlock = () => {
        setBlockModalOpen(false) // Для теста чёрного списка
        setContactToBlock(null) // Для теста чёрного списка
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p>Загрузка контактов...</p>
                <Spinner />
            </div>
        )
    }

    return (
        <>
            <div className="mt-2 flex h-1/12 min-h-15 items-center px-4">
                <Search
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Поиск"
                    clearIconSrc="/images/search/iconsClose.svg"
                    showClearButton={true}
                />
            </div>

            {/* рендеринг в зависимости от режима  */}
            {filteredContacts &&
                filteredContacts.length > 0 && (
                    <div
                        className={`
                          flex h-9 w-full justify-between gap-1
                          bg-accent-violet-ultra-light pt-2.5 pr-4 pb-2.5 pl-4
                        `}
                    >
                        {deleteMode ? (
                            <>
                                <Image
                                    src="/images/contacts/arrow.svg"
                                    alt="back"
                                    width={24}
                                    height={24}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                    }}
                                    onClick={() =>
                                        handleToggleDeleteMode(
                                            false,
                                        )
                                    }
                                    className="cursor-pointer"
                                />
                                <p>Удалить контакты</p>
                                {selectedContacts.length >
                                0 ? (
                                    <Image
                                        src="/images/contacts/iconCancel.svg"
                                        alt="cancel selection"
                                        width={24}
                                        height={24}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                        }}
                                        onClick={
                                            handleClearSelection
                                        }
                                        className="cursor-pointer"
                                        aria-label="Отменить выделение всех контактов"
                                    />
                                ) : (
                                    <Image
                                        src="/images/contacts/basketViolet.svg"
                                        alt="delete"
                                        width={24}
                                        height={24}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                        }}
                                        className="cursor-pointer"
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                <p>
                                    Контакты пользователей
                                    А-чата
                                </p>
                                <Image
                                    src="/images/contacts/basket.svg"
                                    alt="delete"
                                    width={24}
                                    height={24}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                    }}
                                    className="cursor-pointer"
                                    onClick={() =>
                                        handleToggleDeleteMode(
                                            true,
                                        )
                                    }
                                />
                            </>
                        )}
                    </div>
                )}

            {/* Контейнер контактов и пользователей */}
            <div className="flex flex-col">
                <CustomScrollbar>
                    {filteredContacts &&
                    filteredContacts.length > 0 ? (
                        filteredContacts.map((contact) => (
                            <ContactItem
                                key={contact.uid}
                                contact={contact}
                                deleteMode={deleteMode}
                                selectedUid={selectedUid}
                                selectedContacts={
                                    selectedContacts
                                }
                                searchValue={searchValue}
                                onSelectContact={
                                    handleSelectContact
                                }
                                onSetSelectedContact={(
                                    uid: string,
                                ) =>
                                    dispatch(
                                        setSelectedContact(
                                            uid,
                                        ),
                                    )
                                }
                                onBlock={() =>
                                    handleOpenBlock(
                                        contact.userUid ||
                                            contact.uid,
                                        `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
                                            contact.phone ||
                                            contact.nickname ||
                                            'контакт',
                                        contact.phone,
                                        contact.nickname,
                                    )
                                }
                            />
                        ))
                    ) : filteredContacts.length === 0 &&
                      filteredUsers.length === 0 &&
                      searchValue.trim() ? (
                        <div
                            className={`
                              flex h-full flex-col items-center justify-center
                              p-4 text-center
                            `}
                        >
                            <EmptySearchState />
                        </div>
                    ) : (
                        <div
                            className={`
                              flex h-full flex-col items-center justify-center
                              p-4 text-center
                            `}
                        >
                            <Image
                                src="/images/search/nullContacts.svg"
                                alt="iconsSearch"
                                width={200}
                                height={200}
                                loading="eager"
                                style={{
                                    width: '200px',
                                    height: '200px',
                                }}
                            />
                            <p className="mt-2 text-text-gray">
                                Список контактов пока пуст
                            </p>
                        </div>
                    )}

                    {/* Панель удаления выбранных контактов */}
                    {deleteMode &&
                        selectedContacts.length > 0 && (
                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                            <div
                                className={`
                                  right-0 left-0 z-10 flex h-20 w-full
                                  cursor-pointer items-center justify-center
                                  bg-(--color-gray-light) transition-colors
                                  hover:bg-(--color-accent-violet-light)
                                `}
                                onClick={handleOpenModal}
                                role="button"
                                aria-label={`Удалить ${selectedContacts.length} ${getContactWord(selectedContacts.length)}`}
                            >
                                <p className="text-(--color-system-red)">
                                    Удалить{' '}
                                    {
                                        selectedContacts.length
                                    }{' '}
                                    {getContactWord(
                                        selectedContacts.length,
                                    )}
                                </p>
                            </div>
                        )}
                    {/* Блок пользователей А-чата */}
                    {filteredUsers &&
                        filteredUsers.length > 0 && (
                            <>
                                <div
                                    className={`
                                      flex h-9 w-full justify-center
                                      bg-accent-violet-ultra-light pt-2.5 pr-4
                                      pb-2.5 pl-4
                                    `}
                                >
                                    <p>
                                        Пользователи А-чата
                                    </p>
                                </div>

                                {filteredUsers.map(
                                    (user) => (
                                        <ContactItem
                                            key={`user-${user.uid}`}
                                            contact={user}
                                            deleteMode={
                                                false
                                            }
                                            selectedUid={
                                                selectedUid
                                            }
                                            selectedContacts={[]}
                                            searchValue={
                                                searchValue
                                            }
                                            onSelectContact={() => {}}
                                            onSetSelectedContact={(
                                                uid: string,
                                            ) =>
                                                dispatch(
                                                    setSelectedContact(
                                                        uid,
                                                    ),
                                                )
                                            }
                                            onBlock={() =>
                                                handleOpenBlock(
                                                    user.userUid ||
                                                        user.uid,
                                                    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                                                        user.phone ||
                                                        user.nickname ||
                                                        'контакт',
                                                    user.phone,
                                                    user.nickname,
                                                )
                                            }
                                        />
                                    ),
                                )}
                            </>
                        )}
                </CustomScrollbar>
            </div>

            {/* Модальное окно для удаления контактов */}
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title="Удалить контакты"
                description={`Вы уверены, что хотите удалить ${selectedContacts.length} ${getContactWord(selectedContacts.length)}?`}
                descriptionColor="muted"
                titleAlign="left"
                buttons={[
                    {
                        label: 'Отмена',
                        variant: 'ghost',
                        color: 'primary',
                        onClick: handleCloseModal,
                    },
                    {
                        label: 'Удалить',
                        variant: 'primary',
                        color: 'primary',
                        onClick: handleConfirmDelete,
                    },
                ]}
            />

            {/* Модалка подтверждения блокировки.
                рендерим один экземпляр и управляем им через state,
                чтобы исключить расхождение состояния между списком и модалкой. */}
            <BlockModal
                open={blockModalOpen}
                onClose={handleCancelBlock}
                onConfirm={handleConfirmBlock}
                contactName={contactToBlock?.name || ''}
            />
        </>
    )
})
