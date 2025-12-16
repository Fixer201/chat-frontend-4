'use client'
import { Avatar } from '@shared/ui/avatar/Avatar'
import ContactsSearch from './ContactsSearch'
import { useDispatch, useSelector } from 'react-redux'
import {
    ContactsListDB,
    STATUS_TEXTS,
} from '@shared/config/constants'
import Image from 'next/image'
import { setSelectedContact } from '@redux/slices/selectedContactSlice'
import { RootState } from '@redux/store'
import { useState } from 'react'
import { useSearch } from '@shared/hooks/useSearch'

//функция вычисления времени в сети
function ContactStatusWeb(
    isOnline: boolean,
    wasOnlineAt: number,
): string {
    const today = new Date()
    const milliseconds = wasOnlineAt * 60 * 1000
    const lastOnlineDate = new Date(
        today.getTime() - milliseconds,
    )
    if (isOnline) {
        return STATUS_TEXTS.online
    }
    if (wasOnlineAt < 1) {
        return STATUS_TEXTS.justNow
    }
    if (wasOnlineAt >= 1 && wasOnlineAt < 60) {
        const minutes = Math.floor(wasOnlineAt)
        return STATUS_TEXTS.minutesAgo(minutes)
    }
    if (wasOnlineAt >= 60 && wasOnlineAt < 1440) {
        const hours = Math.floor(wasOnlineAt / 60)
        return STATUS_TEXTS.hoursAgo(hours)
    }
    if (wasOnlineAt >= 1440 && wasOnlineAt < 2880) {
        const hours = lastOnlineDate
            .getHours()
            .toString()
            .padStart(2, '0')
        const minutes = lastOnlineDate
            .getMinutes()
            .toString()
            .padStart(2, '0')
        return STATUS_TEXTS.yesterdayAt(hours, minutes)
    }
    const dateString =
        lastOnlineDate.toLocaleDateString('ru-RU')
    return STATUS_TEXTS.dateAgo(dateString)
}

export default function ContactsList() {
    const [searchValue, setSearchValue] = useState('')
    const dispatch = useDispatch()
    const selectedUid = useSelector(
        (state: RootState) => state.SelectedContact.uid,
    )

    const { filteredValue: filteredContacts } = useSearch(
        ContactsListDB,
        searchValue,
        [
            (contact) =>
                `${contact.firstName} ${contact.lastName}`.toLowerCase(),
            (contact) => `${contact.phone}`,
            (contact) => `${contact.nickname}`,
        ],
    )
    return (
        <>
            <ContactsSearch
                searchValue={searchValue}
                onSearchChange={setSearchValue}
            />

            <div className="w-full h-9 flex justify-between gap-1  bg-[#EFEEF7] pl-4 pt-2.5 pr-4 pb-2.5">
                {' '}
                <p>Контакты пользователей А-чата</p>
                <Image
                    src="/images/contacts/MainIconsWeb.svg"
                    alt="MainIconsWeb"
                    width={24}
                    height={24}
                    style={{
                        width: '24px',
                        height: '24px',
                    }}
                />
            </div>

            <div className="w-full h-11/12 flex-0 custom-scroll overflow-hidden hover:overflow-auto gap-4 flex flex-col ">
                {filteredContacts &&
                filteredContacts.length > 0 ? (
                    filteredContacts?.map((contact) => (
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
                            mode="contact"
                            isOnline={contact.isOnline}
                            statusText={ContactStatusWeb(
                                contact.isOnline,
                                contact.wasOnlineAt,
                            )}
                            onClick={() =>
                                dispatch(
                                    setSelectedContact(
                                        contact.uid,
                                    ),
                                )
                            }
                            selected={
                                contact.uid === selectedUid
                            }
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Image
                            src="/images/search/imgSearchWeb.svg"
                            alt="iconsSearch"
                            width={200}
                            height={200}
                            style={{
                                width: '200px',
                                height: '200px',
                            }}
                        />
                        <p className="mt-2 text-text-gray">
                            Поиск не дал результатов
                        </p>
                        <p className="text-sm text-text-gray">
                            По вашему запросу ничего не
                            найдено. <br /> Измените запрос
                            и попробуйте снова
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}
