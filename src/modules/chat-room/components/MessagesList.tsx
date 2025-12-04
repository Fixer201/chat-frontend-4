import Image from 'next/image'

export default function MessagesList() {
    // TODO: заменить на реальные данные
    // создать тип для сообщений, не использовать any
    const messages:any[] = [];

    return (
        <section
            role="log"
            aria-label="История сообщений"
            aria-live="polite"
            className="flex h-full w-full flex-col overflow-y-auto"
        >
            {messages.length === 0 ? (
                // Empty state
                <div
                    className="flex h-full flex-col items-center justify-center
  text-muted-foreground"
                    role="status"
                    aria-label="Пустой чат"
                >
                    <Image
                        height="200"
                        width="200"
                        src="/img_frog_Web.svg"
                        alt="Иллюстрация пустого чата"
                        aria-hidden="false"
                    />
                    <p className="text-lg font-medium">Сообщений пока нет</p>
                    <p className="text-sm">Напишите первым :)</p>
                </div>
            ) : (
                // Список сообщений
                <ul className="flex flex-col gap-2 p-4">
                    {messages.map((msg) => (
                        <li key={msg.id}>{/* MessageItem компонент */}</li>
                    ))}
                </ul>
            )}
        </section>
    );
}
