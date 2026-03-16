import {
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
} from 'react'
import { Message } from '@shared/types/message'

/** Интервал батчинга перед отправкой read-receipt (мс) */
const DEBOUNCE_MS = 250

/** Порог видимости: 70% элемента должно быть в scroll-контейнере */
const VISIBILITY_THRESHOLD = 0.7

/**
 * Порог для сообщений выше контейнера.
 * IO не может достичь ratio > (container / element),
 * поэтому для высоких сообщений принимаем любое пересечение.
 */
const TALL_MESSAGE_THRESHOLD = 0

interface UseViewportReadReceiptsParams {
    scrollContainerRef: React.RefObject<HTMLDivElement | null>
    chatKey: string
    currentUserId: string
    allMessages: Message[]
    markMessagesRead: (params: {
        chatKey: string
        messageUids: string[]
    }) => void
    wsStatus: string
}

/**
 * Отправка read-receipt только для сообщений, реально видимых в viewport.
 *
 * Три условия одновременно:
 *   1. li[data-message-uid] пересекает scroll-контейнер (IntersectionObserver)
 *   2. Вкладка активна (Page Visibility API)
 *   3. Сообщение — входящее и непрочитанное
 *
 * Два IO: основной (threshold 0.7) и запасной (threshold 0) для сообщений
 * выше контейнера. MutationObserver подхватывает новые WS-сообщения.
 * При обрыве WS неотправленные uid повторяются при реконнекте.
 */
export function useViewportReadReceipts({
    scrollContainerRef,
    chatKey,
    currentUserId,
    allMessages,
    markMessagesRead,
    wsStatus,
}: UseViewportReadReceiptsParams) {
    // uid, попавшие в viewport при активной вкладке
    const viewedUidsRef = useRef(new Set<string>())
    // uid, для которых WS-отправка состоялась
    const sentUidsRef = useRef(new Set<string>())
    // Очередь uid, ожидающих отправки (накапливаются за debounce-окно)
    const pendingFlushRef = useRef(new Set<string>())
    const debounceTimerRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)

    // Множество непрочитанных входящих uid — быстрый lookup для IO-колбэка.
    // useLayoutEffect, а не useEffect: MutationObserver (микротаска)
    // срабатывает ДО useEffect, и scanAndObserve увидел бы устаревший ref.
    const unreadIncomingUidsRef = useRef(new Set<string>())
    useLayoutEffect(() => {
        const unreadUids = new Set<string>()
        for (const msg of allMessages) {
            if (
                msg.uid &&
                !msg.read_at &&
                msg.from_user &&
                msg.from_user !== currentUserId
            ) {
                unreadUids.add(msg.uid)
            }
        }
        unreadIncomingUidsRef.current = unreadUids
    }, [allMessages, currentUserId])

    // Отправка накопленных uid на сервер.
    // Добавляет в sentUids только при открытом WS —
    // иначе uid останутся в viewedUids для повтора при реконнекте.
    const flush = useCallback(() => {
        if (pendingFlushRef.current.size === 0) return

        const uidsToSend = Array.from(
            pendingFlushRef.current,
        )
        pendingFlushRef.current.clear()

        if (wsStatus === 'OPEN') {
            markMessagesRead({
                chatKey,
                messageUids: uidsToSend,
            })
            for (const uid of uidsToSend) {
                sentUidsRef.current.add(uid)
            }
        }
    }, [chatKey, markMessagesRead, wsStatus])

    const scheduleFlush = useCallback(() => {
        if (debounceTimerRef.current !== null) {
            clearTimeout(debounceTimerRef.current)
        }
        debounceTimerRef.current = setTimeout(() => {
            debounceTimerRef.current = null
            flush()
        }, DEBOUNCE_MS)
    }, [flush])

    // Пометка uid как «увиденного» — добавляет в очередь на отправку
    const markViewed = useCallback(
        (uid: string) => {
            if (viewedUidsRef.current.has(uid)) return
            if (sentUidsRef.current.has(uid)) return
            if (!unreadIncomingUidsRef.current.has(uid))
                return

            viewedUidsRef.current.add(uid)
            pendingFlushRef.current.add(uid)
            scheduleFlush()
        },
        [scheduleFlush],
    )

    // Сброс всего состояния при переключении чата
    useEffect(() => {
        viewedUidsRef.current.clear()
        sentUidsRef.current.clear()
        pendingFlushRef.current.clear()
        if (debounceTimerRef.current !== null) {
            clearTimeout(debounceTimerRef.current)
            debounceTimerRef.current = null
        }
    }, [chatKey])

    // Повторная отправка неотправленных uid после реконнекта WS
    useEffect(() => {
        if (wsStatus !== 'OPEN') return

        const unsent = new Set<string>()
        for (const uid of viewedUidsRef.current) {
            if (!sentUidsRef.current.has(uid)) {
                unsent.add(uid)
            }
        }

        if (unsent.size > 0) {
            markMessagesRead({
                chatKey,
                messageUids: Array.from(unsent),
            })
            for (const uid of unsent) {
                sentUidsRef.current.add(uid)
            }
        }
    }, [wsStatus, chatKey, markMessagesRead])

    // --- Основной эффект: IO + MutationObserver + Page Visibility ---
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        // Два IO: основной (0.7) для обычных и запасной (0) для высоких сообщений.
        // IO не может выдать ratio > (container / element) для элемента крупнее root.
        let primaryObserver: IntersectionObserver | null =
            null
        let tallObserver: IntersectionObserver | null = null
        const observedElements = new Set<Element>()
        const tallElements = new Set<Element>()

        const handleIntersection = (
            entries: IntersectionObserverEntry[],
        ) => {
            if (document.visibilityState !== 'visible')
                return

            for (const entry of entries) {
                if (!entry.isIntersecting) continue

                const el = entry.target as HTMLElement
                const uid = el.dataset.messageUid
                if (!uid) continue

                markViewed(uid)

                primaryObserver?.unobserve(el)
                tallObserver?.unobserve(el)
                observedElements.delete(el)
                tallElements.delete(el)
            }
        }

        primaryObserver = new IntersectionObserver(
            handleIntersection,
            {
                root: container,
                threshold: VISIBILITY_THRESHOLD,
            },
        )

        tallObserver = new IntersectionObserver(
            handleIntersection,
            {
                root: container,
                threshold: TALL_MESSAGE_THRESHOLD,
            },
        )

        /** Находит новые непрочитанные li и подписывает на нужный IO */
        const scanAndObserve = () => {
            const elements =
                container.querySelectorAll<HTMLElement>(
                    'li[data-message-uid]',
                )

            for (const el of elements) {
                if (
                    observedElements.has(el) ||
                    tallElements.has(el)
                )
                    continue

                const uid = el.dataset.messageUid
                if (!uid) continue
                if (!unreadIncomingUidsRef.current.has(uid))
                    continue
                if (viewedUidsRef.current.has(uid)) continue

                if (
                    el.clientHeight >=
                    container.clientHeight
                ) {
                    tallElements.add(el)
                    tallObserver!.observe(el)
                } else {
                    observedElements.add(el)
                    primaryObserver!.observe(el)
                }
            }
        }

        scanAndObserve()

        // MutationObserver: пересканирование при появлении новых li.
        // Дебаунс через rAF — не реагируем на каждое микро-изменение DOM
        // (toggle классов от поиска, выделения и т.д.).
        let mutationRafId: number | null = null
        const mutationObserver = new MutationObserver(
            () => {
                if (mutationRafId !== null) return
                mutationRafId = requestAnimationFrame(
                    () => {
                        mutationRafId = null
                        scanAndObserve()
                    },
                )
            },
        )

        mutationObserver.observe(container, {
            childList: true,
            subtree: true,
        })

        // При возврате на вкладку пересоздаём IO:
        // элементы, уже находящиеся в viewport, не вызывают повторный колбэк —
        // disconnect + observe заново решает эту проблему.
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const primaryElements = Array.from(
                    observedElements,
                )
                const tallElems = Array.from(tallElements)

                primaryObserver?.disconnect()
                tallObserver?.disconnect()

                primaryObserver = new IntersectionObserver(
                    handleIntersection,
                    {
                        root: container,
                        threshold: VISIBILITY_THRESHOLD,
                    },
                )
                tallObserver = new IntersectionObserver(
                    handleIntersection,
                    {
                        root: container,
                        threshold: TALL_MESSAGE_THRESHOLD,
                    },
                )

                for (const el of primaryElements) {
                    primaryObserver.observe(el)
                }
                for (const el of tallElems) {
                    tallObserver.observe(el)
                }

                scanAndObserve()
            }
        }

        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange,
        )

        return () => {
            primaryObserver?.disconnect()
            tallObserver?.disconnect()
            mutationObserver.disconnect()
            if (mutationRafId !== null) {
                cancelAnimationFrame(mutationRafId)
            }
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            )

            if (debounceTimerRef.current !== null) {
                clearTimeout(debounceTimerRef.current)
                debounceTimerRef.current = null
            }
        }
    }, [scrollContainerRef, chatKey, markViewed])
}
