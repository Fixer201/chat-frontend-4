'use client'

import Image from 'next/image'
import Smile from '@public/icons/messageComposer/Smile.svg'
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea'
import { EmojiPickerWithCategories } from './EmojiPickerWithCategories'
import ReplyPreview from './ReplyPreview'
import dynamic from 'next/dynamic'
import FilePickerMenu from './FilePickerMenu'
import { cn } from '@shared/lib/utils'
import { useWebSocket } from '@shared/context/websocketContext'
import { Message } from '@shared/types/message'

// SendFileModal тяжёлый (FileReader, image preview),
// загружается только при выборе файлов, не нужен при SSR
const SendFileModal = dynamic(
    () => import('./SendFileModal'),
    {
        ssr: false,
    },
)

type MessageComposerProps = {
    chatKey: string
    toUserId: string
    chatType?:
        | 'chat'
        | 'public-group'
        | 'private-group'
        | 'public-channel'
        | 'private-channel'
    editingMessage?: Message | null
    replyingMessage?: Message | null
    onCancelEdit?: () => void
    onCancelReply?: () => void
}

export default function MessageComposer({
    chatKey,
    toUserId,
    chatType,
    editingMessage,
    replyingMessage,
    onCancelEdit,
    onCancelReply,
}: Readonly<MessageComposerProps>) {
    // Текст сообщения в поле ввода. Начальное значение берётся из editingMessage
    // (если компонент смонтирован в режиме редактирования) либо остаётся пустым.
    // Сброс при смене сообщения реализуется через паттерн key на уровне родителя.
    const [inputValue, setInputValue] = useState(
        editingMessage?.content ?? '',
    )

    // Флаг, управляющий видимостью выпадающего пикера эмодзи.
    // Открывается при наведении/фокусе на кнопку смайлика,
    // закрывается с задержкой 500мс для плавного перехода курсора к пикеру.
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] =
        useState(false)

    // Ref на таймер задержки закрытия пикера эмодзи.
    // Позволяет отменить запланированное закрытие, если пользователь
    // вернул курсор на кнопку/пикер до истечения 500мс задержки.
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Ref на textarea с автоматическим изменением высоты при вводе текста
    const textareaRef = useAutoResizeTextarea(inputValue)

    // Методы WebSocket-контекста: sendMessage для отправки нового сообщения,
    // updateMessage для обновления существующего (режим редактирования)
    const { sendMessage, updateMessage } = useWebSocket()

    // Состояние выпадающего меню выбора файлов (изображение / файл)
    const [isFileMenuOpen, setIsFileMenuOpen] =
        useState(false)

    // Файлы, выбранные пользователем для отправки через модальное окно
    const [pendingFiles, setPendingFiles] = useState<
        File[]
    >([])

    // Ref-ы на скрытые input[type=file] для выбора изображений и файлов
    const imageInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSelectImage = useCallback(() => {
        imageInputRef.current?.click()
    }, [])

    const handleSelectFile = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    // Обработка выбора файлов из нативного диалога
    const handleFilesSelected = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = event.target.files
            if (
                !selectedFiles ||
                selectedFiles.length === 0
            )
                return
            setPendingFiles(Array.from(selectedFiles))
            // Сбрасываем value, чтобы повторный выбор того же файла сработал
            event.target.value = ''
        },
        [],
    )

    // Каждый файл отправляется отдельным сообщением
    // Подпись (caption) прикрепляется только к первому файлу.
    const handleFileSend = useCallback(
        (
            files: { filename: string; data: string }[],
            caption: string,
        ) => {
            files.forEach((file, index) => {
                sendMessage({
                    chatKey: chatKey,
                    content: index === 0 ? caption : '',
                    toUserId: toUserId,
                    status: 'publish',
                    files: [file],
                })
            })
            setPendingFiles([])
        },
        [sendMessage, chatKey, toUserId],
    )

    const handleFileModalClose = useCallback(() => {
        setPendingFiles([])
    }, [])

    // При переходе в режим редактирования автоматически устанавливаем фокус
    // на textarea, чтобы пользователь мог сразу начать редактировать текст
    useEffect(() => {
        if (editingMessage) {
            textareaRef.current?.focus()
        }
        // textareaRef — стабильный ref-объект, не меняется между рендерами,
        // поэтому безопасно исключён из массива зависимостей
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingMessage])

    // Универсальный обработчик отправки: определяет режим (создание/редактирование/ответ)
    // по наличию editingMessage или replyingMessage и вызывает соответствующий метод WebSocket.
    // После успешной отправки очищает поле ввода и выходит из соответствующего режима.
    const handleSendMessage = () => {
        // Игнорируем отправку пустого или состоящего только из пробелов сообщения
        if (inputValue.trim().length === 0) return

        if (editingMessage && editingMessage.uid) {
            // Режим редактирования: обновляем существующее сообщение по его uid,
            // затем уведомляем родительский компонент о завершении редактирования
            updateMessage({
                uid: editingMessage.uid,
                chatKey: chatKey,
                content: inputValue,
                status: 'publish',
            })
            console.log(
                'Редактирование сообщения:',
                inputValue,
            )
            onCancelEdit?.()
        } else {
            /**
             * Режим создания или ответа: отправляем новое сообщение через WebSocket.
             *
             * При наличии replyingMessage формируем объект RepliedMessage
             * с метаданными автора (from_user), чтобы компонент RepliedMessage
             * корректно отобразил имя автора цитируемого сообщения.
             */
            const repliedMessages = replyingMessage
                ? [
                      {
                          uid: replyingMessage.uid,
                          content: replyingMessage.content,
                          from_user:
                              replyingMessage.from_user,
                      },
                  ]
                : undefined

            sendMessage({
                chatKey: chatKey,
                content: inputValue,
                toUserId: toUserId,
                status: 'publish',
                chatType,
                repliedMessages,
            })

            // Если был режим ответа, уведомляем родителя о завершении
            if (replyingMessage) {
                onCancelReply?.()
            }
        }

        // Очищаем поле ввода после отправки, чтобы подготовить его к новому сообщению
        setInputValue('')
    }

    // Отмена редактирования: сбрасываем текст в поле ввода
    // и уведомляем родителя через колбэк для выхода из режима редактирования
    const handleCancel = () => {
        setInputValue('')
        onCancelEdit?.()
    }

    // Обработчик клавиатурных событий в textarea.
    // Enter (без Shift) — отправка сообщения; Shift+Enter — перенос строки (по умолчанию).
    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            // Пропускаем событие, если активна IME-композиция (например, ввод
            // иероглифов или корейских символов), чтобы не прерывать набор
            if (event.nativeEvent.isComposing) return

            // Предотвращаем вставку символа новой строки и отправляем сообщение
            event.preventDefault()
            handleSendMessage()
        }
    }

    // Добавляет выбранный эмодзи в конец текущего текста в поле ввода
    const handleEmojiSelect = (emoji: string) => {
        setInputValue(inputValue + emoji)
    }

    // Открытие пикера эмодзи по наведению или фокусу.
    // Если ранее было запланировано закрытие (таймер), отменяем его —
    // это позволяет пользователю перемещать курсор между кнопкой и пикером
    // без мерцания (паттерн «hover intent»).
    const handleEmojiPickerOpen = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        setIsEmojiPickerOpen(true)
    }

    // Закрытие пикера эмодзи с задержкой 500мс.
    // Задержка нужна, чтобы пользователь успел переместить курсор
    // с кнопки-триггера на сам пикер, не вызывая его закрытия.
    // Если за это время сработает handleEmojiPickerOpen — таймер будет отменён.
    const handleEmojiPickerClose = () => {
        timerRef.current = setTimeout(() => {
            setIsEmojiPickerOpen(false)
            timerRef.current = null
        }, 500)
    }

    return (
        <div
            className={`
              flex h-fit max-h-[472] flex-col rounded-b-md border-t
              border-gray-border bg-gray-light
            `}
        >
            {/* Баннер режима редактирования: отображается при наличии editingMessage,
                показывает текст «Редактирование сообщения» и кнопку отмены */}
            {editingMessage && (
                <div
                    className={`
                      flex items-center justify-between border-b
                      border-gray-border bg-accent-violet-primary/10 px-4 py-2
                    `}
                >
                    <div className="text-sm text-text-gray">
                        <span className="font-medium text-accent-violet-primary">
                            Редактирование сообщения
                        </span>
                    </div>
                    {/* Кнопка отмены редактирования: cursor-pointer + hover */}
                    <button
                        type="button"
                        onClick={handleCancel}
                        className={`
                          cursor-pointer rounded-lg p-1 text-text-gray
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
            )}

            {/* Превью ответа: отображается при наличии replyingMessage */}
            {replyingMessage && onCancelReply && (
                <ReplyPreview
                    message={replyingMessage}
                    onCancel={onCancelReply}
                />
            )}

            <div
                className={`
                  flex items-end justify-between px-2 py-3
                  md:px-4
                `}
            >
                {/* Кнопка прикрепления файла (скрепка) + выпадающее меню выбора типа файла */}
                <div className="relative mb-2">
                    <button
                        aria-label="Attach file"
                        type="button"
                        onClick={() =>
                            setIsFileMenuOpen(
                                (prev) => !prev,
                            )
                        }
                        className={`
                          cursor-pointer rounded-lg p-1 transition-colors
                          hover:bg-gray-main
                          focus-visible:outline-2
                          focus-visible:outline-accent-violet-primary
                          active:scale-95
                        `}
                    >
                        <Image
                            width={25}
                            height={25}
                            src="/icons/messageComposer/Paperclip.svg"
                            alt=""
                        />
                    </button>

                    {isFileMenuOpen && (
                        <FilePickerMenu
                            onSelectImage={
                                handleSelectImage
                            }
                            onSelectFile={handleSelectFile}
                            onClose={() =>
                                setIsFileMenuOpen(false)
                            }
                        />
                    )}

                    {/* Скрытые input-ы для нативного диалога выбора файлов */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFilesSelected}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFilesSelected}
                    />
                </div>

                {/* Поле ввода сообщения: textarea с автоматическим ростом высоты,
                    кнопкой эмодзи и всплывающим пикером эмодзи */}
                <div
                    className={`
                      relative mx-1 flex h-full max-h-96 w-full items-center
                      justify-between rounded-3xl bg-white-bg px-2 py-3
                      md:mx-2
                    `}
                >
                    <textarea
                        ref={textareaRef}
                        name="message"
                        aria-label="Message input"
                        placeholder="Сообщение"
                        value={inputValue}
                        onKeyDown={handleKeyDown}
                        onChange={(event) =>
                            setInputValue(
                                event.target.value,
                            )
                        }
                        className={`
                          h-auto max-h-80 flex-1 resize-none rounded-3xl pr-8
                          pl-2
                          placeholder:text-text-gray
                          focus:outline-0
                        `}
                        rows={1} // начальная высота в одну строку, далее растёт автоматически через useAutoResizeTextarea
                    />

                    {/* Кнопка-триггер пикера эмодзи: открывается по hover/focus,
                        закрывается с задержкой по mouseleave/blur для плавного UX.
                        cursor-pointer на button, fill-цвет на SVG — разделение ответственности */}
                    <div
                        role="button"
                        aria-label="Open emoji picker"
                        className={`
                          absolute right-4 bottom-2 mb-1.5 cursor-pointer
                        `}
                        onMouseEnter={handleEmojiPickerOpen}
                        onMouseLeave={
                            handleEmojiPickerClose
                        }
                        onFocus={handleEmojiPickerOpen}
                        onBlur={handleEmojiPickerClose}
                    >
                        <Smile
                            width={20}
                            height={20}
                            src="/icons/messageComposer/Smile.svg"
                            alt=""
                            className={cn(
                                'fill-text-gray transition-colors',
                                isEmojiPickerOpen &&
                                    'fill-accent-violet-primary',
                            )}
                        />
                        {isEmojiPickerOpen && (
                            <div
                                className={`
                                  absolute right-0 bottom-full z-50 mb-2
                                `}
                            >
                                <EmojiPickerWithCategories
                                    onEmojiSelect={
                                        handleEmojiSelect
                                    }
                                    className={`
                                      h-full max-h-[50vh] min-h-[20vh] w-full
                                      rounded-lg bg-white-bg shadow-lg
                                    `}
                                    emojiSize={32}
                                    emojisPerRow={11}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Контекстная кнопка действия: если поле ввода пустое — иконка записи
                    голосового сообщения (микрофон), если есть текст — иконка отправки.
                    cursor-pointer на button, а не на Image child */}
                <button
                    type="button"
                    aria-label={
                        inputValue.length > 0
                            ? 'Send message'
                            : 'Record voice message'
                    }
                    onClick={
                        inputValue.length > 0
                            ? handleSendMessage
                            : undefined
                    }
                    className={`
                      relative mb-2 h-8 w-8 cursor-pointer transition-transform
                      hover:opacity-80
                      focus-visible:outline-2
                      focus-visible:outline-accent-violet-primary
                      active:scale-90
                    `}
                >
                    {inputValue.length > 0 ? (
                        <Image
                            fill
                            src="/icons/messageComposer/SendMessage.svg"
                            alt=""
                            className="object-contain"
                        />
                    ) : (
                        <Image
                            fill
                            src="/icons/messageComposer/Microphone.svg"
                            alt=""
                            className="object-contain"
                        />
                    )}
                </button>
            </div>

            {pendingFiles.length > 0 ? (
                <SendFileModal
                    files={pendingFiles}
                    onSend={handleFileSend}
                    onClose={handleFileModalClose}
                />
            ) : null}
        </div>
    )
}
