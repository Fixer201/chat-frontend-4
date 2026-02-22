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

/**
 * Хук подготовки данных для пикера эмодзи.
 *
 * Выполняет три задачи:
 * 1. Формирует группу «Недавние» из localStorage и объединяет её
 *    с основными категориями эмодзи.
 * 2. Преобразует плоский список групп в массив виртуальных строк
 *    (header + строки эмодзи) для передачи в виртуализатор.
 * 3. Строит вспомогательные Map-ы для навигации: slug → rowIndex
 *    (прокрутка к категории) и rowIndex → slug (подсветка вкладки при скролле).
 */

interface UseEmojiGroupsOptions {
    emojisPerRow: number
}

interface UseEmojiGroupsReturn {
    recentEmojis: string[]
    addRecentEmoji: (emoji: string) => void
    allGroups: EmojiGroup[]
    virtualRows: VirtualRow[]
    /** Карта slug категории → индекс строки-заголовка (для scrollToCategory) */
    categoryRowIndices: Map<string, number>
    /** Карта индекс строки → slug категории (для подсветки вкладки при скролле) */
    rowToCategoryMap: Map<number, string>
}

export function useEmojiGroups({
    emojisPerRow,
}: UseEmojiGroupsOptions): UseEmojiGroupsReturn {
    const { recentEmojis, addRecentEmoji } =
        useRecentEmojis()

    // Формируем динамическую группу «Недавние» из истории выбора в localStorage.
    // Если история пуста — группа не создаётся и вкладка «Недавние» скрыта.
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

    // Объединяем группу «Недавние» (если есть) с основными категориями.
    // Недавние всегда первые — это стандартное поведение эмодзи-пикеров.
    const allGroups = useMemo(() => {
        return recentGroup
            ? [recentGroup, ...emojiGroups]
            : emojiGroups
    }, [recentGroup])

    // Преобразуем группы в плоский массив виртуальных строк:
    // для каждой группы — заголовок (type: 'header') + N строк эмодзи (type: 'row').
    // Количество эмодзи в строке определяется emojisPerRow.
    const virtualRows = useMemo(
        () => computeVirtualRows(allGroups, emojisPerRow),
        [allGroups, emojisPerRow],
    )

    // Карта slug → индекс строки-заголовка: используется для
    // программной прокрутки к категории при клике по вкладке
    const categoryRowIndices = useMemo(
        () => computeCategoryRowIndices(virtualRows),
        [virtualRows],
    )

    // Обратная карта: индекс строки → slug категории.
    // При скролле виртуализатор сообщает startIndex видимой области —
    // через эту карту определяем текущую категорию и подсвечиваем вкладку.
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
