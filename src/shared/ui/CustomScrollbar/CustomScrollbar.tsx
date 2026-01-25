// Компонент кастомного скроллбара с перетаскиваемым ползунком
'use client'

import {
    type CSSProperties,
    type HTMLAttributes,
    type ReactNode,
    useEffect,
    useRef,
    useCallback,
} from 'react'

import { cn } from '@shared/lib/utils'
import customStyle from '@shared/ui/CustomScrollbar/CustomScrollbar.module.css'

// Интерфейс пропсов компонента CustomScrollbar
interface CustomScrollbarProps {
    children: ReactNode // Дочерние элементы, которые будут внутри скролла
    className?: string // Дополнительные классы для контейнера
    contentClassName?: string // Дополнительные классы для содержимого
    contentProps?: HTMLAttributes<HTMLDivElement> // Дополнительные пропсы для содержимого
    style?: CSSProperties // Дополнительные стили для контейнера
    contentStyle?: CSSProperties // Дополнительные стили для содержимого
    autoHeight?: boolean // Автоматическая высота контейнера
}

// Компонент кастомного скроллбара с перетаскиваемым ползунком
export function CustomScrollbar({
    children,
    className = '',
    contentClassName = '',
    contentProps,
    style,
    contentStyle,
    autoHeight = false,
}: CustomScrollbarProps) {
    // Рефы для элементов скроллбара
    const contentRef = useRef<HTMLDivElement>(null) // Контентная область
    const thumbRef = useRef<HTMLDivElement>(null) // Ползунок скроллбара
    const containerRef = useRef<HTMLDivElement>(null) // Контейнер скроллбара
    const isDraggingRef = useRef(false) // Флаг перетаскивания ползунка
    const startYRef = useRef(0) // Начальная Y координата при перетаскивании
    const startScrollTopRef = useRef(0) // Начальное значение scrollTop

    // Функция обновления позиции и размера ползунка
    const updateThumbPosition = useCallback(() => {
        const content = contentRef.current
        const thumb = thumbRef.current
        const container = containerRef.current

        if (!content || !thumb || !container) return

        const { scrollTop, scrollHeight, clientHeight } =
            content
        const containerHeight = container.clientHeight

        // Вычисляем высоту ползунка пропорционально видимой области
        const thumbHeight =
            containerHeight * (clientHeight / scrollHeight)

        // Минимальная высота ползунка (чтобы был виден)
        const minHeight = 20
        const finalThumbHeight = Math.max(
            thumbHeight,
            minHeight,
        )

        // Вычисляем позицию ползунка пропорционально скроллу
        const maxScroll = scrollHeight - clientHeight
        const thumbTop =
            maxScroll > 0
                ? (scrollTop / maxScroll) *
                  (containerHeight - finalThumbHeight)
                : 0

        // Применяем вычисленные размеры и позицию
        thumb.style.height = `${finalThumbHeight}px`
        thumb.style.top = `${thumbTop}px`
    }, [])

    // Обработчик начала перетаскивания ползунка
    const handleThumbMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()

            const thumb = thumbRef.current
            const content = contentRef.current
            if (!thumb || !content) return

            // Устанавливаем флаг перетаскивания и сохраняем начальные значения
            isDraggingRef.current = true
            startYRef.current = e.clientY
            startScrollTopRef.current = content.scrollTop

            // Добавляем стили для перетаскивания
            thumb.style.cursor = 'grabbing'
            document.body.style.userSelect = 'none' // Отключаем выделение текста при перетаскивании
        },
        [],
    )

    // Обработчик движения мыши при перетаскивании ползунка
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current) return

        const content = contentRef.current
        const container = containerRef.current
        if (!content || !container) return

        // Вычисляем смещение мыши от начальной точки
        const deltaY = e.clientY - startYRef.current
        const containerHeight = container.clientHeight
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const thumbHeight =
            thumbRef.current?.clientHeight || 20

        // Рассчитываем новый scrollTop на основе смещения мыши
        const scrollRatio =
            content.scrollHeight / containerHeight
        const newScrollTop =
            startScrollTopRef.current + deltaY * scrollRatio

        // Ограничиваем значения в пределах возможного скролла
        content.scrollTop = Math.max(
            0,
            Math.min(
                newScrollTop,
                content.scrollHeight - content.clientHeight,
            ),
        )
    }, [])

    // Обработчик отпускания мыши (завершение перетаскивания)
    const handleMouseUp = useCallback(() => {
        if (!isDraggingRef.current) return

        // Сбрасываем флаг перетаскивания
        isDraggingRef.current = false
        const thumb = thumbRef.current
        if (thumb) {
            thumb.style.cursor = 'pointer' // Возвращаем курсор
        }
        document.body.style.userSelect = '' // Включаем выделение текста обратно
    }, [])

    // Обработчик колеса мыши для скролла
    const handleWheel = useCallback((e: WheelEvent) => {
        const content = contentRef.current
        if (!content) return

        // Скроллим контент при прокрутке колеса
        content.scrollTop += e.deltaY
        e.preventDefault() // Предотвращаем скролл страницы
    }, [])

    // Эффект для установки обработчиков событий
    useEffect(() => {
        const content = contentRef.current
        const thumb = thumbRef.current
        const container = containerRef.current

        if (!content || !thumb || !container) return

        // Создаем обработчики
        const mouseMoveHandler = (e: MouseEvent) =>
            handleMouseMove(e)
        const mouseUpHandler = () => handleMouseUp()
        const wheelHandler = (e: WheelEvent) =>
            handleWheel(e)

        // Подписываемся на события документа для перетаскивания
        document.addEventListener(
            'mousemove',
            mouseMoveHandler,
        )
        document.addEventListener('mouseup', mouseUpHandler)

        // Обработчик колеса мыши на контенте
        content.addEventListener('wheel', wheelHandler, {
            passive: false,
        })

        // ResizeObserver для обновления при изменении размеров
        const resizeObserver = new ResizeObserver(() => {
            updateThumbPosition()
        })
        resizeObserver.observe(content)
        resizeObserver.observe(container)

        // Обновляем позицию ползунка при скролле
        const scrollHandler = () => updateThumbPosition()
        content.addEventListener('scroll', scrollHandler)

        // Инициализация позиции ползунка
        updateThumbPosition()

        // Очистка при размонтировании
        return () => {
            document.removeEventListener(
                'mousemove',
                mouseMoveHandler,
            )
            document.removeEventListener(
                'mouseup',
                mouseUpHandler,
            )
            content.removeEventListener(
                'wheel',
                wheelHandler,
            )
            content.removeEventListener(
                'scroll',
                scrollHandler,
            )
            resizeObserver.disconnect()
        }
    }, [
        handleMouseMove,
        handleMouseUp,
        handleWheel,
        updateThumbPosition,
    ])

    return (
        <div
            ref={containerRef}
            className={cn(
                customStyle['custom-scroll-container'],
                autoHeight &&
                    customStyle[
                        'custom-scroll-container-auto'
                    ],
                className,
            )}
            style={style}
        >
            {/* Контейнер с контентом */}
            <div
                ref={contentRef}
                className={cn(
                    customStyle['custom-scroll-content'],
                    contentClassName,
                )}
                style={contentStyle}
                {...contentProps}
            >
                {children}
            </div>

            {/* Кастомный скроллбар */}
            <div
                className={customStyle['custom-scrollbar']}
            >
                {/* Трек скроллбара (фон) */}
                <div
                    className={
                        customStyle[
                            'custom-scrollbar-track'
                        ]
                    }
                />
                {/* Ползунок скроллбара (перетаскиваемая часть) */}
                <div
                    ref={thumbRef}
                    className={
                        customStyle[
                            'custom-scrollbar-thumb'
                        ]
                    }
                    onMouseDown={handleThumbMouseDown}
                />
            </div>
        </div>
    )
}

// Использование
//<CustomScrollbar>Компонент со скроллом</CustomScrollbar>
//<CustomScrollbar><ChatList>{код}</ChatList></CustomScrollbar>
