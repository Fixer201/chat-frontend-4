'use client'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { setSelectedContact } from '@redux/slices/selectedContactTempSlice'
import { RootState } from '@redux/store'
import { useEffect, useState, memo } from 'react'
import { useSearch } from '@shared/hooks/useSearch'
import Modal from '@shared/ui/modal/Modal'
import {
    removeContacts,
    setContacts,
} from '@redux/slices/contactsSliceTemp'
import { getContactWord } from '@shared/lib/getContactWord'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import Search from '@shared/ui/Search'
import EmptySearchState from '@shared/ui/emptySearchState/EmptySearchState'
import { ApiContact, Contact } from '@shared/types/contact'
// import { useApiFetcher } from '@shared/hooks/useApiFetcher'
import { notFound } from 'next/navigation'
import { ContactItemGroup } from './ContactItemGroup'
import { cn } from '@shared/lib/utils'

export default memo(function ContactsListGroup() {
    const [searchValue, setSearchValue] = useState('')
    const [deleteMode, setDeleteMode] = useState(false)
    const [selectedContacts, setSelectedContacts] =
        useState<string[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    // Получение данных из Redux store
    const selectedUid = useSelector(
        (state: RootState) => state.SelectedContactTemp.uid,
    )
    const contactsList = useSelector(
        (state: RootState) => state.contactsTemp.list,
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

    // Функция для определения, является ли строка телефоном (простая проверка: только цифры и опционально +)
    const isPhone = (str: string) => {
        const cleaned = str.replace(/\s/g, '') // Убираем пробелы
        return /^\+?\d+$/.test(cleaned)
    }

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

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p>Загрузка контактов...</p>
            </div>
        )
    }
    const owner: Contact = {
        uid: '1',
        firstName: 'Иван',
        lastName: 'Иванов',
        nickname: 'ivan123',
        phone: '+1234567890',
        avatarUrl: 'AvatarWeb1.png',
        isOnline: true,
        wasOnlineAt: new Date(),
    }
    return (
        <>
            <div className="mt-2 flex h-1/12 min-h-15 items-center px-4">
                <button
                    className={cn(
                        `
                          flex items-center gap-2 rounded-lg px-3 py-1
                          hover:cursor-pointer
                        `,
                    )}
                >
                    <Image
                        src="/icons/addToGroup.svg"
                        alt="Назад"
                        width={16}
                        height={16}
                    />
                    <p
                        className={`
                          text-accent-violet transition-colors duration-200
                          hover:text-accent-violet-dark
                        `}
                    >
                        Пригласить в группу
                    </p>
                </button>
            </div>
            <div className="mt-0 flex h-1/12 items-center px-4">
                <Search
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Поиск"
                    clearIconSrc="/images/search/iconsClose.svg"
                    showClearButton={true}
                    bgColor="bg-accent-violet-ultra-light"
                />
            </div>
            {/* Контейнер контактов и пользователей */}
            <div className="flex flex-col">
                <CustomScrollbar>
                    <div
                        className={`
                          flex h-9 w-full justify-between gap-1 pt-2.5 pr-4
                          pb-2.5 pl-4 text-text-gray
                        `}
                    >
                        <p className="text-sm">Владелец</p>
                    </div>
                    <ContactItemGroup
                        key={owner.uid}
                        contact={owner}
                        deleteMode={deleteMode}
                        selectedUid={selectedUid}
                        selectedContacts={selectedContacts}
                        searchValue={searchValue}
                        onSelectContact={
                            handleSelectContact
                        }
                        onSetSelectedContact={(
                            uid: string,
                        ) =>
                            dispatch(
                                setSelectedContact(uid),
                            )
                        }
                    />
                    <div
                        className={`
                          flex h-9 w-full justify-between gap-1 pt-2.5 pr-4
                          pb-2.5 pl-4 text-text-gray
                        `}
                    >
                        <p className="text-sm">Участники</p>
                    </div>

                    {filteredContacts &&
                    filteredContacts.length > 0 ? (
                        filteredContacts.map((contact) => (
                            <ContactItemGroup
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
                            />
                        ))
                    ) : filteredContacts.length === 0 &&
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
        </>
    )
})
