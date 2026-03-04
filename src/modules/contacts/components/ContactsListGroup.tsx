'use client'

import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { setSelectedContact } from '@redux/slices/selectedContactTempSlice'
import { RootState } from '@redux/store'
import { useEffect, useState, memo } from 'react'
import { useSearch } from '@shared/hooks/useSearch'
import Modal from '@shared/ui/modal/Modal'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import Search from '@shared/ui/Search'
import EmptySearchState from '@shared/ui/emptySearchState/EmptySearchState'
import type { GroupParticipant } from '@shared/types/contact'
import { ContactItemGroup } from './ContactItemGroup'
import { cn } from '@shared/lib/utils'
import { useProfile } from '@shared/hooks/useProfile' // <-- импортируем хук
interface ContactsListGroupProps {
    owner: GroupParticipant | null
    participants: GroupParticipant[]
    onInviteClick?: () => void
    chatKey: string
    onParticipantRemoved?: (uid: string) => void
    canRemoveParticipants?: boolean
    onTransferOwnership?: (
        participant: GroupParticipant,
    ) => void // <-- новый проп
}
export default memo(function ContactsListGroup({
    owner,
    participants,
    onInviteClick,
    chatKey,
    onParticipantRemoved,
    canRemoveParticipants = false,
    onTransferOwnership,
}: ContactsListGroupProps) {
    const [searchValue, setSearchValue] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [participantToDelete, setParticipantToDelete] =
        useState<GroupParticipant | null>(null)

    const dispatch = useDispatch()
    const selectedUid = useSelector(
        (state: RootState) => state.SelectedContactTemp.uid,
    )

    // Получаем профиль текущего пользователя
    const { profile } = useProfile()

    const { filteredValue: filteredParticipants } =
        useSearch(participants, searchValue, [
            (contact) =>
                `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.toLowerCase(),
        ])

    const handleDeleteParticipant = (
        participant: GroupParticipant,
    ) => {
        if (!canRemoveParticipants) return
        setParticipantToDelete(participant)
        setIsModalOpen(true)
    }

    const handleConfirmDeleteParticipant = () => {
        if (
            !participantToDelete ||
            !chatKey ||
            !onParticipantRemoved
        )
            return

        onParticipantRemoved(participantToDelete.uid)
        setParticipantToDelete(null)
        setIsModalOpen(false)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setParticipantToDelete(null)
    }

    // Формируем объект для отображения владельца: если это текущий пользователь,
    // подставляем реальные имя и фамилию из профиля
    const ownerDisplay =
        owner && profile?.uid
            ? owner.uid === 'current-user-uid' ||
              owner.uid === profile.uid
                ? {
                      ...owner,
                      firstName:
                          profile.first_name ||
                          owner.firstName,
                      lastName:
                          profile.last_name ||
                          owner.lastName,
                  }
                : owner
            : owner

    return (
        <>
            <div className="mt-2 flex h-1/12 min-h-15 items-center px-4">
                <button
                    className={cn(`
                      flex items-center gap-2 rounded-lg px-3 py-1
                      hover:cursor-pointer
                    `)}
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
                    {ownerDisplay && (
                        <>
                            <div
                                className={`
                                  flex h-9 w-full justify-between gap-1 pt-2.5
                                  pr-4 pb-2.5 pl-4 text-text-gray
                                `}
                            >
                                <p className="text-sm">
                                    Владелец
                                </p>
                            </div>
                            <ContactItemGroup
                                key={ownerDisplay.uid}
                                contact={ownerDisplay}
                                searchValue={searchValue}
                                selectedUid={selectedUid}
                                onSetSelectedContact={(
                                    uid: string,
                                ) =>
                                    dispatch(
                                        setSelectedContact(
                                            uid,
                                        ),
                                    )
                                }
                                canDelete={false}
                                onDelete={
                                    handleDeleteParticipant
                                }
                                onTransferOwnership={
                                    onTransferOwnership
                                        ? () =>
                                              onTransferOwnership(
                                                  ownerDisplay,
                                              )
                                        : undefined
                                } // <-- передаём, только если есть обработчик
                                canTransferOwnership={
                                    canRemoveParticipants
                                } // только владелец группы может передавать права
                            />
                        </>
                    )}

                    <div
                        className={`
                          flex h-9 w-full justify-between gap-1 pt-2.5 pr-4
                          pb-2.5 pl-4 text-text-gray
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
                                    searchValue={
                                        searchValue
                                    }
                                    selectedUid={
                                        selectedUid
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
                                    canDelete={
                                        canRemoveParticipants
                                    }
                                    onDelete={
                                        handleDeleteParticipant
                                    }
                                    onTransferOwnership={
                                        onTransferOwnership
                                            ? () =>
                                                  onTransferOwnership(
                                                      contact,
                                                  )
                                            : undefined
                                    }
                                    canTransferOwnership={
                                        canRemoveParticipants
                                    }
                                />
                            ),
                        )
                    ) : filteredParticipants.length === 0 &&
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
                                Список участников пока пуст
                            </p>
                        </div>
                    )}
                </CustomScrollbar>
            </div>

            {/* Модалка подтверждения удаления участника */}
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title={`Удалить ${participantToDelete?.firstName || ''} ${participantToDelete?.lastName || ''} из группы?`}
                description="Пользователь потеряет доступ ко всем сообщениям и не сможет вернуться без приглашения"
                titleAlign="left"
                buttons={[
                    {
                        label: 'Удалить',
                        variant: 'primary',
                        color: 'danger',
                        onClick:
                            handleConfirmDeleteParticipant,
                    },
                    {
                        label: 'Отменить',
                        variant: 'ghost',
                        color: 'primary',
                        onClick: handleCloseModal,
                    },
                ]}
            />
        </>
    )
})
