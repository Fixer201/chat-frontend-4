'use client'

import { useCallback, useRef } from 'react'
import {
    useVirtualizer,
    Virtualizer,
} from '@tanstack/react-virtual'
import { VirtualRow } from '@shared/lib/emojiData'

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
    const isScrollingToRef = useRef(false)
    const scrollTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)

    // Ref for current category to avoid stale closure in onChange
    const selectedCategoryRef = useRef(selectedCategory)
    selectedCategoryRef.current = selectedCategory

    // Calculate row height
    const getRowHeight = useCallback(
        (index: number) => {
            return virtualRows[index].type === 'header'
                ? HEADER_HEIGHT
                : rowHeight
        },
        [virtualRows, rowHeight],
    )

    // Virtualizer setup
    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: virtualRows.length,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: getRowHeight,
        overscan: 5,
        onChange: (instance) => {
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

    // Scroll to category when tab is clicked
    const scrollToCategory = useCallback(
        (slug: string) => {
            const rowIndex = categoryRowIndices.get(slug)
            if (rowIndex === undefined) return

            // Clear previous timeout
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }

            isScrollingToRef.current = true
            setSelectedCategory(slug)

            virtualizer.scrollToIndex(rowIndex, {
                align: 'start',
                behavior: 'smooth',
            })

            // Reset flag after scroll animation
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
