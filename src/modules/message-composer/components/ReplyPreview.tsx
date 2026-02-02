import Image from 'next/image'
import { Message } from '@shared/types/message'

/**
 * Превью ответа на сообщение — баннер над полем ввода в MessageComposer.
 *
 * Отображает текст цитируемого сообщения с визуальным акцентом
 * (фиолетовая полоска слева + подсветка фона) и кнопку отмены.
 * Используется при активации «Ответить» из контекстного меню сообщения.
 */
interface ReplyPreviewProps {
    /** Сообщение, на которое отвечает пользователь */
    message: Message
    /** Колбэк отмены: сбрасывает режим ответа в родительском ChatRoom */
    onCancel: () => void
}

export default function ReplyPreview({
    message,
    onCancel,
}: ReplyPreviewProps) {
    return (
        <div
            className={`
              flex items-center justify-between border-b border-l-4
              border-gray-border border-l-accent-violet-primary
              bg-accent-violet-primary/10 px-4 py-2
            `}
        >
            <div className="flex flex-col">
                <span className="text-xs font-medium text-accent-violet-primary">
                    Ответ на сообщение
                </span>
                <span className="line-clamp-1 text-sm text-text-gray">
                    {message.content}
                </span>
            </div>
            {/* Кнопка отмены ответа: cursor-pointer + hover-подсветка */}
            <button
                type="button"
                onClick={onCancel}
                className={`
                  cursor-pointer rounded-lg p-1 text-text-gray transition-colors
                  hover:bg-gray-main hover:text-text-black
                  focus-visible:outline-2
                  focus-visible:outline-accent-violet-primary
                  active:scale-95
                `}
            >
                <Image
                    src="/images/search/iconsClose.svg"
                    alt="Отменить"
                    width={20}
                    height={20}
                />
            </button>
        </div>
    )
}
