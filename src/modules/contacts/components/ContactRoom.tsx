import MessageComposer from '@modules/message-composer/components/MessageComposer'
import ContactHeader from './ContactHeader'
import MessagesList from '@modules/chat-room/components/MessagesList'
import EmptyContactsState from './EmptyContactsState'

export default function ContactRoom({
    idContact,
}: {
    idContact: string | null
}) {
    return idContact ? (
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
