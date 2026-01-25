import ContactsList from '@modules/contacts/components/ContactsList'
import EmptyContactsState from '@modules/contacts/components/EmptyContactsState'

export default function ContactsPage() {
    return (
        <div className="flex h-screen max-w-full gap-6">
            {/* Левая колонка - список контактов */}
            <div
                className={`
                  h-(--screen-height-list) w-full overflow-hidden rounded-md
                  border border-app-divider bg-gray-main
                  md:w-80
                  lg:w-96
                `}
            >
                <ContactsList />
            </div>

            {/* Правая колонка - пустой state (скрыт на mobile) */}
            <div
                className={`
                  hidden h-(--screen-height-list) flex-1 rounded-md border
                  border-app-divider
                  md:block
                `}
            >
                <EmptyContactsState />
                {/* <ChatRoom /> */}
            </div>
        </div>
    )
}
