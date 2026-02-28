import Image from 'next/image'
import { Message } from '@shared/types/message'

/**
 * Превью ответа на сообщение — баннер над полем ввода в MessageComposer.
 *
 * Отображает имя автора цитируемого сообщения (если доступно) и его текст
 * с визуальным акцентом (фиолетовая полоска слева + подсветка фона).
 * Используется при активации «Ответить» из контекстного меню сообщения.
 */
interface ReplyPreviewProps {
    /** Сообщение, на которое отвечает пользователь */
    message: Message
    /** Колбэк отмены: сбрасывает режим ответа в родительском ChatRoom */
    onCancel: () => void
}

/**
 * Формирует отображаемое имя автора цитируемого сообщения.
 *
 * Используется для превью в зоне ввода — пользователь видит,
 * на чьё сообщение он отвечает, перед отправкой.
 */
function getReplyAuthorLabel(message: Message): string {
    return message.from_user
        ? `Ответ на сообщение`
        : 'Ответ на сообщение'
}

export default function ReplyPreview({
    message,
    onCancel,
}: ReplyPreviewProps) {
    const authorLabel = getReplyAuthorLabel(message)

    // Если текст пустой, но есть файлы — показываем имя файла
    const firstFile = message.files?.[0]
    const fileName =
        firstFile?.filename ||
        (firstFile?.file_url
            ? decodeURIComponent(
                  firstFile.file_url
                      .split('?')[0]
                      .split('/')
                      .pop() || '',
              )
            : '')
    const displayContent =
        message.content?.trim() || fileName

    return (
        <div
            className={`
              flex items-center justify-between border-b border-l-4
              border-gray-border border-l-accent-violet-primary
              bg-accent-violet-primary/10 px-4 py-2
            `}
        >
            <div className="flex min-w-0 flex-col">
                {/* Метка режима ответа — акцентный цвет для визуального выделения */}
                <span className="text-xs font-medium text-accent-violet-primary">
                    {authorLabel}
                </span>
                {/* Текст цитируемого сообщения: одна строка с обрезкой,
                    чтобы превью не занимало много места над полем ввода */}
                <span className="line-clamp-1 text-sm text-text-gray">
                    {displayContent}
                </span>
            </div>
            {/* Кнопка отмены ответа: cursor-pointer + hover-подсветка */}
            <button
                type="button"
                onClick={onCancel}
                className={`
                  shrink-0 cursor-pointer rounded-lg p-1 text-text-gray
                  transition-colors
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
