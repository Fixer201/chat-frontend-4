'use client'

import { Avatar } from '../../../shared/ui/avatar/Avatar'
import ContactsSearch from './ContactsSearch'
import { useState } from 'react'
// import { ContactListDBType } from '../types/ContactListDBType';
import { useDispatch, useSelector } from 'react-redux'
//import { CardItem } from "./cardItem";
import { ContactsListDB } from './ContactsDB'
import Image from 'next/image'

export default function ContactsList() {
    // const [updatedData, setUpdatedData] = useState([] );
    // const dispatch = useDispatch();
    // const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            <ContactsSearch />
            {/* <div className="w-full custom-scroll overflow-hidden hover:overflow-auto"> */}

            <div className="w-full h-9 flex justify-between gap-1  bg-[#EFEEF7]">
                {' '}
                <span className="pl-4 pt-2.5 pr-4 pb-2.5">
                    Контакты пользователей А-чата
                </span>
                <Image
                    src="/images/contacts/MainIconsWeb.svg"
                    alt="MainIconsWeb"
                    width={24}
                    height={24}
                />
            </div>

            <div className="w-full h-11/12 custom-scroll overflow-hidden hover:overflow-auto gap-4">
                {ContactsListDB?.map((elem) => (
                    // <div key={elem.uid}>{elem.uid}</div>        )
                    <Avatar
                        key={elem.uid}
                        src={
                            '/images/contacts/' +
                            elem?.avatar_url
                        }
                        name={
                            elem.first_name +
                            ' ' +
                            elem.last_name
                        }
                        mode="select-contact"
                        isOnline={elem.is_online}
                        statusText={elem.was_online_at + elem.patronymic}
                    />
                ))}
            </div>

            {/* </div> */}
        </>
    )
}
