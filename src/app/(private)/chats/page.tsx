import ChatsList from '@modules/chats-list/components/ChatsList';
import EmptyChatState from '@modules/chat-room/components/EmptyChatState';
import ChatRoom from "@modules/chat-room/components/ChatRoom";

export default function ChatsPage() {
  return (
    <div className="flex h-screen gap-6">
      {/* Левая колонка - список чатов */}
      <div className="w-full h-11/12 bg-primary-foreground rounded-md md:w-80 lg:w-96">
        <ChatsList />
      </div>

      {/* Правая колонка - пустой state (скрыт на mobile) */}
      <div className="hidden h-11/12 flex-1 md:block">
          {/* <EmptyChatState /> по умолчанию когда чат не выбран. Сейчас временно будет сразу отображаться чат */}
            <ChatRoom></ChatRoom>
      </div>
    </div>
  );
}
