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
    /**
     * Вызывается когда пользователь пытается проскроллить ВВЕРХ,
     * но контент уже на вершине (scrollTop === 0).
     * deltaY — положительное при скролле вниз, отрицательное при скролле вверх.
     */
    onAttemptScrollBeyondTop?: (
        deltaY: number,
        scrollTop?: number,
    ) => void
    /**
     * Скрывает визуальную полосу прокрутки (используется при неявных
     * переходах вверх/вниз чтобы не показывать ползунок во время действия).
     */
    hideScrollbar?: boolean
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
        onAttemptScrollBeyondTop,
        hideScrollbar = false,
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
    const startTouchYRef = useRef(0)

    // Функция обновления позиции и размера ползунка
    const updateThumbPosition = useCallback(() => {
        const content = contentRef.current
        const thumb = thumbRef.current
        const container = containerRef.current

        if (!content || !thumb || !container) return

        const { scrollTop, scrollHeight, clientHeight } =
            content
        const containerHeight = container.clientHeight

        // Если прокрутки нет — скрываем ползунок полностью
        const maxScroll = scrollHeight - clientHeight
        if (maxScroll <= 0) {
            thumb.style.height = `0px`
            thumb.style.top = `0px`
            container.classList.add(
                customStyle['custom-scrollbar-hidden'],
            )
            // Вызываем onScroll, но ничего не делаем с позицией ползунка
            if (onScroll) {
                onScroll(scrollTop)
                lastScrollTop.current = scrollTop
            }
            return
        }

        // Вычисляем высоту ползунка
        const thumbHeight =
            containerHeight * (clientHeight / scrollHeight)
        const minHeight = 20
        const finalThumbHeight = Math.max(
            thumbHeight,
            minHeight,
        )

        // Вычисляем позицию ползунка
        const thumbTop =
            (scrollTop / maxScroll) *
            (containerHeight - finalThumbHeight)

        // Применяем вычисленные размеры
        thumb.style.height = `${finalThumbHeight}px`
        thumb.style.top = `${thumbTop}px`
        container.classList.remove(
            customStyle['custom-scrollbar-hidden'],
        )

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

        const maxScroll = scrollHeight - clientHeight
        if (maxScroll <= 0) {
            thumb.style.height = `0px`
            thumb.style.top = `0px`
            container.classList.add(
                customStyle['custom-scrollbar-hidden'],
            )
            return
        }

        const thumbHeight =
            containerHeight * (clientHeight / scrollHeight)
        const minHeight = 20
        const finalThumbHeight = Math.max(
            thumbHeight,
            minHeight,
        )

        const thumbTop =
            (scrollTop / maxScroll) *
            (containerHeight - finalThumbHeight)

        thumb.style.height = `${finalThumbHeight}px`
        thumb.style.top = `${thumbTop}px`
        container.classList.remove(
            customStyle['custom-scrollbar-hidden'],
        )
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

            const maxScroll =
                content.scrollHeight - content.clientHeight

            if (process.env.NODE_ENV !== 'production') {
                console.debug('[CustomScrollbar] wheel', {
                    deltaY: e.deltaY,
                    scrollTopBefore: content.scrollTop,
                    maxScroll,
                })
            }

            // Если контента для прокрутки нет — не блокируем событие, даём ему всплыть
            if (maxScroll <= 0) {
                // Но при попытке тянуть вниз уведомим родителя (overscroll)
                if (
                    content.scrollTop <= 1 &&
                    e.deltaY < 0
                ) {
                    if (
                        process.env.NODE_ENV !==
                        'production'
                    ) {
                        console.debug(
                            '[CustomScrollbar] attempt beyond top (not scrollable)',
                            { deltaY: e.deltaY },
                        )
                    }
                    if (onAttemptScrollBeyondTop) {
                        onAttemptScrollBeyondTop(
                            e.deltaY,
                            0,
                        )
                    }
                }
                return
            }

            // Есть куда прокручивать — выполняем прокрутку и блокируем событие
            content.scrollTop += e.deltaY

            updateThumbPosition()

            // Если мы уже на вершине и пользователь пытается скроллить вверх —
            // уведомляем родителя для возможного возврата в главный экран
            if (content.scrollTop <= 1 && e.deltaY < 0) {
                if (process.env.NODE_ENV !== 'production') {
                    console.debug(
                        '[CustomScrollbar] attempt beyond top',
                        { deltaY: e.deltaY },
                    )
                }
                if (onAttemptScrollBeyondTop) {
                    onAttemptScrollBeyondTop(e.deltaY, 0)
                }
            }

            e.preventDefault()
            e.stopPropagation()
        },
        [updateThumbPosition, onAttemptScrollBeyondTop],
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

        const touchStartHandler = (e: TouchEvent) => {
            startTouchYRef.current =
                e.touches[0]?.clientY || 0
        }

        const touchMoveHandler = (e: TouchEvent) => {
            const currentY = e.touches[0]?.clientY || 0
            const deltaY = startTouchYRef.current - currentY

            if (process.env.NODE_ENV !== 'production') {
                console.debug(
                    '[CustomScrollbar] touchmove',
                    {
                        deltaY,
                        scrollTopBefore: content.scrollTop,
                    },
                )
            }

            const maxScroll =
                content.scrollHeight - content.clientHeight

            // Если прокрутки нет — не блокируем событие, но уведомим родителя при тяге вниз
            if (maxScroll <= 0) {
                if (
                    content.scrollTop <= 1 &&
                    deltaY < -10
                ) {
                    if (
                        process.env.NODE_ENV !==
                        'production'
                    ) {
                        console.debug(
                            '[CustomScrollbar] attempt beyond top touch (not scrollable)',
                            { deltaY },
                        )
                    }
                    if (onAttemptScrollBeyondTop) {
                        onAttemptScrollBeyondTop(deltaY, 0)
                    }
                }

                startTouchYRef.current = currentY
                return
            }

            // Применяем смещение к контенту
            content.scrollTop += deltaY
            updateThumbPosition()

            // Если мы на вершине и тянем вниз — уведомляем родителя
            if (content.scrollTop <= 1 && deltaY < -10) {
                if (process.env.NODE_ENV !== 'production') {
                    console.debug(
                        '[CustomScrollbar] attempt beyond top touch',
                        { deltaY },
                    )
                }
                if (onAttemptScrollBeyondTop) {
                    onAttemptScrollBeyondTop(deltaY, 0)
                }
            }

            startTouchYRef.current = currentY

            e.preventDefault()
            e.stopPropagation()
        }

        document.addEventListener(
            'mousemove',
            mouseMoveHandler,
        )
        document.addEventListener('mouseup', mouseUpHandler)
        content.addEventListener('wheel', wheelHandler, {
            passive: false,
        })
        content.addEventListener(
            'touchstart',
            touchStartHandler,
            {
                passive: false,
            },
        )
        content.addEventListener(
            'touchmove',
            touchMoveHandler,
            {
                passive: false,
            },
        )

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
                'touchstart',
                touchStartHandler,
            )
            content.removeEventListener(
                'touchmove',
                touchMoveHandler,
            )
            content.removeEventListener(
                'touchstart',
                touchStartHandler,
            )
            content.removeEventListener(
                'touchmove',
                touchMoveHandler,
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
        updateThumbPosition,
        onScroll,
        onAttemptScrollBeyondTop,
    ])

    // Экспортируем методы для управления скроллом
    useImperativeHandle(ref, () => ({
        // Вспомогательная анимация скролла для плавного programmatic scroll
        animateScrollTo: (
            target: number,
            duration = 220,
        ) => {
            const content = contentRef.current
            if (!content) return
            isProgrammaticScroll.current = true
            const maxScroll =
                content.scrollHeight - content.clientHeight
            const dest = Math.max(
                0,
                Math.min(target, maxScroll),
            )
            const start = content.scrollTop
            if (start === dest) {
                updateThumbOnly()
                if (onScroll) {
                    onScroll(content.scrollTop)
                    lastScrollTop.current =
                        content.scrollTop
                }
                setTimeout(() => {
                    isProgrammaticScroll.current = false
                }, 80)
                return
            }

            const startTime = performance.now()
            const step = (now: number) => {
                const elapsed = now - startTime
                const t = Math.min(1, elapsed / duration)
                const eased =
                    t < 0.5
                        ? 2 * t * t
                        : -1 + (4 - 2 * t) * t
                const current =
                    start + (dest - start) * eased
                content.scrollTop = current
                updateThumbOnly()
                if (onScroll) {
                    onScroll(content.scrollTop)
                    lastScrollTop.current =
                        content.scrollTop
                }
                if (t < 1) {
                    requestAnimationFrame(step)
                } else {
                    setTimeout(() => {
                        isProgrammaticScroll.current = false
                    }, 60)
                }
            }
            requestAnimationFrame(step)
        },

        scrollToTop: function () {
            // @ts-expect-error - вызов animateScrollTo из объекта
            this.animateScrollTo(0)
        },
        scrollToBottom: function () {
            const content = contentRef.current
            if (!content) return
            const dest =
                content.scrollHeight - content.clientHeight
            // @ts-expect-error - вызов animateScrollTo из объекта
            this.animateScrollTo(dest)
        },
        scrollTo: function (position: number) {
            // @ts-expect-error - вызов animateScrollTo из объекта
            this.animateScrollTo(position)
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
                hideScrollbar &&
                    customStyle['custom-scrollbar-hidden'],
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
