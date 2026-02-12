// src/modules/contacts/components/ContactsList.tsx
'use client'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { setSelectedContact } from '@redux/slices/selectedContactSlice'
import { RootState } from '@redux/store'
import { toast } from 'react-hot-toast'
import {
    useEffect,
    useState,
    memo,
    useCallback,
} from 'react'
import { useSearch } from '@shared/hooks/useSearch'
import Modal from '@shared/ui/modal/Modal'
import Dropdown from '@shared/ui/dropdown/Dropdown'

import {
    removeContacts,
    setContacts,
    addContacts,
} from '@redux/slices/contactsSlice'
import { getContactWord } from '@shared/lib/getContactWord'
import { ContactItem } from './ContactItem'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import Search from '@shared/ui/Search'
import EmptySearchState from '@shared/ui/emptySearchState/EmptySearchState'
import {
    ApiContact,
    Contact,
    ApiAddedContact,
} from '@shared/types/contact'
import { useApiFetcher } from '@shared/hooks/useApiFetcher'
import { Spinner } from '@shared/ui/Spinner'
import { useRouter } from 'next/navigation'
import { UnauthorizedView } from '@modules/core/components/UnauthorizedView'

export default memo(function ContactsList({
    onContactSelect,
}: {
    onContactSelect: (uid: string) => void
}) {
    const [searchValue, setSearchValue] = useState('')
    const [deleteMode, setDeleteMode] = useState(false)
    const [selectedContacts, setSelectedContacts] =
        useState<string[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<Contact[]>([])
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] =
        useState<{ top: number; left: number } | null>(null)
    const [selectedUserForAdd, setSelectedUserForAdd] =
        useState<Contact | null>(null)
    const dispatch = useDispatch()
    const router = useRouter()
    const [authError, setAuthError] = useState(false)
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
        const cleaned = str.replace(/\s/g, '')
        return /^\+?\d+$/.test(cleaned)
    }
    const fetchData = useApiFetcher()

    // Загрузка контактов
    const loadContacts = useCallback(async () => {
        try {
            const data = await fetchData(
                'https://api.test.chat.ktsf.ru/api/v1/contact/messenger-list/',
                {
                    method: 'GET',
                },
            )
            const contactsData: ApiContact[] =
                data.results || []
            console.log('Ответ API:', contactsData)
            const mappedContacts: Contact[] =
                contactsData.map((item: ApiContact) => ({
                    uid: item.uid,
                    userUid: item.system_contact.uid,
                    username: '',
                    nickname: '',
                    phone: item.phone,
                    firstName: item.first_name,
                    lastName: item.last_name,
                    patronymic: '',
                    avatar: item.system_contact.avatar,
                    avatarUrl:
                        item.system_contact.avatar_url,
                    avatarWebp:
                        item.system_contact.avatar_webp,
                    avatarWebpUrl:
                        item.system_contact.avatar_webp_url,
                    additionalInformation: '',
                    birthday: 0,
                    chatId: 0,
                    isOnline: item.system_contact.is_online,
                    wasOnlineAt:
                        item.system_contact.was_online_at,
                }))
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
                    error.message === 'AccessTokenNotFound'
                ) {
                    setAuthError(true)
                    // router.push('/auth/login') // нужно подумать как лучше сделать перенаправление на логин либо notFound()
                }
            }
        } finally {
            setLoading(false)
        }
    }, [dispatch, fetchData])

    useEffect(() => {
        loadContacts()
    }, [loadContacts])

    // Загрузка пользователей А-чата на основе searchValue
    useEffect(() => {
        const loadUsers = async () => {
            if (!searchValue.trim()) {
                setUsers([]) // Сброс, если поиск пустой
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
                            wasOnlineAt: null,
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
                        // router.push('/auth/login')
                        setAuthError(true)
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
        //  router.push('/chats?contactId=' + uid)
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

    // Функция подтверждения удаления с использованием API
    const handleConfirmDelete = async () => {
        try {
            // Вызываем API для каждого выбранного контакта
            const deletePromises = selectedContacts.map(
                (uid) =>
                    fetchData(
                        `https://api.test.chat.ktsf.ru/api/v1/contact/messenger-delete-contact/${uid}/`,
                        {
                            method: 'DELETE',
                        },
                    ),
            )
            await Promise.all(deletePromises)
            // После успешного удаления обновляем Redux
            dispatch(removeContacts(selectedContacts))
            setSelectedContacts([])
            setDeleteMode(false)
            setIsModalOpen(false)
        } catch (error) {
            console.error(
                'Ошибка при удалении контактов:',
                error,
            )
            if (error instanceof Error) {
                if (
                    error.message ===
                        'RefreshTokenExpired' ||
                    error.message === 'AccessTokenNotFound'
                ) {
                    setAuthError(true) // Показать UnauthorizedView
                    return
                }
            }
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

    // Функция для добавления контакта
    const handleAddContact = async (user: Contact) => {
        if (!user.phone) {
            console.error(
                'Недостаточно данных для добавления контакта:',
                {
                    phone: user.phone,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                },
            )
            toast.error(
                'Недостаточно данных для добавления контакта',
            )
            return
        }

        // Убрана локальная проверка на существование контакта

        try {
            const body = {
                phone: user.phone,
                first_name: user.firstName || '',
                last_name: user.lastName || '',
            }
            console.log(
                'Отправка запроса на добавление контакта:',
                body,
            )
            const response: ApiAddedContact =
                await fetchData(
                    'https://api.test.chat.ktsf.ru/api/v1/contact/messenger-add-by-phone/',
                    {
                        method: 'POST',
                        body: JSON.stringify(body),
                    },
                )

            // маппим ответ API в Contact и добавляем в Redux моментально
            // newContact.uid = response.uid (ID пользователя, используем как ID записи контакта для консистентности)
            // newContact.userUid = response.uid (ID пользователя для чата)

            const newContact: Contact = {
                uid: response.uid,
                userUid: response.uid,
                username: '',
                nickname: '',
                phone: response.phone,
                firstName: response.first_name,
                lastName: response.last_name,
                patronymic: '',
                avatar: response.avatar,
                avatarUrl: response.avatar_url,
                avatarWebp: response.avatar_webp,
                avatarWebpUrl: response.avatar_webp_url,
                additionalInformation: '',
                birthday: 0,
                chatId: 0,
                isOnline: response.is_online,
                wasOnlineAt: response.was_online_at,
            }
            dispatch(addContacts(newContact)) // Моментальное обновление Redux
            await loadContacts() // Перезагрузить список контактов для получения правильного uid
            toast.success('Контакт добавлен')
            setDropdownOpen(false)
            setSelectedUserForAdd(null)
        } catch (error: unknown) {
            console.error(
                'Ошибка при добавлении контакта:',
                error,
            )
            // Обработка ошибок по статусу
            if (error instanceof Error) {
                const errorMessage = error.message
                if (
                    error.message ===
                        'RefreshTokenExpired' ||
                    error.message === 'AccessTokenNotFound'
                ) {
                    setAuthError(true) // Показать UnauthorizedView
                    setDropdownOpen(false)
                    setSelectedUserForAdd(null)
                    return
                }
                if (
                    errorMessage.includes('400') &&
                    errorMessage.includes(
                        'Этот контакт уже существует',
                    )
                ) {
                    // Контакт уже существует: не показываем ошибку, считаем успехом (он уже в списке)
                    toast.success('Контакт добавлен')
                    setDropdownOpen(false)
                    setSelectedUserForAdd(null)
                    return
                } else if (errorMessage.includes('404')) {
                    toast.error(
                        'Пользователь с таким номером не найден',
                    )
                } else {
                    toast.error(
                        'Ошибка при добавлении контакта',
                    )
                }
            } else {
                toast.error(
                    'Неизвестная ошибка при добавлении контакта',
                )
            }
            setDropdownOpen(false)
            setSelectedUserForAdd(null)
        }
    }

    // Функция для обработки клика на контакт (с редиректом)
    // const handleContactClick = (uid: string) => {
    //     dispatch(setSelectedContact(uid))
    //     router.push(`/chats?contactId=${uid}`)
    // }
    // const handleContactClick = (uid: string) => {
    //     dispatch(setSelectedContact(uid))  // Оставьте для выделения в списке
    //     onContactSelect(uid)  // Новый вызов для открытия чата
    // }
    const handleContactClick = (contact: Contact) => {
        dispatch(setSelectedContact(contact.uid))
        //    router.push(`/chats?contactId=${contact.userUid}`)
        onContactSelect(contact.userUid)
    }

    // Функция для открытия контекстного меню
    const handleContextMenu = (
        e: React.MouseEvent,
        user: Contact,
    ) => {
        e.preventDefault()
        setDropdownPosition({
            top: e.clientY,
            left: e.clientX,
        })
        setSelectedUserForAdd(user)
        setDropdownOpen(true)
    }

    if (authError) {
        return <UnauthorizedView />
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

            {/* Контейнер контактов и пользователей */}

            <div className="flex flex-col">
                <CustomScrollbar>
                    {/* Режим поиска: показывать найденные контакты и/или пользователей */}
                    {searchValue.trim() ? (
                        <>
                            {/* Показывать контакты, если они есть в поиске */}
                            {filteredContacts &&
                                filteredContacts.length >
                                    0 && (
                                    <>
                                        <div
                                            className={`
                                              flex h-9 w-full justify-between
                                              gap-1 bg-accent-violet-ultra-light
                                              pt-2.5 pr-4 pb-2.5 pl-4
                                            `}
                                        >
                                            <p>
                                                Контакты
                                                пользователей
                                                А-чата
                                            </p>
                                            {/* Убрал кнопки удаления в режиме поиска, чтобы не путать */}
                                        </div>
                                        {filteredContacts.map(
                                            (contact) => (
                                                <ContactItem
                                                    key={
                                                        contact.uid
                                                    }
                                                    contact={
                                                        contact
                                                    }
                                                    deleteMode={
                                                        false
                                                    } // В режиме поиска отключить режим удаления
                                                    selectedUid={
                                                        selectedUid
                                                    }
                                                    selectedContacts={[]}
                                                    searchValue={
                                                        searchValue
                                                    }
                                                    onSelectContact={
                                                        handleSelectContact
                                                    }
                                                    onSetSelectedContact={() =>
                                                        handleContactClick(
                                                            contact,
                                                        )
                                                    }
                                                />
                                            ),
                                        )}
                                    </>
                                )}
                            {/* Показывать пользователей А-чата, если они есть в поиске */}
                            {filteredUsers &&
                                filteredUsers.length >
                                    0 && (
                                    <>
                                        <div
                                            className={`
                                              flex h-9 w-full justify-center
                                              bg-accent-violet-ultra-light
                                              pt-2.5 pr-4 pb-2.5 pl-4
                                            `}
                                        >
                                            <p>
                                                Пользователи
                                                А-чата
                                            </p>
                                        </div>
                                        {filteredUsers.map(
                                            (user) => (
                                                <ContactItem
                                                    key={`user-${user.uid}`}
                                                    contact={
                                                        user
                                                    }
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
                                                    onSelectContact={
                                                        handleSelectContact
                                                    }
                                                    onSetSelectedContact={() =>
                                                        handleContactClick(
                                                            user,
                                                        )
                                                    }
                                                    onContextMenu={(
                                                        e,
                                                    ) =>
                                                        handleContextMenu(
                                                            e,
                                                            user,
                                                        )
                                                    }
                                                />
                                            ),
                                        )}
                                    </>
                                )}

                            {/* Если в поиске ничего не найдено */}
                            {filteredContacts.length ===
                                0 &&
                                filteredUsers.length ===
                                    0 && (
                                    <div
                                        className={`
                                          flex h-full flex-col items-center
                                          justify-center p-4 text-center
                                        `}
                                    >
                                        <EmptySearchState />
                                    </div>
                                )}
                        </>
                    ) : (
                        /* Режим без поиска: показывать контакты или баннер */
                        <>
                            {filteredContacts &&
                            filteredContacts.length > 0 ? (
                                <>
                                    <div
                                        className={`
                                          flex h-9 w-full justify-between gap-1
                                          bg-accent-violet-ultra-light pt-2.5
                                          pr-4 pb-2.5 pl-4
                                        `}
                                    >
                                        {deleteMode ? (
                                            <>
                                                <Image
                                                    src="/images/contacts/arrow.svg"
                                                    alt="back"
                                                    width={
                                                        24
                                                    }
                                                    height={
                                                        24
                                                    }
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
                                                <p>
                                                    Удалить
                                                    контакты
                                                </p>
                                                {selectedContacts.length >
                                                0 ? (
                                                    <Image
                                                        src="/images/contacts/iconCancel.svg"
                                                        alt="cancel selection"
                                                        width={
                                                            24
                                                        }
                                                        height={
                                                            24
                                                        }
                                                        style={{
                                                            width: '24px',
                                                            height: '24px',
                                                        }}
                                                        onClick={
                                                            handleClearSelection
                                                        }
                                                        className={`
                                                          cursor-pointer
                                                        `}
                                                        aria-label="Отменить выделение всех контактов"
                                                    />
                                                ) : (
                                                    <Image
                                                        src="/images/contacts/basketViolet.svg"
                                                        alt="delete"
                                                        width={
                                                            24
                                                        }
                                                        height={
                                                            24
                                                        }
                                                        style={{
                                                            width: '24px',
                                                            height: '24px',
                                                        }}
                                                        className={`
                                                          cursor-pointer
                                                        `}
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <p>
                                                    Контакты
                                                    пользователей
                                                    А-чата
                                                </p>
                                                <Image
                                                    src="/images/contacts/basket.svg"
                                                    alt="delete"
                                                    width={
                                                        24
                                                    }
                                                    height={
                                                        24
                                                    }
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                    }}
                                                    onClick={() =>
                                                        handleToggleDeleteMode(
                                                            true,
                                                        )
                                                    }
                                                    className="cursor-pointer"
                                                />
                                            </>
                                        )}
                                    </div>
                                    {filteredContacts.map(
                                        (contact) => (
                                            <ContactItem
                                                key={
                                                    contact.uid
                                                }
                                                contact={
                                                    contact
                                                }
                                                deleteMode={
                                                    deleteMode
                                                }
                                                selectedUid={
                                                    selectedUid
                                                }
                                                selectedContacts={
                                                    selectedContacts
                                                }
                                                searchValue={
                                                    searchValue
                                                }
                                                onSelectContact={
                                                    handleSelectContact
                                                }
                                                onSetSelectedContact={() =>
                                                    handleContactClick(
                                                        contact,
                                                    )
                                                }
                                            />
                                        ),
                                    )}

                                    {/* Панель удаления выбранных контактов */}
                                    {deleteMode &&
                                        selectedContacts.length >
                                            0 && (
                                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                                            <div
                                                className={`
                                                  right-0 left-0 z-10 flex h-20
                                                  w-full cursor-pointer
                                                  items-center justify-center
                                                  bg-(--color-gray-light)
                                                  transition-colors
                                                  hover:bg-(--color-accent-violet-light)
                                                `}
                                                onClick={
                                                    handleOpenModal
                                                }
                                                role="button"
                                                aria-label={`Удалить ${selectedContacts.length} ${getContactWord(selectedContacts.length)}`}
                                            >
                                                <p
                                                    className={`
                                                      text-(--color-system-red)
                                                    `}
                                                >
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
                                </>
                            ) : (
                                /* Баннер только если нет поиска и контакты пустые */
                                <div
                                    className={`
                                      flex h-full flex-col items-center
                                      justify-center p-4 text-center
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
                                        Список контактов
                                        пока пуст
                                    </p>
                                </div>
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

            {/* Контекстное меню для добавления контакта */}
            <Dropdown
                open={dropdownOpen}
                onOpenChange={setDropdownOpen}
            >
                <Dropdown.Content
                    manualPosition={dropdownPosition}
                >
                    <Dropdown.Item
                        label="Добавить в контакты"
                        onSelect={() =>
                            selectedUserForAdd &&
                            handleAddContact(
                                selectedUserForAdd,
                            )
                        }
                    />
                    <Dropdown.Item
                        label="В черный список"
                        onSelect={() => {}}
                    />
                </Dropdown.Content>
            </Dropdown>
        </>
    )
})
