'use client'

/**
 * Компонент отвечает за:
 * 1. Отображение списка прикреплённых файлов с превью для изображений
 * 2. Возможность удалять отдельные файлы перед отправкой
 * 3. Добавление текстовой подписи к файлам (с авторесайзом textarea)
 * 4. Вставку эмодзи через EmojiPickerWithCategories
 * 5. Конвертацию файлов в base64 и отправку через callback onSend
 *
 * Поток данных:
 *   files (File[]) → attachedFiles (AttachedFile[]) → base64 → onSend()
 *
 * Паттерны:
 * - Hover-intent для emoji picker (задержка 500мс при уходе курсора)
 * - Автоматическое закрытие модалки при удалении всех файлов
 * - Очистка Object URL при размонтировании (предотвращение утечек памяти)
 */

import Image from 'next/image'
import Smile from '@public/icons/messageComposer/Smile.svg'
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import { formatFileSize } from '@shared/lib/formatFileSize'
import { cn } from '@shared/lib/utils'
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea'
import { EmojiPickerWithCategories } from './EmojiPickerWithCategories'

/**
 * Внутреннее представление прикреплённого файла.
 *
 * @property id         — уникальный идентификатор (crypto.randomUUID),
 *                        используется как React-ключ и для удаления
 * @property file       — оригинальный объект File из input/drag-and-drop
 * @property previewUrl — Object URL для превью изображений,
 *                        null если файл не является картинкой
 */
type AttachedFile = {
    id: string
    file: File
    previewUrl: string | null
}

/**
 * Пропсы компонента SendFileModal.
 *
 * @property files   — массив файлов, выбранных пользователем
 *                     (передаётся из FilePickerMenu или drag-and-drop)
 * @property onSend  — колбэк отправки: принимает массив объектов
 *                     {filename, data (base64)} и текст подписи
 * @property onClose — колбэк закрытия модального окна
 */
type SendFileModalProps = {
    files: File[]
    onSend: (
        files: { filename: string; data: string }[],
        caption: string,
    ) => void
    onClose: () => void
}

/**
 * Конвертирует файл в строку base64 через FileReader API.
 *
 * Алгоритм:
 * 1. FileReader читает файл как Data URL (формат: data:<mime>;base64,<data>)
 * 2. Отсекаем префикс "data:...;base64," через split(',')[1]
 * 3. Возвращаем чистую base64-строку, готовую для отправки на сервер
 *
 * Промис реджектится при ошибке чтения (например, файл удалён из ФС).
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            // Отсекаем MIME-префикс, оставляем только base64-данные
            resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

/**
 * Проверяет, является ли файл изображением по MIME-типу.
 * Используется для определения: показывать превью или иконку-заглушку.
 */
function isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
}

/**
 * Склонение слова «файл» по правилам русского языка.
 *
 * Правила склонения:
 * - 1 файл → "Отправить файл"
 * - 2–4 файла → "Отправить N файла" (кроме 12–14)
 * - 5–20 файлов → "Отправить N файлов"
 * - 21 файл → "Отправить 21 файл" (цикл повторяется)
 *
 * Исключение: числа 11–14 всегда используют форму «файлов»,
 * поэтому проверяем mod100 на попадание в диапазон 10–19.
 */
function pluralizeFiles(count: number): string {
    // Единственное число — особый случай без числительного
    if (count === 1) return 'Отправить файл'

    const mod10 = count % 10
    const mod100 = count % 100

    // Родительный падеж единственного числа: 2, 3, 4 (но не 12, 13, 14)
    if (
        mod10 >= 2 &&
        mod10 <= 4 &&
        (mod100 < 10 || mod100 >= 20)
    ) {
        return `Отправить ${count} файла`
    }

    // Родительный падеж множественного числа: всё остальное
    return `Отправить ${count} файлов`
}

/**
 * Максимальная высота textarea в пикселях.
 * Ограничение ~40% от высоты контейнера модалки,
 * чтобы список файлов оставался видимым при длинной подписи.
 */
const MODAL_TEXTAREA_MAX_HEIGHT = 160

// ─────────────────────────────────────────────────────────────────
// Компонент
// ─────────────────────────────────────────────────────────────────

/**
 * Модальное окно отправки файлов.
 *
 * Жизненный цикл:
 * 1. Инициализация: files → attachedFiles с генерацией UUID и Object URL
 * 2. Взаимодействие: пользователь удаляет файлы, вводит подпись, выбирает эмодзи
 * 3. Отправка: handleSend конвертирует все файлы в base64 и вызывает onSend
 * 4. Очистка: useEffect отзывает Object URL при изменении/размонтировании
 *
 * Закрытие модалки:
 * - Клик по оверлею (за пределами карточки)
 * - Нажатие Escape
 * - Кнопка «×» в заголовке
 * - Удаление всех файлов (автозакрытие через queueMicrotask)
 */
export default function SendFileModal({
    files,
    onSend,
    onClose,
}: Readonly<SendFileModalProps>) {
    // Текст подписи к файлам (опционально)
    const [caption, setCaption] = useState('')

    // Флаг процесса отправки — блокирует повторные нажатия кнопки
    const [isSending, setIsSending] = useState(false)

    /**
     * Внутренний массив файлов с метаданными для рендеринга.
     * Инициализируется лениво (функция в useState) — генерируем UUID
     * и создаём Object URL для превью изображений только один раз.
     */
    const [attachedFiles, setAttachedFiles] = useState<
        AttachedFile[]
    >(() =>
        files.map((file) => ({
            id: crypto.randomUUID(),
            file,
            // Object URL создаётся только для изображений — для остальных null
            previewUrl: isImageFile(file)
                ? URL.createObjectURL(file)
                : null,
        })),
    )

    /**
     * Хук авторесайза textarea.
     * При вводе текста textarea автоматически увеличивается по высоте,
     * но не превышает MODAL_TEXTAREA_MAX_HEIGHT (160px).
     * После превышения лимита появляется вертикальный скролл.
     */
    const textareaRef = useAutoResizeTextarea(
        caption,
        MODAL_TEXTAREA_MAX_HEIGHT,
    )

    // Реализация hover-intent: пикер открывается мгновенно при наведении,
    // но закрывается с задержкой 500мс, чтобы пользователь мог
    // переместить курсор с кнопки на панель эмодзи.

    /** Состояние видимости emoji picker */
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] =
        useState(false)

    /** Ref для таймера задержки закрытия (hover-intent паттерн) */
    const emojiTimerRef = useRef<NodeJS.Timeout | null>(
        null,
    )

    /**
     * Открытие emoji picker.
     * Если есть активный таймер закрытия — отменяем его,
     * чтобы пикер не мигал при быстром перемещении курсора.
     */
    const handleEmojiPickerOpen = useCallback(() => {
        if (emojiTimerRef.current) {
            clearTimeout(emojiTimerRef.current)
            emojiTimerRef.current = null
        }
        setIsEmojiPickerOpen(true)
    }, [])

    /**
     * Закрытие emoji picker с задержкой 500мс.
     * Задержка нужна для hover-intent: пользователь может
     * навести курсор на сам пикер, и тогда таймер отменится.
     */
    const handleEmojiPickerClose = useCallback(() => {
        emojiTimerRef.current = setTimeout(() => {
            setIsEmojiPickerOpen(false)
            emojiTimerRef.current = null
        }, 500)
    }, [])

    /**
     * Вставка выбранного эмодзи в конец текста подписи.
     * Используем функциональный setState для гарантии актуального значения.
     */
    const handleEmojiSelect = useCallback(
        (emoji: string) => {
            setCaption((prev) => prev + emoji)
        },
        [],
    )

    // Object URL (blob:...) захватывают память — необходимо освобождать
    // через URL.revokeObjectURL при удалении файла или размонтировании.

    /**
     * Ref для хранения текущих Object URL.
     * Используем ref а не state, т.к. нам не нужен ре-рендер
     * при обновлении этого списка — он нужен только для cleanup.
     */
    const previewUrlsRef = useRef<string[]>([])

    /**
     * Эффект синхронизации Object URL с массивом файлов.
     *
     * При каждом изменении attachedFiles:
     * 1. Обновляем ref актуальным списком URL
     * 2. Функция cleanup (return) отзывает все URL при размонтировании
     *
     * Это предотвращает утечки памяти — каждый Object URL
     * удерживает blob в памяти браузера до явного освобождения.
     */
    useEffect(() => {
        previewUrlsRef.current = attachedFiles
            .map((a) => a.previewUrl)
            .filter(Boolean) as string[]

        return () => {
            previewUrlsRef.current.forEach((url) =>
                URL.revokeObjectURL(url),
            )
        }
    }, [attachedFiles])

    // ─── Обработчики действий ────────────────────────────────────

    /**
     * Удаление файла из списка по его UUID.
     *
     * Алгоритм:
     * 1. Находим удаляемый файл и освобождаем его Object URL (если есть)
     * 2. Фильтруем массив, исключая удалённый элемент
     * 3. Если после удаления файлов не осталось — закрываем модалку
     *
     * queueMicrotask используется для закрытия, чтобы setState
     * завершился корректно перед вызовом onClose (избегаем
     * обновления стейта размонтированного компонента).
     */
    const handleRemoveFile = useCallback(
        (id: string) => {
            setAttachedFiles((prev) => {
                const removed = prev.find(
                    (f) => f.id === id,
                )
                // Освобождаем Object URL удалённого файла
                if (removed?.previewUrl) {
                    URL.revokeObjectURL(removed.previewUrl)
                }
                const next = prev.filter((f) => f.id !== id)
                // Автозакрытие модалки при пустом списке
                if (next.length === 0) {
                    queueMicrotask(() => onClose())
                }
                return next
            })
        },
        [onClose],
    )

    /**
     * Отправка всех файлов.
     *
     * Процесс:
     * 1. Блокируем кнопку (isSending = true) для предотвращения дублей
     * 2. Параллельно конвертируем все файлы в base64 через Promise.all
     * 3. Вызываем onSend с массивом {filename, data} и подписью
     * 4. При ошибке логируем в консоль (файл мог быть удалён из ФС)
     * 5. Разблокируем кнопку в finally (даже при ошибке)
     */
    const handleSend = useCallback(async () => {
        // Защита от отправки пустого списка
        if (attachedFiles.length === 0) return
        setIsSending(true)

        try {
            // Параллельная конвертация всех файлов в base64
            const converted = await Promise.all(
                attachedFiles.map(async (af) => ({
                    filename: af.file.name,
                    data: await fileToBase64(af.file),
                })),
            )
            // Передаём результат в родительский компонент
            onSend(converted, caption.trim())
        } catch (error) {
            console.error(
                'Ошибка при конвертации файлов:',
                error,
            )
        } finally {
            // Разблокируем кнопку независимо от результата
            setIsSending(false)
        }
    }, [attachedFiles, caption, onSend])

    /**
     * Обработчик клавиш в textarea подписи.
     *
     * Enter (без Shift) → отправка файлов.
     * Shift+Enter → перенос строки (стандартное поведение textarea).
     *
     * Проверка isComposing нужна для корректной работы
     * с IME-вводом (китайский, японский, корейский) —
     * Enter в режиме композиции не должен отправлять.
     */
    const handleKeyDown = useCallback(
        (
            event: React.KeyboardEvent<HTMLTextAreaElement>,
        ) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                // IME-композиция — игнорируем Enter
                if (event.nativeEvent.isComposing) return
                event.preventDefault()
                if (!isSending) handleSend()
            }
        },
        [handleSend, isSending],
    )

    /**
     * Обработчик Escape на оверлее.
     * Позволяет закрыть модалку клавиатурой
     * для обеспечения доступности (a11y).
     */
    const handleOverlayKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        },
        [onClose],
    )

    // Заголовок модалки с правильным склонением
    const title = pluralizeFiles(attachedFiles.length)

    // ─── Рендер ──────────────────────────────────────────────────

    return (
        /**
         * Полноэкранный оверлей-затемнение.
         * z-index 9999 — поверх всех элементов интерфейса.
         * Клик по оверлею (не по контенту) закрывает модалку.
         */
        <div
            className={`
              fixed inset-0 z-[9999] flex items-center justify-center
              bg-violet-shadow-dark px-4
            `}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => {
                // Закрытие только при клике на сам оверлей, не на дочерние элементы
                if (e.target === e.currentTarget) onClose()
            }}
            onKeyDown={handleOverlayKeyDown}
        >
            {/* Карточка модального окна — белый контейнер с закруглениями */}
            <div
                className={`
                  flex w-full max-w-md flex-col rounded-xl bg-white-bg
                  shadow-context-shadow
                `}
            >
                {/* ── Заголовок с кнопкой закрытия ─────────────── */}
                <div
                    className={`
                      flex items-center justify-between border-b
                      border-gray-border px-5 py-4
                    `}
                >
                    {/* Текст заголовка: "Отправить файл / N файла / N файлов" */}
                    <h2 className="text-base font-medium text-text-black">
                        {title}
                    </h2>

                    {/* Кнопка закрытия (×) в правом верхнем углу */}
                    <button
                        type="button"
                        onClick={onClose}
                        className={`
                          cursor-pointer rounded-lg p-1 text-text-gray
                          transition-colors
                          hover:bg-gray-light hover:text-text-black
                          active:scale-95
                        `}
                    >
                        <Image
                            src="/images/search/iconsClose.svg"
                            alt="Закрыть"
                            width={20}
                            height={20}
                        />
                    </button>
                </div>

                {/* ── Скроллируемый список прикреплённых файлов ── */}
                {/* max-h-60 (240px) — ограничение высоты с вертикальным скроллом */}
                <div className="max-h-60 overflow-y-auto px-5 py-3">
                    {attachedFiles.map((af) => (
                        /**
                         * Карточка отдельного файла.
                         * Структура: [Превью/Иконка] [Имя + Размер] [Кнопка удаления]
                         */
                        <div
                            key={af.id}
                            className="flex items-center gap-3 rounded-lg py-2"
                        >
                            {/* Круглая миниатюра: превью для картинок, иконка для остальных */}
                            <div
                                className={cn(
                                    `
                                      flex h-10 w-10 shrink-0 items-center
                                      justify-center rounded-full
                                    `,
                                    af.previewUrl
                                        ? 'relative overflow-hidden'
                                        : 'bg-accent-violet-primary',
                                )}
                            >
                                {af.previewUrl ? (
                                    /**
                                     * Превью изображения через Object URL.
                                     * fill + object-cover — масштабирование с обрезкой.
                                     * unoptimized — т.к. blob URL не поддерживает Next.js оптимизацию.
                                     */
                                    <Image
                                        src={af.previewUrl}
                                        alt={af.file.name}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                ) : (
                                    /**
                                     * Иконка-заглушка для не-изображений.
                                     * brightness-0 invert — делаем SVG белым поверх фиолетового фона.
                                     */
                                    <Image
                                        src="/icons/messageComposer/files-pin/file.svg"
                                        alt=""
                                        width={16}
                                        height={20}
                                        className="brightness-0 invert"
                                    />
                                )}
                            </div>

                            {/* Информация о файле: имя (truncate при переполнении) и размер */}
                            <div className="min-w-0 flex-1">
                                <p
                                    className={`
                                      truncate text-sm font-medium
                                      text-text-black
                                    `}
                                >
                                    {af.file.name}
                                </p>
                                {/* Размер файла в человекочитаемом формате (КБ, МБ и т.д.) */}
                                <p className="text-xs text-text-gray">
                                    {formatFileSize(
                                        af.file.size,
                                    )}
                                </p>
                            </div>

                            {/* Кнопка удаления файла (иконка корзины) */}
                            <button
                                type="button"
                                onClick={() =>
                                    handleRemoveFile(af.id)
                                }
                                className={`
                                  shrink-0 cursor-pointer rounded-lg p-1.5
                                  text-text-gray transition-colors
                                  hover:bg-gray-light hover:text-red-500
                                  active:scale-95
                                `}
                                aria-label={`Удалить ${af.file.name}`}
                            >
                                {/* SVG иконка корзины — инлайн для гибкости цвета через currentColor */}
                                <svg
                                    width="16"
                                    height="18"
                                    viewBox="0 0 16 18"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M3 18C2.45 18 1.979 17.804 1.587 17.412C1.195 17.02 0.999 16.549 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.804 17.021 14.412 17.413C14.02 17.805 13.549 18.001 13 18H3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                {/* ── Панель ввода подписи и отправки ─────────── */}
                {/* Паттерн идентичен MessageComposer:
                    textarea + emoji picker + кнопка отправки */}
                <div
                    className={`
                      flex items-end gap-2 border-t border-gray-border px-3 py-3
                    `}
                >
                    {/* Контейнер ввода с закруглёнными краями (pill-shape) */}
                    <div
                        className={`
                          relative flex w-full items-center justify-between
                          rounded-3xl bg-gray-light px-2 py-3
                        `}
                    >
                        {/*
                         * Textarea подписи к файлам.
                         * - rows={1} — начальная высота в одну строку
                         * - Авторесайз через useAutoResizeTextarea хук
                         * - max-h-40 (160px) — CSS-ограничение совпадает с MODAL_TEXTAREA_MAX_HEIGHT
                         * - autoFocus — фокус при открытии модалки для удобства
                         * - Enter отправляет, Shift+Enter — перенос строки
                         */}
                        <textarea
                            ref={textareaRef}
                            value={caption}
                            onChange={(e) =>
                                setCaption(e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="Добавить подпись"
                            rows={1}
                            className={`
                              h-auto max-h-40 flex-1 resize-none rounded-3xl
                              pr-8 pl-2
                              placeholder:text-text-gray
                              focus:outline-0
                            `}
                            autoFocus
                        />

                        {/*
                         * Кнопка emoji picker (иконка смайлика).
                         * Позиционирование: absolute в правом нижнем углу textarea.
                         *
                         * Hover-intent реализован через onMouseEnter/onMouseLeave:
                         * - Наведение → мгновенное открытие
                         * - Уход курсора → закрытие через 500мс (если не навели на пикер)
                         *
                         * onFocus/onBlur дублируют поведение для клавиатурной навигации (a11y).
                         */}
                        <div
                            role="button"
                            aria-label="Open emoji picker"
                            className={`
                              absolute right-4 bottom-2 mb-1.5 cursor-pointer
                            `}
                            onMouseEnter={
                                handleEmojiPickerOpen
                            }
                            onMouseLeave={
                                handleEmojiPickerClose
                            }
                            onFocus={handleEmojiPickerOpen}
                            onBlur={handleEmojiPickerClose}
                        >
                            {/* Иконка смайлика — подсвечивается фиолетовым когда пикер открыт */}
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

                            {/* Всплывающая панель эмодзи — позиционируется над кнопкой */}
                            {isEmojiPickerOpen && (
                                <div
                                    className={`
                                      absolute right-0 bottom-full z-50 mb-2
                                    `}
                                >
                                    {/*
                                     * EmojiPickerWithCategories — переиспользуемый компонент.
                                     * Тот же пикер что в MessageComposer, но с адаптированными размерами.
                                     * max-h-[50vh] — не более половины экрана.
                                     * min-h-[20vh] — минимальная высота для удобства выбора.
                                     */}
                                    <EmojiPickerWithCategories
                                        onEmojiSelect={
                                            handleEmojiSelect
                                        }
                                        className={`
                                          h-full max-h-[50vh] min-h-[20vh]
                                          w-full rounded-lg bg-white-bg
                                          shadow-lg
                                        `}
                                        emojiSize={32}
                                        emojisPerRow={11}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/*
                     * Кнопка отправки файлов (иконка бумажного самолётика).
                     *
                     * Заблокирована (disabled) когда:
                     * - isSending = true (идёт конвертация/отправка)
                     * - attachedFiles пуст (все файлы удалены)
                     *
                     * Визуальные эффекты:
                     * - hover:opacity-80 — затемнение при наведении
                     * - active:scale-90 — сжатие при клике (тактильная обратная связь)
                     * - disabled:opacity-50 — полупрозрачность неактивной кнопки
                     */}
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={
                            isSending ||
                            attachedFiles.length === 0
                        }
                        className={`
                          relative mb-2 h-8 w-8 shrink-0 cursor-pointer
                          transition-transform
                          hover:opacity-80
                          focus-visible:outline-2
                          focus-visible:outline-accent-violet-primary
                          active:scale-90
                          disabled:cursor-not-allowed disabled:opacity-50
                        `}
                        aria-label="Отправить файлы"
                    >
                        <Image
                            fill
                            src="/icons/messageComposer/SendMessage.svg"
                            alt=""
                            className="object-contain"
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}
