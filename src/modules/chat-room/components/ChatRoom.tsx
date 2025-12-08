import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import MessageComposer from '@modules/message-composer/components/MessageComposer';

export default function ChatRoom() {
  return (
    <div className="flex h-full flex-col rounded-md bg-gray-light">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto">
        <MessagesList />
      </div>
      <MessageComposer />
    </div>
  );
}
