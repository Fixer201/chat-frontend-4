'use client'

import { Message } from '@shared/types/message'
import { useAppSelector } from '@redux/store'

interface MessageItemProps {
    message: Message
}

export default function MessageItem({
    message,
}: MessageItemProps) {
    // получаем id текущего пользователя для проверки от кого пришло сообщение
    const currentUser = useAppSelector(
        (state) => state.user.currentUser,
    )

    // если отправленное сообщение принадлежит текущему пользователю -> true
    // в остальных случаях false
    const isOwn = message.from_user == currentUser?.id

    console.log(currentUser)

    // Форматирование времени
    const formatTime = (timestamp?: number) => {
        if (!timestamp) return ''
        return new Date(
            timestamp * 1000,
        ).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div
            className={`
              flex
              ${isOwn ? 'justify-end' : 'justify-start'}
            `}
        >
            <div
                className={`
                  max-w-[70%] rounded-lg px-4 py-2
                  ${
                      isOwn
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                  }
                `}
            >
                <p className="text-sm wrap-break-word whitespace-pre-wrap">
                    {message.content}
                </p>
                {message.created_at && (
                    <span className="mt-1 block text-xs opacity-70">
                        {formatTime(message.created_at)}
                    </span>
                )}
            </div>
        </div>
    )
}
