export default function ChatPage({ params }: { params: { chatId: string } }) {
  return <div>Chat {params.chatId}</div>;
}
