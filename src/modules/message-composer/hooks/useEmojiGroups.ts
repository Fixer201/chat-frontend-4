'use client'

import { useMemo } from 'react'
import { useRecentEmojis } from '@shared/hooks/useRecentEmojis'
import {
    computeCategoryRowIndices,
    computeVirtualRows,
    emojiGroups,
    VirtualRow,
} from '@shared/lib/emojiData'
import { EmojiGroup } from '@shared/types/Emoji'

interface UseEmojiGroupsOptions {
    emojisPerRow: number
}

interface UseEmojiGroupsReturn {
    recentEmojis: string[]
    addRecentEmoji: (emoji: string) => void
    allGroups: EmojiGroup[]
    virtualRows: VirtualRow[]
    categoryRowIndices: Map<string, number>
    rowToCategoryMap: Map<number, string>
}

export function useEmojiGroups({
    emojisPerRow,
}: UseEmojiGroupsOptions): UseEmojiGroupsReturn {
    const { recentEmojis, addRecentEmoji } = useRecentEmojis()

    // Create recent group when we have recent emojis
    const recentGroup: EmojiGroup | null = useMemo(() => {
        if (recentEmojis.length === 0) return null
        return {
            name: 'Недавние',
            slug: 'recent',
            emojis: recentEmojis.map((emoji) => ({
                emoji,
                name: emoji,
                slug: emoji,
                skin_tone_support: false,
            })),
        }
    }, [recentEmojis])

    // Combine recent + all groups
    const allGroups = useMemo(() => {
        return recentGroup
            ? [recentGroup, ...emojiGroups]
            : emojiGroups
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

    // Pre-compute row index to category map
    const rowToCategoryMap = useMemo(() => {
        const map = new Map<number, string>()
        let currentCategory = ''
        for (let i = 0; i < virtualRows.length; i++) {
            if (virtualRows[i].type === 'header') {
                currentCategory = virtualRows[i].slug
            }
            map.set(i, currentCategory)
        }
        return map
    }, [virtualRows])

    return {
        recentEmojis,
        addRecentEmoji,
        allGroups,
        virtualRows,
        categoryRowIndices,
        rowToCategoryMap,
    }
}
