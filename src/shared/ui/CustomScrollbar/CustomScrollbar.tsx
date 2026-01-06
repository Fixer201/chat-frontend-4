'use client'

import { useEffect, useRef, useCallback } from 'react'
import customStyle from '@shared/ui/СustomScrollbar/СustomScrollbar.module.css'
export function CustomScrollbar({
    children,
    className = '',
}: {
    children: React.ReactNode
    className?: string
}) {
    const contentRef = useRef<HTMLDivElement>(null)
    const thumbRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDraggingRef = useRef(false)
    const startYRef = useRef(0)
    const startScrollTopRef = useRef(0)

    // Функция обновления позиции ползунка
    const updateThumbPosition = useCallback(() => {
        const content = contentRef.current
        const thumb = thumbRef.current
        const container = containerRef.current

        if (!content || !thumb || !container) return

        const { scrollTop, scrollHeight, clientHeight } =
            content
        const containerHeight = container.clientHeight
        const thumbHeight =
            containerHeight * (clientHeight / scrollHeight)

        // Минимальная высота ползунка
        const minHeight = 20
        const finalThumbHeight = Math.max(
            thumbHeight,
            minHeight,
        )

        // Позиция ползунка
        const maxScroll = scrollHeight - clientHeight
        const thumbTop =
            maxScroll > 0
                ? (scrollTop / maxScroll) *
                  (containerHeight - finalThumbHeight)
                : 0

        thumb.style.height = `${finalThumbHeight}px`
        thumb.style.top = `${thumbTop}px`
    }, [])

    // Обработчик начала перетаскивания
    const handleThumbMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()

            const thumb = thumbRef.current
            const content = contentRef.current
            if (!thumb || !content) return

            isDraggingRef.current = true
            startYRef.current = e.clientY
            startScrollTopRef.current = content.scrollTop

            // Добавляем стили для перетаскивания
            thumb.style.cursor = 'grabbing'
            document.body.style.userSelect = 'none'
        },
        [],
    )

    // Обработчик движения мыши при перетаскивании
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current) return

        const content = contentRef.current
        const container = containerRef.current
        if (!content || !container) return

        const deltaY = e.clientY - startYRef.current
        const containerHeight = container.clientHeight
        const thumbHeight =
            thumbRef.current?.clientHeight || 20
        const trackHeight = containerHeight - thumbHeight

        // Рассчитываем новый scrollTop
        const scrollRatio =
            content.scrollHeight / containerHeight
        const newScrollTop =
            startScrollTopRef.current + deltaY * scrollRatio

        // Ограничиваем значения
        content.scrollTop = Math.max(
            0,
            Math.min(
                newScrollTop,
                content.scrollHeight - content.clientHeight,
            ),
        )
    }, [])

    // Обработчик отпускания мыши
    const handleMouseUp = useCallback(() => {
        if (!isDraggingRef.current) return

        isDraggingRef.current = false
        const thumb = thumbRef.current
        if (thumb) {
            thumb.style.cursor = 'pointer'
        }
        document.body.style.userSelect = ''
    }, [])

    // Обработчик колеса мыши
    const handleWheel = useCallback((e: WheelEvent) => {
        const content = contentRef.current
        if (!content) return

        content.scrollTop += e.deltaY
        e.preventDefault()
    }, [])

    useEffect(() => {
        const content = contentRef.current
        const thumb = thumbRef.current
        const container = containerRef.current

        if (!content || !thumb || !container) return

        // Добавляем обработчики событий
        const mouseMoveHandler = (e: MouseEvent) =>
            handleMouseMove(e)
        const mouseUpHandler = () => handleMouseUp()
        const wheelHandler = (e: WheelEvent) =>
            handleWheel(e)

        // Подписываемся на события документа для drag
        document.addEventListener(
            'mousemove',
            mouseMoveHandler,
        )
        document.addEventListener('mouseup', mouseUpHandler)

        // Обработчик колеса мыши на контенте
        content.addEventListener('wheel', wheelHandler, {
            passive: false,
        })

        // Ресайз обзервер для обновления при изменении размеров
        const resizeObserver = new ResizeObserver(() => {
            updateThumbPosition()
        })
        resizeObserver.observe(content)
        resizeObserver.observe(container)

        // Обновляем позицию ползунка при скролле
        const scrollHandler = () => updateThumbPosition()
        content.addEventListener('scroll', scrollHandler)

        // Инициализация
        updateThumbPosition()

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
            className={`
              ${customStyle['custom-scroll-container']}
              ${className}
            `}
        >
            <div
                ref={contentRef}
                className={`
                  ${customStyle['custom-scroll-content']}
                `}
            >
                {children}
            </div>
            <div
                className={`
                  ${customStyle['custom-scrollbar']}
                `}
            >
                <div
                    className={`
                      ${customStyle['custom-scrollbar-track']}
                    `}
                />
                <div
                    ref={thumbRef}
                    className={`
                      ${customStyle['custom-scrollbar-thumb']}
                    `}
                    onMouseDown={handleThumbMouseDown}
                />
            </div>
        </div>
    )
}

//Использование
//<CustomScrollbar>Компонент со скроллом</CustomScrollbar>
//<CustomScrollbar><ChatList>{код}</ChatList></CustomScrollbar>
