import Image from 'next/image'

export default function ContactHeader() {
    return (
        <section
            className={`
              rounded-t-md border-b border-gray-border bg-gray-main px-4 py-2
            `}
        >
            <div className="flex items-center justify-between">
                <div className="flex flex-row items-center gap-4">
                    {/* User Icon */}
                    <Image
                        src="/images/chatHeader/userAvatar.svg"
                        width="40"
                        height="40"
                        alt="user image" // в будущем заменить
                        // на реальное изображение пользователя, если его нет placeholder
                        className="rounded-full"
                    />

                    <div className="flex flex-col">
                        {/* User Full Name */}
                        <h2 className="font-semibold">
                            Chat Header
                        </h2>
                        <p className="text-sm text-text-gray">
                            Status placeholder
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Кнопки поиска, звонка и т.д. */}
                    <div className="flex gap-4 text-text-gray">
                        <Image
                            src="/images/chatHeader/Search.svg"
                            height="20"
                            width="20"
                            alt="search in chat button"
                        />
                        <Image
                            src="/images/chatHeader/Phone.svg"
                            height="20"
                            width="20"
                            alt="phone call button"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
