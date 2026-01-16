/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { setSelectedContact } from '@redux/slices/selectedContactSlice'
import { RootState } from '@redux/store'
import { useState } from 'react'
import { useSearch } from '@shared/hooks/useSearch'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import Search from '@shared/ui/Search'
import EmptySearchState from '@shared/ui/emptySearchState/EmptySearchState'
import { ContactItemInvitation } from './ContactItemInvitation'

export default function ContactsListInvitation() {
    const [searchValue, setSearchValue] = useState('')
    const [selectedContacts, setSelectedContacts] =
        useState<string[]>([])
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

    const handleSelectContact = (uid: string) => {
        setSelectedContacts((prev) =>
            prev.includes(uid)
                ? prev.filter((id) => id !== uid)
                : [...prev, uid],
        )
    }

    return (
        <>
            <div className="flex h-1/12 min-h-15 items-center bg-(--color-gray-main) px-4">
                <Search
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Поиск"
                    clearIconSrc="/images/search/iconsClose.svg"
                    showClearButton={true}
                />
            </div>

            {/* контейнер контактов */}
            <div
                className={`
              relative flex h-11/12 w-full flex-0 flex-col gap-4
              overflow-hidden
              hover:overflow-auto
            `}
            >
                {filteredContacts &&
                filteredContacts.length > 0 ? (
                    <CustomScrollbar>
                        {filteredContacts.map((contact) => (
                            <ContactItemInvitation
                                key={contact.uid}
                                contact={contact}
                                selectedMode={true}
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
                    <EmptySearchState />
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
            </div>
        </>
    )
}
