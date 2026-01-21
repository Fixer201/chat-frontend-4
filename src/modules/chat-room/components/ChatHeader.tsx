import Image from 'next/image'
import { ChatItem } from '@shared/types/chat'
import { formatLastSeen } from '@shared/lib/formatLastSeen'
import getAvatarSrc from '@shared/lib/getAvatarSrc'

export default function ChatHeader({
    chat,
}: Readonly<{
    chat: ChatItem
}>) {
    return (
        <section
            className={`
              rounded-t-md border-b border-gray-border bg-gray-light px-4 py-2
            `}
        >
            <div className="flex items-center justify-between">
                <div className="flex flex-row items-center gap-4">
                    <Image
                        src={getAvatarSrc(chat.chat)}
                        width={40}
                        height={40}
                        alt={
                            chat.chat.firstName +
                            ' ' +
                            chat.chat.lastName
                        }
                        className="rounded-full"
                        unoptimized
                    />

                    <div className="flex flex-col">
                        {/* User Full Name */}
                        <h2 className="font-semibold">
                            {chat.chat.firstName}{' '}
                            {chat.chat.lastName}
                        </h2>
                        <p className="text-sm text-text-gray">
                            {formatLastSeen(
                                chat.lastActivityAt * 1000,
                            ) || 'был(а) давно'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Кнопки поиска, звонка и т.д. */}
                    <div className="flex gap-4 text-text-gray">
                        <button
                            className="cursor-pointer"
                            type="button"
                        >
                            <Image
                                src="/images/chatHeader/Search.svg"
                                height="20"
                                width="20"
                                alt="search in chat button"
                            />
                        </button>
                        <button
                            className="cursor-pointer"
                            type="button"
                        >
                            <Image
                                src="/images/chatHeader/Phone.svg"
                                height="20"
                                width="20"
                                alt="phone call button in chat"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
