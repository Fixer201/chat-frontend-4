'use client'
import { Avatar } from '../../../shared/ui/avatar/Avatar'
import ContactsSearch from './ContactsSearch'
import { useDispatch, useSelector } from 'react-redux'
//import { CardItem } from "./cardItem";
import {
    ContactsListDB,
    STATUS_TEXTS,
} from '@shared/config/constants'
import Image from 'next/image'
import { setSelectedContact } from '@redux/slices/selectedContactSlice'
import { RootState } from '../../../redux/store'

//функция вычисления времени в сети
function ContactStatusWeb(
    is_online: boolean,
    was_online_at: number,
): string {
    const today = new Date()
    const milliseconds = was_online_at * 60 * 1000
    const lastOnlineDate = new Date(
        today.getTime() - milliseconds,
    )
    if (is_online) {
        return STATUS_TEXTS.online
    }
    if (was_online_at < 1) {
        return STATUS_TEXTS.justNow
    }
    if (was_online_at >= 1 && was_online_at < 60) {
        const minutes = Math.floor(was_online_at)
        return STATUS_TEXTS.minutesAgo(minutes)
    }
    if (was_online_at >= 60 && was_online_at < 1440) {
        const hours = Math.floor(was_online_at / 60)
        return STATUS_TEXTS.hoursAgo(hours)
    }
    if (was_online_at >= 1440 && was_online_at < 2880) {
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
    const dispatch = useDispatch()
    const selectedUid = useSelector(
        (state: RootState) => state.SelectedContact.uid,
    )
    return (
        <>
            <ContactsSearch />
            {/* <div className="w-full custom-scroll overflow-hidden hover:overflow-auto"> */}

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
                {ContactsListDB?.map((contact) => (
                    <Avatar
                        key={contact.uid}
                        src={
                            '/images/contacts/' +
                            contact?.avatar_url
                        }
                        name={
                            contact.first_name +
                            ' ' +
                            contact.last_name
                        }
                        mode="contact"
                        isOnline={contact.is_online}
                        statusText={ContactStatusWeb(
                            contact.is_online,
                            contact.was_online_at,
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
                ))}
            </div>
        </>
    )
}
