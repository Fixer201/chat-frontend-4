'use client'

import { useCallback, useRef } from 'react'
import {
    useVirtualizer,
    Virtualizer,
} from '@tanstack/react-virtual'
import { VirtualRow } from '@shared/lib/emojiData'

/**
 * Хук виртуализации и управления скроллом для пикера эмодзи.
 *
 * Решает две взаимосвязанные задачи:
 * 1. Виртуализация: через @tanstack/react-virtual рендерит только видимые строки
 *    (+ 5 строк overscan для плавности), что снижает DOM с ~1800 элементов до ~30.
 * 2. Двусторонняя синхронизация скролла и вкладок:
 *    - Скролл → вкладка: при ручном скролле определяет текущую категорию
 *      через rowToCategoryMap и подсвечивает соответствующую вкладку.
 *    - Вкладка → скролл: при клике по вкладке программно прокручивает
 *      к заголовку категории через scrollToIndex.
 *    Для предотвращения цикличного обновления используется флаг isScrollingToRef.
 */

/** Высота строки-заголовка категории (px) */
const HEADER_HEIGHT = 44

interface UseEmojiVirtualizationOptions {
    virtualRows: VirtualRow[]
    rowHeight: number
    rowToCategoryMap: Map<number, string>
    categoryRowIndices: Map<string, number>
    selectedCategory: string
    setSelectedCategory: (category: string) => void
}

interface UseEmojiVirtualizationReturn {
    scrollContainerRef: React.RefObject<HTMLDivElement | null>
    virtualizer: Virtualizer<HTMLDivElement, Element>
    scrollToCategory: (slug: string) => void
}

export function useEmojiVirtualization({
    virtualRows,
    rowHeight,
    rowToCategoryMap,
    categoryRowIndices,
    selectedCategory,
    setSelectedCategory,
}: UseEmojiVirtualizationOptions): UseEmojiVirtualizationReturn {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    /** Флаг программного скролла: когда true, onChange виртуализатора не обновляет вкладку */
    const isScrollingToRef = useRef(false)
    /** Таймер сброса флага программного скролла после завершения анимации */
    const scrollTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)

    // Ref на текущую категорию — избегаем stale closure в onChange-колбэке
    // виртуализатора, который замыкается при создании и не видит обновлений state
    const selectedCategoryRef = useRef(selectedCategory)
    selectedCategoryRef.current = selectedCategory

    // Вычисление высоты строки: заголовок категории выше строки эмодзи
    const getRowHeight = useCallback(
        (index: number) => {
            return virtualRows[index].type === 'header'
                ? HEADER_HEIGHT
                : rowHeight
        },
        [virtualRows, rowHeight],
    )

    // Настройка виртуализатора @tanstack/react-virtual.
    // overscan: 5 — рендерим 5 дополнительных строк за пределами viewport
    // для плавности прокрутки (баланс между производительностью и визуальными артефактами).
    // onChange: при ручном скролле определяем категорию первого видимого элемента
    // и обновляем подсвеченную вкладку (если скролл не программный).
    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: virtualRows.length,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: getRowHeight,
        overscan: 5,
        onChange: (instance) => {
            // Пропускаем обновление вкладки при программном скролле,
            // чтобы избежать цикла: клик по вкладке → скролл → onChange → обновление вкладки
            if (isScrollingToRef.current) return

            const visibleRange = instance.range
            if (!visibleRange) return

            const categorySlug = rowToCategoryMap.get(
                visibleRange.startIndex,
            )
            if (
                categorySlug &&
                categorySlug !== selectedCategoryRef.current
            ) {
                setSelectedCategory(categorySlug)
            }
        },
    })

    // Программная прокрутка к категории при клике по вкладке.
    // Устанавливаем isScrollingToRef = true, чтобы onChange не обновлял вкладку
    // во время анимации скролла. Через 300мс (примерная длительность smooth-скролла)
    // флаг сбрасывается, и ручной скролл снова синхронизирует вкладки.
    const scrollToCategory = useCallback(
        (slug: string) => {
            const rowIndex = categoryRowIndices.get(slug)
            if (rowIndex === undefined) return

            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }

            isScrollingToRef.current = true
            setSelectedCategory(slug)

            virtualizer.scrollToIndex(rowIndex, {
                align: 'start',
                behavior: 'smooth',
            })

            scrollTimeoutRef.current = setTimeout(() => {
                isScrollingToRef.current = false
                scrollTimeoutRef.current = null
            }, 300)
        },
        [
            categoryRowIndices,
            virtualizer,
            setSelectedCategory,
        ],
    )

    return {
        scrollContainerRef,
        virtualizer,
        scrollToCategory,
    }
}
