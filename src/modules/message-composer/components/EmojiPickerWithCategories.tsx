'use client'

import React, {
    useCallback,
    useMemo,
    useState,
} from 'react'
import { EmojiCategoryTabs } from './EmojiCategoryTabs'
import { cn } from '@lib/utils'
import { getCategoryName } from '@shared/lib/emojiData'
import { EmojiPickerWithCategoriesProps } from '@shared/types/Emoji'
import EmojiRow from '@modules/message-composer/components/EmojiRow'
import { useEmojiGroups } from '@modules/message-composer/hooks/useEmojiGroups'
import { useEmojiVirtualization } from '@modules/message-composer/hooks/useEmojiVirtualization'

const ROW_GAP = 6
const PADDING_X_AXIS = 20

export function EmojiPickerWithCategories({
    onEmojiSelect,
    className = '',
    emojisPerRow = 11,
    emojiSize = 32,
}: Readonly<EmojiPickerWithCategoriesProps>) {
    const [selectedCategory, setSelectedCategory] =
        useState('smileys_emotion')

    // Get emoji groups data
    const {
        recentEmojis,
        addRecentEmoji,
        virtualRows,
        categoryRowIndices,
        rowToCategoryMap,
    } = useEmojiGroups({ emojisPerRow })

    // Calculate row height
    const rowHeight = emojiSize + ROW_GAP

    // Virtualization and scroll logic
    const {
        scrollContainerRef,
        virtualizer,
        scrollToCategory,
    } = useEmojiVirtualization({
        virtualRows,
        rowHeight,
        rowToCategoryMap,
        categoryRowIndices,
        selectedCategory,
        setSelectedCategory,
    })

    // Handle emoji click via event delegation
    const handleContainerClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const target = e.target as HTMLElement
            const button = target.closest(
                '[data-emoji]',
            ) as HTMLElement | null
            if (!button) return

            const emoji = button.dataset.emoji
            if (emoji) {
                addRecentEmoji(emoji)
                onEmojiSelect(emoji)
            }
        },
        [onEmojiSelect, addRecentEmoji],
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

    // Pre-compute container width
    const containerWidth = useMemo(
        () =>
            emojiButtonStyle.width * emojisPerRow +
            ROW_GAP * emojisPerRow +
            PADDING_X_AXIS * 2,
        [emojiButtonStyle.width, emojisPerRow],
    )

    // Pre-compute row width
    const rowWidth = useMemo(
        () =>
            emojiButtonStyle.width * emojisPerRow +
            ROW_GAP * emojisPerRow,
        [emojiButtonStyle.width, emojisPerRow],
    )

    return (
        <div
            className={cn(
                'flex flex-col items-start',
                className,
            )}
        >
            {/* Virtualized scroll container */}
            <div
                ref={scrollContainerRef}
                className={`
                  custom-scroll h-full overflow-x-hidden overflow-y-auto px-3
                `}
                style={{ width: containerWidth }}
                onClick={handleContainerClick}
                role="presentation"
            >
                <div
                    style={{
                        height: virtualizer.getTotalSize(),
                        position: 'relative',
                    }}
                >
                    {virtualizer
                        .getVirtualItems()
                        .map((virtualRow) => {
                            const row =
                                virtualRows[
                                    virtualRow.index
                                ]

                            return (
                                <div
                                    key={virtualRow.key}
                                    style={{
                                        position:
                                            'absolute',
                                        top: 0,
                                        left: 0,
                                        width: rowWidth,
                                        height: virtualRow.size,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    {row.type ===
                                    'header' ? (
                                        <CategoryHeader
                                            slug={row.slug}
                                        />
                                    ) : (
                                        <EmojiRow
                                            emojis={
                                                row.emojis!
                                            }
                                            gridStyle={
                                                gridStyle
                                            }
                                            buttonStyle={
                                                emojiButtonStyle
                                            }
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
function CategoryHeader({
    slug,
}: Readonly<{ slug: string }>) {
    return (
        <p
            className={`
              sticky top-0 bg-white-bg px-1 py-2 text-start text-lg
              text-text-gray
            `}
        >
            {getCategoryName(slug)}
        </p>
    )
}
