import Image from 'next/image'
import {
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react'
import { MessageFile } from '@shared/types/message'
import { formatFileSize } from '@shared/lib/formatFileSize'
import FileIcon from '@public/icons/chatList/file.svg'

/**
 * Отображение файлового вложения внутри пузыря сообщения.
 *
 * Дизайн-референсы: public/images_chat_block.jpg, public/files_sendigg.jpg
 *
 * Макет (по референсу):
 * ```
 * [icon/thumb 56×56]  [filename...............]
 *                     [size       21:49  ✓✓  ]
 * ```
 *
 * Четыре состояния левой иконки:
 * 1. **Отправка** — Telegram-style: фиолетовый круг с SVG-дугой прогресса
 *    загрузки (белая, 3px) + кнопка-крестик для отмены в центре
 * 2. **Изображение** — миниатюра 56×56 с округлением (rounded-lg)
 * 3. **Документ** — фиолетовый круг с пиктограммой файла
 *
 * `timeSlot` — опциональный React-элемент «время + статус прочтения».
 * Передаётся из MessageItem только для последнего файла в сообщении
 * без текстовой подписи. Если есть подпись — время рендерится
 * в текстовой области ниже, чтобы не дублировать.
 *
 * Клик открывает файл в новой вкладке (изображения) или скачивает (документы).
 */

/**
 * Определяет, является ли файл изображением.
 *
 * Приоритет: file_type (MIME от сервера) → расширение файла.
 * file_type надёжнее, потому что сервер проверяет содержимое,
 * а не доверяет имени файла.
 */
const IMAGE_EXTS = new Set([
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'heic',
    'bmp',
    'avif',
])

function isImageFile(file: MessageFile): boolean {
    if (file.file_type) {
        return file.file_type.startsWith('image/')
    }
    if (!file.filename) return false
    const ext =
        file.filename.split('.').pop()?.toLowerCase() || ''
    return IMAGE_EXTS.has(ext)
}

/**
 * Формирует src для <Image>.
 *
 * Приоритет: file_webp_url (оптимизация) → file_url → base64 data.
 * Base64 используется только для optimistic-сообщений (instant preview).
 */
function getImageSrc(file: MessageFile): string {
    if (file.file_webp_url) return file.file_webp_url
    if (file.file_url) return file.file_url

    const data = file.data
    if (!data) return ''
    if (
        data.startsWith('http') ||
        data.startsWith('//') ||
        data.startsWith('data:')
    )
        return data

    const ext =
        file.filename?.split('.').pop()?.toLowerCase() ||
        'jpeg'
    const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        avif: 'image/avif',
    }
    return `data:${mimeMap[ext] || 'image/jpeg'};base64,${data}`
}

/**
 * URL для скачивания/открытия файла.
 * null — файл ещё загружается (optimistic, нет URL).
 */
function getDownloadUrl(file: MessageFile): string | null {
    if (file.file_url) return file.file_url
    if (file.data) {
        if (
            file.data.startsWith('http') ||
            file.data.startsWith('data:')
        )
            return file.data
        return `data:application/octet-stream;base64,${file.data}`
    }
    return null
}

/**
 * Синхронный размер файла (байты) из локальных данных.
 *
 * Приоритет:
 * 1. file_size — кэшированное значение (optimistic или перенесённое)
 * 2. base64 data — длина × 0.75 (только для ещё не отправленных)
 * 3. 0 — размер неизвестен (серверный файл без file_size)
 *
 * Для серверных файлов (file_url без file_size) возвращает 0 —
 * асинхронный HEAD-запрос выполняется в useFileSize.
 */
function estimateSize(file: MessageFile): number {
    if (file.file_size) return file.file_size
    const data = file.data
    if (!data) return 0
    if (
        data.startsWith('http') ||
        data.startsWith('//') ||
        data.startsWith('data:')
    )
        return 0
    return Math.round(data.length * 0.75)
}

/**
 * Module-level кэш URL → размер (байты).
 *
 * Живёт до перезагрузки страницы. Предотвращает повторные HEAD-запросы
 * при скроллинге (unmount/mount одного и того же MessageFileAttachment).
 * Не используем WeakMap, т.к. ключи — строки (URL), а не объекты.
 */
const fileSizeCache = new Map<string, number>()

/**
 * Определяет размер файла для отображения в UI.
 *
 * Стратегия (от быстрого к медленному):
 * 1. Синхронный estimateSize: file_size (кэш) или base64 data
 * 2. Module-level кэш fileSizeCache (по URL)
 * 3. HEAD-запрос к file_url за Content-Length
 *
 * HEAD-запрос нужен для сообщений из истории (REST API), которые
 * не проходили через optimistic-flow и не имеют file_size.
 * Запрос выполняется один раз на URL; результат кэшируется.
 *
 * При ошибке (CORS, 404) молча возвращает 0 — строка размера скрыта.
 */
function useFileSize(file: MessageFile): number {
    const cached = estimateSize(file)
    const url = file.file_url

    // rerender-derived-state-no-effect: читаем кэш синхронно при рендере,
    // а не через setState в effect — избегаем каскадного ре-рендера
    const cacheHit = url ? (fileSizeCache.get(url) ?? 0) : 0

    const [remoteSize, setRemoteSize] = useState(0)

    useEffect(() => {
        if (cached > 0 || cacheHit > 0 || !url) return

        let cancelled = false
        fetch(url, { method: 'HEAD' })
            .then((res) => {
                const cl = res.headers.get('content-length')
                if (cl && !cancelled) {
                    const bytes = Number(cl)
                    fileSizeCache.set(url, bytes)
                    setRemoteSize(bytes)
                }
            })
            .catch(() => {})

        return () => {
            cancelled = true
        }
    }, [cached, cacheHit, url])

    return cached || cacheHit || remoteSize
}

// --- SVG Circular Progress: геометрия кольца ---
// Радиус вписан в viewBox 56×56 (28 центр − 3 strokeWidth = 25).
// circumference = 2πr — полная длина окружности, используется
// для stroke-dasharray/dashoffset техники анимации дуги.
const PROGRESS_RADIUS = 25
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS

/**
 * Имитация прогресса загрузки файла (0–100%).
 *
 * Зачем имитация: файлы отправляются через WebSocket одним фреймом,
 * реальных progress-событий нет (в отличие от XMLHttpRequest.upload).
 * Имитация даёт пользователю визуальную обратную связь и ощущение
 * контроля (кнопка отмены + движущаяся дуга).
 *
 * Три фазы:
 *   0 → 70%  — быстрая (основной визуальный прогресс)
 *  70 → 90%  — замедление (половинная скорость), создаёт ощущение
 *              «почти готово, ждём сервер»
 *  90%       — стоп, удерживается до isSending → false
 *  → 100%   — мгновенный скачок при подтверждении сервера
 *
 * Длительность масштабируется по размеру файла:
 *   baseDuration = clamp(sizeBytes / 500KB, 1.5s, 8s)
 *   ~1.5с для мелких файлов, ~2с для 1MB, ~8с потолок.
 *
 * useRef для progressRef/intervalRef — избегаем лишних ре-рендеров:
 * interval обновляет ref на каждом тике (50ms), а setState
 * вызывается только при изменении округлённого значения.
 */
function useSimulatedProgress(
    isSending: boolean,
    sizeBytes: number,
): number {
    const [progress, setProgress] = useState(0)
    const progressRef = useRef(0)
    const intervalRef = useRef<ReturnType<
        typeof setInterval
    > | null>(null)

    // rerender-derived-state-no-effect: сброс прогресса при переключении
    // isSending выполняется во время рендера, а не в effect-body.
    // React пропускает commit и сразу ре-рендерит с новым state.
    // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    const [prevIsSending, setPrevIsSending] =
        useState(isSending)
    if (isSending !== prevIsSending) {
        setPrevIsSending(isSending)
        if (isSending) {
            setProgress(0)
        }
    }

    useEffect(() => {
        if (!isSending) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            return
        }

        // Сброс ref-счётчика при старте — безопасно в effect body
        progressRef.current = 0

        const baseDuration = Math.min(
            Math.max(sizeBytes / 500_000, 1.5),
            8,
        )
        const tickMs = 50
        const phase1Ticks = (baseDuration * 1000) / tickMs
        const phase1Step = 70 / phase1Ticks
        const phase2Step = phase1Step * 0.5

        intervalRef.current = setInterval(() => {
            const cur = progressRef.current
            let next: number
            if (cur < 70) {
                next = Math.min(cur + phase1Step, 70)
            } else if (cur < 90) {
                next = Math.min(cur + phase2Step, 90)
            } else {
                // Фаза 3: удерживаем 90% — ждём подтверждения сервера
                next = 90
            }
            progressRef.current = next
            setProgress(Math.round(next))
        }, tickMs)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [isSending, sizeBytes])

    // rerender-derived-state-no-effect: когда isSending стало false,
    // а progress > 0 (таймер уже бежал) — выводим 100% напрямую.
    // Избегаем setState(100) в effect, который вызвал бы каскадный рендер.
    if (!isSending && progress > 0) return 100
    return progress
}

export default function MessageFileAttachment({
    file,
    isSending = false,
    onCancel,
    timeSlot,
}: Readonly<{
    file: MessageFile
    isSending?: boolean
    onCancel?: () => void
    /** Элемент «время + статус» — встраивается на вторую строку рядом с размером */
    timeSlot?: ReactNode
}>) {
    const name = file.filename || 'Файл'
    const isImage = isImageFile(file)
    const size = useFileSize(file)
    const downloadUrl = getDownloadUrl(file)
    const uploadProgress = useSimulatedProgress(
        isSending,
        size,
    )

    const content = (
        <div className="flex items-center gap-3 py-1">
            {/* Левая часть: прогресс загрузки / миниатюра / иконка документа.
                Размер 56×56 (h-14 w-14) — по дизайн-референсу (~60px). */}
            {isSending ? (
                /* Telegram-style индикатор загрузки:
                   - Фиолетовый круг-фон (bg-accent-violet-primary)
                   - SVG-кольцо прогресса поверх (stroke-dashoffset анимация)
                   - Белый крестик (×) в центре — кнопка отмены
                   Дизайн-референс: public/files_sendigg.jpg, public/send_files.jpg */
                <button
                    type="button"
                    onClick={onCancel}
                    className={`
                      relative flex h-14 w-14 shrink-0 cursor-pointer
                      items-center justify-center rounded-full
                      bg-accent-violet-primary transition-transform
                      active:scale-95
                    `}
                >
                    {/* SVG-кольцо прогресса.
                        rotate(-90deg) — дуга начинается с 12 часов (top), а не с 3 часов.
                        Два <circle>: трек (opacity 0.3) + заполнение (dashoffset).
                        transition на dashoffset даёт плавное движение дуги между тиками. */}
                    <svg
                        className="absolute inset-0 -rotate-90"
                        viewBox="0 0 56 56"
                        fill="none"
                    >
                        {/* Трек — полупрозрачное белое кольцо (фон дуги) */}
                        <circle
                            cx="28"
                            cy="28"
                            r={PROGRESS_RADIUS}
                            stroke="white"
                            strokeWidth="3"
                            opacity="0.3"
                            fill="none"
                        />
                        {/* Дуга прогресса — dashoffset уменьшается от circumference (0%) до 0 (100%) */}
                        <circle
                            cx="28"
                            cy="28"
                            r={PROGRESS_RADIUS}
                            stroke="white"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={
                                PROGRESS_CIRCUMFERENCE
                            }
                            strokeDashoffset={
                                PROGRESS_CIRCUMFERENCE *
                                (1 - uploadProgress / 100)
                            }
                            className={`
                              transition-[stroke-dashoffset] duration-300
                              ease-out
                            `}
                        />
                    </svg>
                    {/* Крестик (×) — иконка отмены загрузки */}
                    <svg
                        viewBox="0 0 14 14"
                        fill="none"
                        className="relative h-4 w-4"
                    >
                        <path
                            d="M1 1l12 12M13 1L1 13"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            ) : isImage ? (
                /* Миниатюра 56×56, rounded-lg (~8px).
                   `unoptimized` — data-URL не поддерживается Image Optimization. */
                <div
                    className={`
                      relative h-14 w-14 shrink-0 overflow-hidden rounded-lg
                    `}
                >
                    <Image
                        src={getImageSrc(file)}
                        alt={name}
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </div>
            ) : (
                /* Иконка документа (pdf, docx, zip...) */
                <FileIcon
                    width={56}
                    height={56}
                    className="shrink-0"
                />
            )}

            {/* Правая часть: имя файла (строка 1) + размер и время (строка 2).
                min-w-0 обязателен для truncate внутри flex. */}
            <div className="min-w-0 flex-1">
                {/* Строка 1: имя файла, обрезается с многоточием */}
                <p className="truncate text-sm font-medium text-text-black">
                    {name}
                </p>

                {/* Строка 2: размер (слева) + время и статус (справа).
                    По референсу: "1.2 МБ      21:49 ✓✓" */}
                <div className="flex items-center justify-between gap-2">
                    {size > 0 ? (
                        <span className="text-xs text-text-gray">
                            {formatFileSize(size)}
                        </span>
                    ) : (
                        <span />
                    )}
                    {timeSlot}
                </div>
            </div>
        </div>
    )

    // Если есть URL — ссылка для скачивания/открытия.
    // Изображения → target="_blank" (новая вкладка).
    // Документы → download (скачивание).
    if (downloadUrl && !isSending) {
        return (
            <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={!isImage ? name : undefined}
                className={`
                  block rounded-lg transition-colors
                  hover:bg-black-alpha-20/5
                `}
            >
                {content}
            </a>
        )
    }

    return content
}
