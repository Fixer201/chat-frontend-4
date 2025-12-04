export default function ChatHeader() {
  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Chat Header</h2>
          <p className="text-sm text-muted-foreground">Status placeholder</p>
        </div>
        <div className="flex gap-2">
          {/* Кнопки поиска, звонка и т.д. */}
          <div className="text-muted-foreground">Actions</div>
        </div>
      </div>
    </div>
  );
}
