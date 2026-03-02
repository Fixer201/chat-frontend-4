import { useEffect, useRef } from 'react'

/**
 * Максимальное время ожидания появления элемента в DOM (мс).
 * Защита от бесконечного наблюдения, если элемент так и не отрендерится
 * (например, сообщение было удалено между вычислением firstUnreadUid и рендером).
 */
const OBSERVER_TIMEOUT_MS = 5000

/**
 * Хук для одноразовой прокрутки к первому непрочитанному сообщению
 * при открытии чата.
 *
 * Проблема, которую решает: при переключении чатов useMessages кратковременно
 * возвращает stale-данные предыдущего чата (loading: false, messages: [старые]).
 * Наивная проверка `!loading && messages.length > 0` срабатывает ложно,
 * и скролл выполняется до загрузки реальных сообщений.
 *
 * Стратегия:
 * 1. Ждём `messagesLoaded === true`
 * 2. Проверяем наличие реальных DOM-элементов сообщений [data-message-uid]
 * 3. Если элементов нет — подключаем MutationObserver для ожидания
 * 4. Таймаут безопасности — через 5 секунд прокручиваем к низу как фоллбэк
 *
 * @param scrollContainerRef — ref на scroll-контейнер (overflow-y)
 * @param firstUnreadUid — uid первого непрочитанного или undefined
 * @param chatKey — ключ чата для сброса при переключении
 * @param messagesLoaded — true когда сообщения загружены из API
 */
export function useScrollToUnread(
    scrollContainerRef: React.RefObject<HTMLDivElement | null>,
    firstUnreadUid: string | undefined,
    chatKey: string,
    messagesLoaded: boolean,
) {
    const hasScrolledRef = useRef(false)

    // Сброс флага при переключении чата
    useEffect(() => {
        hasScrolledRef.current = false
    }, [chatKey])

    useEffect(() => {
        if (hasScrolledRef.current) return
        if (!messagesLoaded) return

        const container = scrollContainerRef.current
        if (!container) return

        /**
         * Попытка прокрутки к целевому элементу.
         * Возвращает true если скролл выполнен.
         * Возвращает false если целевой элемент ещё не появился в DOM.
         */
        const tryScroll = (): boolean => {
            if (firstUnreadUid) {
                // Ищем разделитель непрочитанных или само сообщение.
                // Если найден — сообщения точно отрендерены, отдельная проверка не нужна.
                const divider = container.querySelector(
                    '[data-unread-divider]',
                )
                const target =
                    divider ??
                    container.querySelector(
                        `[data-message-uid="${CSS.escape(firstUnreadUid)}"]`,
                    )

                if (target) {
                    target.scrollIntoView({
                        behavior: 'instant',
                        block: 'start',
                    })
                    return true
                }
                // Элемент ещё не в DOM — вернём false для повторной попытки
                return false
            }

            // Нет непрочитанных — скроллим в конец.
            // Проверяем наличие хотя бы одного сообщения в DOM,
            // чтобы не скроллить пустой контейнер со stale-данными.
            if (
                !container.querySelector(
                    '[data-message-uid]',
                )
            )
                return false

            container.scrollTop = container.scrollHeight
            return true
        }

        // Блокируем повторный запуск эффекта на следующих рендерах.
        // ВАЖНО: firstUnreadUid должен быть доступен в том же цикле рендера,
        // где messagesLoaded становится true (см. useMarkAsRead — синхронное вычисление).
        hasScrolledRef.current = true

        let observer: MutationObserver | null = null
        let timeoutId: ReturnType<
            typeof setTimeout
        > | null = null

        const rafId = requestAnimationFrame(() => {
            if (tryScroll()) return

            // Элемент не найден — DOM ещё рендерится.
            // MutationObserver будет наблюдать за появлением элементов сообщений.
            observer = new MutationObserver(() => {
                if (tryScroll()) {
                    observer?.disconnect()
                    if (timeoutId !== null)
                        clearTimeout(timeoutId)
                }
            })

            observer.observe(container, {
                childList: true,
                subtree: true,
            })

            // Таймаут безопасности: если элементы так и не появились,
            // прокручиваем к низу как фоллбэк и прекращаем наблюдение
            timeoutId = setTimeout(() => {
                observer?.disconnect()
                container.scrollTop = container.scrollHeight
            }, OBSERVER_TIMEOUT_MS)
        })

        return () => {
            cancelAnimationFrame(rafId)
            observer?.disconnect()
            if (timeoutId !== null) clearTimeout(timeoutId)
        }
    }, [
        scrollContainerRef,
        firstUnreadUid,
        messagesLoaded,
        chatKey,
    ])
}
