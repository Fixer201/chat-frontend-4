import { RefObject, useEffect, useState } from 'react'

/**
 * Хук для плавающей таблетки с датой (Telegram-like floating date pill).
 *
 * Отслеживает инлайн-разделители дат (`[data-date-divider]`) внутри
 * скролл-контейнера и возвращает timestamp того разделителя, который
 * прокручен за верхний край. Когда все разделители видны — возвращает null.
 *
 * Использует IntersectionObserver для отслеживания видимости разделителей
 * и MutationObserver для пересоздания наблюдателя при изменении DOM
 * (новые сообщения, смена чата).
 */
export function useFloatingDate(
    scrollRef: RefObject<HTMLDivElement | null>,
): number | null {
    const [activeTimestamp, setActiveTimestamp] = useState<
        number | null
    >(null)

    useEffect(() => {
        const scrollContainer = scrollRef.current
        if (!scrollContainer) return

        let intersectionObserver: IntersectionObserver | null =
            null

        /**
         * Создаёт IntersectionObserver, который отслеживает все
         * элементы [data-date-divider] внутри скролл-контейнера.
         *
         * Логика: если разделитель НЕ intersecting и его boundingClientRect.top
         * меньше rootBounds.top — он ушёл за верхний край → добавляем в Set.
         * Иначе — убираем из Set.
         *
         * activeTimestamp = max из всех прокрученных timestamps (самая свежая дата).
         */
        function createObserver() {
            // Очищаем предыдущий observer
            if (intersectionObserver) {
                intersectionObserver.disconnect()
            }

            const passedTimestamps = new Set<number>()

            const dividers =
                scrollContainer!.querySelectorAll<HTMLElement>(
                    '[data-date-divider]',
                )

            if (dividers.length === 0) {
                setActiveTimestamp(null)
                return
            }

            intersectionObserver = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        const ts = Number(
                            (entry.target as HTMLElement)
                                .dataset.dateDivider,
                        )
                        if (Number.isNaN(ts)) continue

                        if (
                            !entry.isIntersecting &&
                            entry.boundingClientRect.top <
                                entry.rootBounds!.top
                        ) {
                            // Разделитель ушёл за верхний край
                            passedTimestamps.add(ts)
                        } else {
                            // Разделитель видим или ниже — убираем
                            passedTimestamps.delete(ts)
                        }
                    }

                    if (passedTimestamps.size === 0) {
                        setActiveTimestamp(null)
                    } else {
                        setActiveTimestamp(
                            Math.max(...passedTimestamps),
                        )
                    }
                },
                {
                    root: scrollContainer,
                    threshold: 0,
                },
            )

            dividers.forEach((el) =>
                intersectionObserver!.observe(el),
            )
        }

        // Первичное создание observer
        createObserver()

        // MutationObserver: пересоздаём IntersectionObserver при изменении DOM
        // (новые сообщения, смена чата, загрузка истории)
        const mutationObserver = new MutationObserver(
            () => {
                createObserver()
            },
        )

        mutationObserver.observe(scrollContainer, {
            childList: true,
            subtree: true,
        })

        return () => {
            intersectionObserver?.disconnect()
            mutationObserver.disconnect()
        }
    }, [scrollRef])

    return activeTimestamp
}
