'use client'

import { Avatar } from '../../../shared/ui/avatar/Avatar'
import ContactsSearch from './ContactsSearch'
import { useState } from 'react'
// import { ContactListDBType } from '../types/ContactListDBType';
import { useDispatch, useSelector } from 'react-redux'
//import { CardItem } from "./cardItem";
import { ContactsListDB } from './ContactsDB'
import Image from 'next/image'


type ListProps = {
  children: {
    is_online: boolean,
    was_online_at: number
  }
};


export default function ContactsList() {
  

  
  //функция вычисления времени в сети
  function ContactStatusWeb(is_online: boolean, was_online_at: number): string {

    const today = new Date();
    const milliseconds = was_online_at * 60 * 1000; 
    const lastOnlineDate = new Date(today.getTime() - milliseconds); 



    if (is_online) {
      return 'в сети';
    }
    if (was_online_at < 1) {
      return 'был(а) только что';
    }
    if (was_online_at >= 1 && was_online_at < 60) {
      const minutes = Math.floor(was_online_at);
      return `был(а) ${minutes} минут назад`;
    }
    if (was_online_at >= 60 && was_online_at < 1440) {
      const hours = Math.floor(was_online_at / 60);
      return `был(а) ${hours} часов назад`;
    }
    if (was_online_at >= 1440 && was_online_at < 2880) {
      const hours = lastOnlineDate.getHours().toString().padStart(2, '0');
      const minutes = lastOnlineDate.getMinutes().toString().padStart(2, '0');
      return `был(а) вчера в ${hours}:${minutes}`;
    }
    
    const dateString = lastOnlineDate.toLocaleDateString('ru-RU'); 
    return `был(а) ${dateString}`;
  }




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
          style={{ width: 'auto', height: 'auto' }}
        />
      </div>

      <div className="w-full h-11/12 max-h-1208 custom-scroll overflow-hidden hover:overflow-auto gap-4 flex flex-col ">
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
            statusText={ContactStatusWeb(elem.is_online, elem.was_online_at)}
          />
        ))}
      </div>

      {/* </div> */}
    </>
  )
}
