import ContactRoom from '@modules/contacts/components/ContactRoom'
import ContactsList from '@modules/contacts/components/ContactsList'

export default function ContactsPage() {
    return (
        <div className="flex h-screen max-w-full gap-6">
            {/* Левая колонка - список контактов */}
            <div
                className={`
                  h-11/12 w-full rounded-md bg-gray-main
                  md:w-80
                  lg:w-96
                `}
            >
                <ContactsList />
            </div>

            {/* Правая колонка - пустой state (скрыт на mobile) */}
            <div
                className={`
                  hidden h-11/12 flex-1
                  md:block
                `}
            >
                {/* <EmptyChatState /> по умолчанию когда чат не выбран. Сейчас временно будет сразу отображаться чат */}
                <ContactRoom />
            </div>
        </div>
    )
}
