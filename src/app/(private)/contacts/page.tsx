import ContactRoom from "@modules/contacts/components/ContactRoom";
import ContactsList from "@modules/contacts/components/ContactsList";



export default function ContactsPage() {
    return <>

 <div className="flex h-screen gap-6 max-w-full">
      {/* Левая колонка - список контактов */}
       <div className="w-full h-11/12 bg-primary-foreground rounded-md md:w-80 lg:w-96 bg-gray-main custom-scroll overflow-hidden hover:overflow-auto">
      {/* <div className="w-full h-11/12 bg-primary-foreground rounded-md md:w-80 lg:w-96 rounded-lg border border-[#EEEEEE] bg-[#F5F6F8] m-4 custom-scroll overflow-hidden hover:overflow-auto"> */}
        <ContactsList />
      </div>

      {/* Правая колонка - пустой state (скрыт на mobile) */}
      <div className="hidden h-11/12 flex-1 md:block">
          {/* <EmptyChatState /> по умолчанию когда чат не выбран. Сейчас временно будет сразу отображаться чат */}
            <ContactRoom />
      </div>
    </div>




    </>;
}