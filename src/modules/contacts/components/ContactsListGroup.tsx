// src/modules/contacts/components/ContactsListGroup.tsx
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
import { GroupParticipant } from '@shared/types/contact'
import { ContactItemGroup } from './ContactItemGroup'
import { cn } from '@shared/lib/utils'
import { removeGroupParticipant } from '@shared/lib/localStorageGroupParticipants'

interface ContactsListGroupProps {
    owner: GroupParticipant | null
    participants: GroupParticipant[]
    onInviteClick?: () => void
    chatKey: string
    onParticipantRemoved?: (uid: string) => void
}

export default memo(function ContactsListGroup({
    owner,
    participants,
    onInviteClick,
    chatKey,
    onParticipantRemoved,
}: ContactsListGroupProps) {
    const [searchValue, setSearchValue] = useState('')
    const [deleteMode, setDeleteMode] = useState(false)
    const [selectedContacts, setSelectedContacts] =
        useState<string[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [participantToDelete, setParticipantToDelete] =
        useState<GroupParticipant | null>(null)

    const dispatch = useDispatch()

    const selectedUid = useSelector(
        (state: RootState) => state.SelectedContactTemp.uid,
    )

    const { filteredValue: filteredParticipants } =
        useSearch(participants, searchValue, [
            (contact) =>
                `${contact.firstName} ${contact.lastName}`.toLowerCase(),
            (contact) => `${contact.phone || ''}`,
            (contact) => `${contact.nickname || ''}`,
        ])

    useEffect(() => {
        if (deleteMode) {
            dispatch(setSelectedContact(null))
        }
    }, [deleteMode, dispatch])

    const handleSelectContact = (uid: string) => {
        setSelectedContacts((prev) =>
            prev.includes(uid)
                ? prev.filter((id) => id !== uid)
                : [...prev, uid],
        )
    }

    const handleDeleteParticipant = (
        participant: GroupParticipant,
    ) => {
        setParticipantToDelete(participant)
        setIsModalOpen(true)
    }

    const handleConfirmDeleteParticipant = () => {
        if (!participantToDelete || !chatKey) return

        removeGroupParticipant(
            chatKey,
            participantToDelete.uid,
        )

        if (onParticipantRemoved) {
            onParticipantRemoved(participantToDelete.uid)
        }

        setParticipantToDelete(null)
        setIsModalOpen(false)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setParticipantToDelete(null)
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
                    onClick={onInviteClick}
                >
                    <Image
                        src="/icons/addToGroup.svg"
                        alt="Добавить"
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

            <div className="flex flex-col">
                <CustomScrollbar>
                    {owner && (
                        <>
                            <div
                                className={`
                              flex h-9 w-full justify-between gap-1 pt-2.5 pr-4
                              pb-2.5 pl-4 text-text-gray
                            `}
                            >
                                <p className="text-sm">
                                    Владелец
                                </p>
                            </div>
                            <ContactItemGroup
                                key={owner.uid}
                                contact={owner}
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
                        </>
                    )}

                    <div
                        className={`
                      flex h-9 w-full justify-between gap-1 pt-2.5 pr-4 pb-2.5
                      pl-4 text-text-gray
                    `}
                    >
                        <p className="text-sm">Участники</p>
                    </div>

                    {filteredParticipants &&
                    filteredParticipants.length > 0 ? (
                        filteredParticipants.map(
                            (contact) => (
                                <ContactItemGroup
                                    key={contact.uid}
                                    contact={contact}
                                    deleteMode={deleteMode}
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
                                    onSetSelectedContact={(
                                        uid: string,
                                    ) =>
                                        dispatch(
                                            setSelectedContact(
                                                uid,
                                            ),
                                        )
                                    }
                                    onDelete={(contact) =>
                                        handleDeleteParticipant(
                                            contact as GroupParticipant,
                                        )
                                    }
                                />
                            ),
                        )
                    ) : filteredParticipants.length === 0 &&
                      searchValue.trim() ? (
                        <div
                            className={`
                          flex h-full flex-col items-center justify-center p-4
                          text-center
                        `}
                        >
                            <EmptySearchState />
                        </div>
                    ) : (
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
                                loading="eager"
                                style={{
                                    width: '200px',
                                    height: '200px',
                                }}
                            />
                            <p className="mt-2 text-text-gray">
                                Список участников пока пуст
                            </p>
                        </div>
                    )}
                </CustomScrollbar>
            </div>

            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title="Удалить участника"
                description={`Вы уверены, что хотите удалить участника ${participantToDelete?.firstName} ${participantToDelete?.lastName} из группы?`}
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
                        color: 'danger',
                        onClick:
                            handleConfirmDeleteParticipant,
                    },
                ]}
            />
        </>
    )
})
