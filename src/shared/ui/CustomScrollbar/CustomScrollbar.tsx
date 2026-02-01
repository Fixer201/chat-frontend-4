// @shared/ui/CustomScrollbar/CustomScrollbar.tsx
'use client'

import {
    type CSSProperties,
    type HTMLAttributes,
    type ReactNode,
    useEffect,
    useRef,
    useCallback,
    forwardRef,
    useImperativeHandle,
} from 'react'

import { cn } from '@shared/lib/utils'
import customStyle from '@shared/ui/CustomScrollbar/CustomScrollbar.module.css'

interface CustomScrollbarProps {
    children: ReactNode
    className?: string
    contentClassName?: string
    contentProps?: HTMLAttributes<HTMLDivElement>
    style?: CSSProperties
    contentStyle?: CSSProperties
    autoHeight?: boolean
    onScroll?: (scrollTop: number) => void
}

export interface CustomScrollbarRef {
    scrollToTop: () => void
    scrollToBottom: () => void
    scrollTo: (position: number) => void
    getScrollTop: () => number
    getScrollHeight: () => number
    getClientHeight: () => number
}

export const CustomScrollbar = forwardRef<
    CustomScrollbarRef,
    CustomScrollbarProps
>(function CustomScrollbar(
    {
        children,
        className = '',
        contentClassName = '',
        contentProps,
        style,
        contentStyle,
        autoHeight = false,
        onScroll,
    },
    ref,
) {
    const contentRef = useRef<HTMLDivElement>(null)
    const thumbRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDraggingRef = useRef(false)
    const startYRef = useRef(0)
    const startScrollTopRef = useRef(0)
    const isProgrammaticScroll = useRef(false)
    const lastScrollTop = useRef(0)

    // Функция обновления позиции и размера ползунка
    const updateThumbPosition = useCallback(() => {
        const content = contentRef.current
        const thumb = thumbRef.current
        const container = containerRef.current

        if (!content || !thumb || !container) return

        const { scrollTop, scrollHeight, clientHeight } =
            content
        const containerHeight = container.clientHeight

        // Вычисляем высоту ползунка
        const thumbHeight =
            containerHeight * (clientHeight / scrollHeight)
        const minHeight = 20
        const finalThumbHeight = Math.max(
            thumbHeight,
            minHeight,
        )

        // Вычисляем позицию ползунка
        const maxScroll = scrollHeight - clientHeight
        const thumbTop =
            maxScroll > 0
                ? (scrollTop / maxScroll) *
                  (containerHeight - finalThumbHeight)
                : 0

        // Применяем вычисленные размеры
        thumb.style.height = `${finalThumbHeight}px`
        thumb.style.top = `${thumbTop}px`

        // Всегда вызываем onScroll, даже при программном скролле
        if (onScroll) {
            onScroll(scrollTop)
            lastScrollTop.current = scrollTop
        }
    }, [onScroll])

    // Отдельная функция для обновления только ползунка
    const updateThumbOnly = useCallback(() => {
        const content = contentRef.current
        const thumb = thumbRef.current
        const container = containerRef.current

        if (!content || !thumb || !container) return

        const { scrollTop, scrollHeight, clientHeight } =
            content
        const containerHeight = container.clientHeight

        const thumbHeight =
            containerHeight * (clientHeight / scrollHeight)
        const minHeight = 20
        const finalThumbHeight = Math.max(
            thumbHeight,
            minHeight,
        )

        const maxScroll = scrollHeight - clientHeight
        const thumbTop =
            maxScroll > 0
                ? (scrollTop / maxScroll) *
                  (containerHeight - finalThumbHeight)
                : 0

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

            thumb.classList.add('active')

            isDraggingRef.current = true
            startYRef.current = e.clientY
            startScrollTopRef.current = content.scrollTop

            thumb.style.cursor = 'grabbing'
            document.body.classList.add(
                'scrollbar-dragging',
            )
            document.body.style.userSelect = 'none'
        },
        [],
    )

    // Обработчик движения мыши при перетаскивании
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDraggingRef.current) return

            const content = contentRef.current
            const container = containerRef.current
            if (!content || !container) return

            const deltaY = e.clientY - startYRef.current
            const containerHeight = container.clientHeight

            const scrollRatio =
                content.scrollHeight / containerHeight
            const newScrollTop =
                startScrollTopRef.current +
                deltaY * scrollRatio

            content.scrollTop = Math.max(
                0,
                Math.min(
                    newScrollTop,
                    content.scrollHeight -
                        content.clientHeight,
                ),
            )

            updateThumbPosition()
        },
        [updateThumbPosition],
    )

    // Обработчик отпускания мыши
    const handleMouseUp = useCallback(() => {
        if (!isDraggingRef.current) return

        isDraggingRef.current = false
        const thumb = thumbRef.current
        if (thumb) {
            thumb.classList.remove('active')
            thumb.style.cursor = 'pointer'
        }
        document.body.classList.remove('scrollbar-dragging')
        document.body.style.userSelect = ''
    }, [])

    // Обработчик колеса мыши для скролла
    const handleWheel = useCallback(
        (e: WheelEvent) => {
            const content = contentRef.current
            if (!content) return

            content.scrollTop += e.deltaY

            updateThumbPosition()

            e.preventDefault()
            e.stopPropagation()
        },
        [updateThumbPosition],
    )

    // Эффект для установки обработчиков событий
    useEffect(() => {
        const content = contentRef.current
        const thumb = thumbRef.current
        const container = containerRef.current

        if (!content || !thumb || !container) return

        const mouseMoveHandler = (e: MouseEvent) =>
            handleMouseMove(e)
        const mouseUpHandler = () => handleMouseUp()
        const wheelHandler = (e: WheelEvent) => {
            handleWheel(e)
        }

        document.addEventListener(
            'mousemove',
            mouseMoveHandler,
        )
        document.addEventListener('mouseup', mouseUpHandler)
        content.addEventListener('wheel', wheelHandler, {
            passive: false,
        })

        const resizeObserver = new ResizeObserver(() => {
            updateThumbOnly()
        })
        resizeObserver.observe(content)
        resizeObserver.observe(container)

        const scrollHandler = () => {
            updateThumbOnly()
            // Вызываем onScroll при любом скролле
            if (onScroll) {
                onScroll(content.scrollTop)
                lastScrollTop.current = content.scrollTop
            }
        }
        content.addEventListener('scroll', scrollHandler)

        updateThumbOnly()

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
        updateThumbOnly,
        onScroll,
    ])

    // Экспортируем методы для управления скроллом
    useImperativeHandle(ref, () => ({
        scrollToTop: () => {
            if (contentRef.current) {
                isProgrammaticScroll.current = true
                contentRef.current.scrollTop = 0
                updateThumbOnly()
                // Всегда вызываем onScroll даже при программном скролле
                if (onScroll) {
                    onScroll(0)
                    lastScrollTop.current = 0
                }
                setTimeout(() => {
                    isProgrammaticScroll.current = false
                }, 100)
            }
        },
        scrollToBottom: () => {
            if (contentRef.current) {
                isProgrammaticScroll.current = true
                const content = contentRef.current
                content.scrollTop =
                    content.scrollHeight -
                    content.clientHeight
                updateThumbOnly()
                if (onScroll) {
                    onScroll(content.scrollTop)
                    lastScrollTop.current =
                        content.scrollTop
                }
                setTimeout(() => {
                    isProgrammaticScroll.current = false
                }, 100)
            }
        },
        scrollTo: (position: number) => {
            if (contentRef.current) {
                isProgrammaticScroll.current = true
                const content = contentRef.current
                const maxScroll =
                    content.scrollHeight -
                    content.clientHeight
                content.scrollTop = Math.max(
                    0,
                    Math.min(position, maxScroll),
                )
                updateThumbOnly()
                if (onScroll) {
                    onScroll(content.scrollTop)
                    lastScrollTop.current =
                        content.scrollTop
                }
                setTimeout(() => {
                    isProgrammaticScroll.current = false
                }, 100)
            }
        },
        getScrollTop: () => {
            return contentRef.current?.scrollTop || 0
        },
        getScrollHeight: () => {
            return contentRef.current?.scrollHeight || 0
        },
        getClientHeight: () => {
            return contentRef.current?.clientHeight || 0
        },
    }))

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

            <div
                className={customStyle['custom-scrollbar']}
            >
                <div
                    className={
                        customStyle[
                            'custom-scrollbar-track'
                        ]
                    }
                />
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
})
