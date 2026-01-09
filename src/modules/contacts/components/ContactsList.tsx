'use client'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { setSelectedContact } from '@redux/slices/selectedContactSlice'
import { RootState } from '@redux/store'
import { useEffect, useState } from 'react'
import { useSearch } from '@shared/hooks/useSearch'
import ContactsDelete from './ContactsDelete'
import Modal from '@shared/ui/modal/Modal'
import { removeContacts } from '@redux/slices/contactsSlice'
import { getContactWord } from '@shared/lib/getContactWord'
import { createButtonKeyHandler } from '@shared/lib/keyboard-handlers'
import { ContactItem } from './ContactItem'
import Search from '@shared/ui/Search'
import EmptySearchState from '@shared/ui/emptySearchState/EmptySearchState'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'

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

    const handleDeletePanelKeyDown =
        createButtonKeyHandler(handleOpenModal)

    return (
        <>
            <div className="flex h-19 w-full items-center gap-2.5 p-4">
                <Search
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Поиск"
                    clearIconSrc="/images/search/closeSearch.svg"
                    showClearButton={true}
                />
            </div>

            {/* панель для режима удаления (если контакты есть) */}
            {filteredContacts &&
                filteredContacts.length > 0 && (
                    <ContactsDelete
                        deleteMode={deleteMode}
                        onToggleDeleteMode={setDeleteMode}
                        selectedContacts={selectedContacts}
                        onClearSelection={() =>
                            setSelectedContacts([])
                        }
                    />
                )}

            {/* контейнер контактов */}
            <div
                className={`
                  relative flex h-11/12 w-full flex-0 flex-col gap-4
                  overflow-hidden
                `}
            >
                {filteredContacts &&
                filteredContacts.length > 0 ? (
                    <CustomScrollbar>
                        {filteredContacts.map((contact) => (
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
                            />
                        ))}
                    </CustomScrollbar>
                ) : searchValue.trim() ? (
                    // блок для пустого поиска
                    <div
                        className={`flex flex-1 items-center justify-center p-4`}
                    >
                        <EmptySearchState />
                    </div>
                ) : (
                    // блок для пустого списка контактов
                    <div
                        className={`
                          flex h-full flex-col items-center justify-center p-4
                          text-center
                        `}
                    >
                        <Image
                            src="/images/search/nullContacts.svg"
                            alt="iconsSearch"
                            width={200}
                            height={200}
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

                {/* панель удаления выбранных контактов */}
                {deleteMode &&
                    selectedContacts.length > 0 && (
                        <div
                            className={`
                              absolute right-0 bottom-0 left-0 z-10 flex h-20
                              w-full cursor-pointer items-center justify-center
                              bg-gray-light transition-colors
                              hover:bg-accent-violet-light
                            `}
                            onClick={handleOpenModal}
                            onKeyDown={
                                handleDeletePanelKeyDown
                            }
                            role="button"
                            tabIndex={0}
                            aria-label={`Удалить ${selectedContacts.length} ${getContactWord(selectedContacts.length)}`}
                        >
                            <p className="text-(--color-system-red)">
                                Удалить{' '}
                                {selectedContacts.length}{' '}
                                {getContactWord(
                                    selectedContacts.length,
                                )}
                            </p>
                        </div>
                    )}

                {/* показана только если контакты есть и не в режиме удаления */}
                {filteredContacts &&
                    filteredContacts.length > 0 &&
                    !deleteMode && (
                        <div
                            className={`
                              flex h-9 w-full justify-between gap-1
                              bg-(--color-gray-light) pt-2.5 pr-4 pb-2.5 pl-4
                            `}
                        >
                            <p>Пользователи А-чата</p>
                            <Image
                                src="/images/contacts/basket.svg"
                                alt="MainIconsWeb"
                                width={24}
                                height={24}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                }}
                            />
                        </div>
                    )}
            </div>

            {/* модальное окно для удаления контактов */}
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
                        variant: 'ghost', // Без обводки
                        color: 'primary', // Нейтральный цвет
                        onClick: handleCloseModal,
                    },
                    {
                        label: 'Удалить',
                        variant: 'primary', // Оставлено как было
                        color: 'primary', // Оставлено как было
                        onClick: handleConfirmDelete,
                    },
                ]}
            />
        </>
    )
}
