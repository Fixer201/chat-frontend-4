'use client';

import MessageComposer from '@modules/message-composer/components/MessageComposer'
import ContactHeader from './ContactHeader'
import MessagesList from '@modules/chat-room/components/MessagesList'
import EmptyContactsState from './EmptyContactsState'
import { useSelector } from 'react-redux'
import { RootState } from '../../../redux/store'
// import ChatHeader from '@modules/chat-room/components/ChatHeader';

export default function ContactRoom() {
    const uid = useSelector(
        (state: RootState) => state.SelectedContact.uid,
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
