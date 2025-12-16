'use client';

import MessageComposer from '@modules/message-composer/components/MessageComposer'
import ContactHeader from './ContactHeader'
import MessagesList from '@modules/chat-room/components/MessagesList'
import EmptyContactsState from './EmptyContactsState'
import { useSelector } from 'react-redux'
import { RootState } from '../../../redux/store'


export default function ContactRoom() {
    const uid = useSelector(
        (state: RootState) => state.SelectedContact.uid || null,
    )

    return uid ? (
        <div className="flex h-full flex-col rounded-md bg-gray-light">
            <ContactHeader />
            <div className="flex-1 overflow-y-auto">
                <MessagesList />
            </div>
            <MessageComposer />
        </div>
    ) : (
        <EmptyContactsState />
    )
}

