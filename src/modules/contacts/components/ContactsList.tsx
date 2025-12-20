'use client'
import ContactsSearch from './ContactsSearch'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { setSelectedContact } from '@redux/slices/selectedContactSlice'
import { RootState } from '@redux/store'
import { useEffect, useState } from 'react'
import { useSearch } from '@shared/hooks/useSearch'
import { Avatar } from '@shared/ui/avatar/Avatar'
import ContactsDelete from './ContactsDelete'
import { getContactWebStatus } from '@shared/lib/getContactWebStatus'
import Modal from '@shared/ui/modal/Modal'
import { removeContacts } from '@redux/slices/contactsSlice'
import { getContactWord } from '@shared/lib/getContactWord'

export default function ContactsList() {
    const [searchValue, setSearchValue] = useState('')
    const [deleteMode, setDeleteMode] = useState(false)
    const [selectedContacts, setSelectedContacts] =
        useState<string[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const dispatch = useDispatch()
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

    // Функция для определения текста статуса в зависимости от поиска
    const getStatusText = (
        contact: any,
        searchValue: string,
    ) => {
        const lowerSearch = searchValue.toLowerCase()
        if (
            lowerSearch &&
            contact.phone
                .toLowerCase()
                .includes(lowerSearch)
        ) {
            return contact.phone
        } else if (
            lowerSearch &&
            contact.nickname
                .toLowerCase()
                .includes(lowerSearch)
        ) {
            return contact.nickname
        } else {
            return getContactWebStatus(
                contact.isOnline,
                contact.wasOnlineAt,
            )
        }
    }

    return (
        <>
            <ContactsSearch
                searchValue={searchValue}
                onSearchChange={setSearchValue}
            />
            <div className="relative w-full h-11/12 flex flex-col overflow-hidden">
                {/* панель для режима удаления (если контакты есть) */}
                {filteredContacts &&
                    filteredContacts.length > 0 && (
                        <ContactsDelete
                            deleteMode={deleteMode}
                            onToggleDeleteMode={
                                setDeleteMode
                            }
                            selectedContacts={
                                selectedContacts
                            }
                            onClearSelection={() =>
                                setSelectedContacts([])
                            }
                        />
                    )}

                {/* контейнер контактов  */}
                <div className="custom-scroll gap-4 flex flex-col flex-1 ">
                    {filteredContacts &&
                    filteredContacts.length > 0 ? (
                        filteredContacts.map((contact) => (
                            <Avatar
                                key={contact.uid}
                                src={
                                    '/images/contacts/' +
                                    contact?.avatarUrl
                                }
                                name={
                                    contact.firstName +
                                    ' ' +
                                    contact.lastName
                                }
                                mode={
                                    deleteMode
                                        ? 'select-contact'
                                        : 'contact'
                                }
                                isOnline={contact.isOnline}
                                statusText={getStatusText(
                                    contact,
                                    searchValue,
                                )}
                                onClick={() =>
                                    !deleteMode &&
                                    dispatch(
                                        setSelectedContact(
                                            contact.uid,
                                        ),
                                    )
                                }
                                selected={
                                    contact.uid ===
                                    selectedUid
                                }
                                onSelect={
                                    deleteMode
                                        ? () =>
                                              handleSelectContact(
                                                  contact.uid,
                                              )
                                        : undefined
                                }
                                isSelected={
                                    deleteMode
                                        ? selectedContacts.includes(
                                              contact.uid,
                                          )
                                        : false
                                }
                            />
                        ))
                    ) : searchValue.trim() ? (
                        // блок для пустого поиска
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <Image
                                src="/images/search/imgSearchWeb.svg"
                                alt="iconsSearch"
                                width={200}
                                height={200}
                                className="w-50 h-50"
                            />
                            <p className="mt-2 text-text-gray">
                                Поиск не дал результатов
                            </p>
                            <p className="text-sm text-text-gray">
                                По вашему запросу ничего не
                                найдено. <br /> Измените
                                запрос и попробуйте снова
                            </p>
                        </div>
                    ) : (
                        // блок для пустого списка контактов
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <Image
                                src="/images/search/nullContacts.svg"
                                alt="iconsSearch"
                                width={200}
                                height={200}
                               className="w-50 h-50"
                            />
                            <p className="mt-2 text-text-gray">
                                Список контактов пока пуст
                            </p>
                        </div>
                    )}

                    {/* панель удаления выбранных контактов  */}
                    {deleteMode &&
                        selectedContacts.length > 0 && (
                            <div
                                className="absolute bottom-0 left-0 right-0 z-10 w-full h-20 flex justify-center items-center bg-gray-light cursor-pointer hover:bg-accent-violet-light transition-colors"
                                onClick={handleOpenModal}
                                role="button"
                                aria-label={`Удалить ${
                                    selectedContacts.length
                                } ${getContactWord(
                                    selectedContacts.length,
                                )}`}
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

                    {/*показана только если контакты есть и не в режиме удаления) */}
                    {filteredContacts &&
                        filteredContacts.length > 0 &&
                        !deleteMode && (
                            <div className="w-full h-9 flex justify-between gap-1 bg-gray-light pl-4 pt-2.5 pr-4 pb-2.5">
                                <p>Пользователи А-чата</p>
                                <Image
                                    src="/images/contacts/basket.svg"
                                    alt="MainIconsWeb"
                                    width={24}
                                    height={24}
                                   className="w-6 h-6"
                                />
                            </div>
                        )}
                </div>
            </div>

            {/* модальное окно для удаления контактов*/}
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title="Удалить контакты"
                description={`Вы уверены, что хотите удалить ${
                    selectedContacts.length
                } ${getContactWord(
                    selectedContacts.length,
                )}?`}
                descriptionColor="muted"
                buttons={[
                    {
                        label: 'Отмена',
                        variant: 'secondary',
                        onClick: handleCloseModal,
                    },
                    {
                        label: 'Удалить',
                        variant: 'primary',
                        color: 'danger',
                        onClick: handleConfirmDelete,
                    },
                ]}
            />
        </>
    )
}
