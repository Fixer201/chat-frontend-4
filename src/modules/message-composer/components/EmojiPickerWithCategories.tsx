'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { EmojiCategoryTabs } from './EmojiCategoryTabs'
import { cn } from '@lib/utils'
import { useRecentEmojis } from '@shared/hooks/useRecentEmojis'
import { computeCategoryRowIndices, computeVirtualRows, emojiGroups, getCategoryName } from '@shared/lib/emojiData'
import { EmojiGroup, EmojiPickerWithCategoriesProps } from '@shared/types/Emoji'
import EmojiRow from '@modules/message-composer/components/EmojiRow'

const HEADER_HEIGHT = 44
const ROW_GAP = 4
const PADDING_X_AXIS = 20

export function EmojiPickerWithCategories({
                                              onEmojiSelect,
                                              className = '',
                                              emojisPerRow = 11,
                                              emojiSize = 32,
                                          }: Readonly<EmojiPickerWithCategoriesProps>) {

    const [selectedCategory, setSelectedCategory] = useState('smileys_emotion')

    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const isScrollingToRef = useRef(false)

    const { recentEmojis, addRecentEmoji } = useRecentEmojis()

    // Create recent group when we have recent emojis
    const recentGroup: EmojiGroup | null = useMemo(() => {
        if (recentEmojis.length === 0) return null
        return {
            name: 'Недавние',
            slug: 'recent',
            emojis: recentEmojis.map(emoji => ({
                emoji,
                name: emoji,
                slug: emoji,
                skin_tone_support: false,
            })),
        }
    }, [recentEmojis])

    // Combine recent + all groups
    const allGroups = useMemo(() => {
        return recentGroup ? [recentGroup, ...emojiGroups] : emojiGroups
    }, [recentGroup])

    // Compute virtual rows (header + emoji rows)
    const virtualRows = useMemo(
        () => computeVirtualRows(allGroups, emojisPerRow),
        [allGroups, emojisPerRow],
    )

    // Map category slug to row index for scroll-to
    const categoryRowIndices = useMemo(
        () => computeCategoryRowIndices(virtualRows),
        [virtualRows],
    )

    // Calculate row height
    const rowHeight = emojiSize + ROW_GAP
    const getRowHeight = useCallback(
        (index: number) => {
            return virtualRows[index].type === 'header' ? HEADER_HEIGHT : rowHeight
        },
        [virtualRows, rowHeight],
    )

    // Virtualizer setup
    const virtualizer = useVirtualizer({
        count: virtualRows.length,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: getRowHeight,
        overscan: 5,
        onChange: (instance) => {
            if (isScrollingToRef.current) return

            // Find first visible header to determine active category
            const visibleRange = instance.range
            if (!visibleRange) return

            for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
                const row = virtualRows[i]
                if (row && row.slug !== selectedCategory) {
                    // Find the category that contains the first visible row
                    let categorySlug = row.slug

                    // If we're past first rows, check what category we're in
                    if (i > 0) {
                        // Look backwards to find the header
                        for (let j = i; j >= 0; j--) {
                            if (virtualRows[j].type === 'header') {
                                categorySlug = virtualRows[j].slug
                                break
                            }
                        }
                    }

                    if (categorySlug !== selectedCategory) {
                        setSelectedCategory(categorySlug)
                    }
                    break
                }
            }
        },
    })

    // Handle emoji click via event delegation
    const handleContainerClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const target = e.target as HTMLElement
            const button = target.closest('[data-emoji]') as HTMLElement | null
            if (!button) return

            const emoji = button.dataset.emoji
            if (emoji) {
                addRecentEmoji(emoji)
                onEmojiSelect(emoji)
            }
        },
        [onEmojiSelect, addRecentEmoji],
    )

    // Scroll to category when tab is clicked
    const scrollToCategory = useCallback(
        (slug: string) => {
            const rowIndex = categoryRowIndices.get(slug)
            if (rowIndex === undefined) return

            isScrollingToRef.current = true
            setSelectedCategory(slug)

            virtualizer.scrollToIndex(rowIndex, { align: 'start', behavior: 'smooth' })

            // Reset flag after scroll animation
            setTimeout(() => {
                isScrollingToRef.current = false
            }, 300)
        },
        [categoryRowIndices, virtualizer],
    )

    // Pre-compute grid style
    const gridStyle = useMemo(
        () => ({
            display: 'grid',
            gridTemplateColumns: `repeat(${emojisPerRow}, ${emojiSize}px)`,
            gap: `${ROW_GAP}px`,
        }),
        [emojisPerRow, emojiSize],
    )

    const emojiButtonStyle = useMemo(
        () => ({
            width: emojiSize,
            height: emojiSize,
            fontSize: emojiSize * 0.7,
        }),
        [emojiSize],
    )

    return (
        <div className={cn('flex flex-col items-start', className)}>
            {/* Virtualized scroll container */}
            <div
                ref={scrollContainerRef}
                className="h-72 px-3 overflow-y-auto overflow-x-hidden scrollbar-thin"
                style={{
                    width: emojiButtonStyle.width * emojisPerRow + ROW_GAP * emojisPerRow + PADDING_X_AXIS * 2,
                }}
                onClick={handleContainerClick}
            >
                <div
                    style={{
                        height: virtualizer.getTotalSize(),
                        position: 'relative',
                    }}
                >
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                        const row = virtualRows[virtualRow.index]

                        return (
                            <div
                                key={virtualRow.key}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: emojiButtonStyle.width * emojisPerRow + ROW_GAP * emojisPerRow,
                                    height: virtualRow.size,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                {row.type === 'header' ? (
                                    <CategoryHeader slug={row.slug} />
                                ) : (
                                    <EmojiRow
                                        emojis={row.emojis!}
                                        gridStyle={gridStyle}
                                        buttonStyle={emojiButtonStyle}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Category tabs */}
            <EmojiCategoryTabs
                selectedCategory={selectedCategory}
                onCategoryChange={scrollToCategory}
                showRecent={recentEmojis.length > 0}
            />
        </div>
    )
}

// Memoized header component
function CategoryHeader({ slug }: Readonly<{ slug: string }>) {
    return (
        <p className="text-text-gray text-lg py-2 px-1 sticky top-0 bg-white">
            {getCategoryName(slug)}
        </p>
    )
}