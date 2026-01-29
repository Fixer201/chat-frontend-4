import ContactsList from '@modules/contacts/components/ContactsList'
import EmptyContactsState from '@modules/contacts/components/EmptyContactsState'

export default function ContactsPage() {
    return (
        <div
            className={`
          flex h-full w-full gap-2
          md:gap-6
        `}
        >
            {/* Левая колонка - список контактов */}
            <div
                className={`
                  w-full overflow-hidden rounded-md border border-app-divider
                  bg-gray-main
                  md:w-80
                  lg:w-96
                `}
            >
                <ContactsList />
            </div>

            {/* Правая колонка - пустой state (скрыт на mobile) */}
            <div
                className={`
                  hidden flex-1 rounded-md border border-app-divider
                  bg-gray-main
                  md:block
                `}
            >
                <EmptyContactsState />
                {/* <ChatRoom /> */}
            </div>
        </div>
    )
}
