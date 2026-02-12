'use client'

import React, {
    useCallback,
    useMemo,
    useState,
} from 'react'
import { EmojiCategoryTabs } from './EmojiCategoryTabs'
import { cn } from '@shared/lib/utils'
import { getCategoryName } from '@shared/lib/emojiData'
import { EmojiPickerWithCategoriesProps } from '@shared/types/Emoji'
import EmojiRow from '@modules/message-composer/components/EmojiRow'
import { useEmojiGroups } from '@modules/message-composer/hooks/useEmojiGroups'
import { useEmojiVirtualization } from '@modules/message-composer/hooks/useEmojiVirtualization'

/** Вертикальный отступ между строками эмодзи (px) */
const ROW_GAP = 6
/** Горизонтальный отступ контейнера слева и справа (px) */
const PADDING_X_AXIS = 20

/**
 * Пикер эмодзи с категориями и виртуализацией.
 *
 * Архитектурные решения:
 * - Виртуализация через @tanstack/react-virtual — рендерятся только видимые строки,
 *   что критично при ~1800 эмодзи (без виртуализации DOM содержит тысячи элементов).
 * - Делегирование событий — один обработчик клика на контейнере вместо отдельного
 *   на каждой кнопке, снижает количество подписок и аллокаций.
 * - Все стили (grid, размеры кнопок, ширина контейнера) мемоизированы через useMemo,
 *   чтобы избежать пересоздания объектов стилей при каждом рендере.
 */
export function EmojiPickerWithCategories({
    onEmojiSelect,
    className = '',
    emojisPerRow = 11,
    emojiSize = 32,
}: Readonly<EmojiPickerWithCategoriesProps>) {
    const [selectedCategory, setSelectedCategory] =
        useState('smileys_emotion')

    // Данные групп эмодзи: недавние, виртуальные строки, карты индексов категорий
    const {
        recentEmojis,
        addRecentEmoji,
        virtualRows,
        categoryRowIndices,
        rowToCategoryMap,
    } = useEmojiGroups({ emojisPerRow })

    // Высота строки = размер эмодзи + межстрочный отступ
    const rowHeight = emojiSize + ROW_GAP

    // Виртуализация списка и синхронизация скролла с вкладками категорий
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

    // Обработка клика по эмодзи через делегирование событий:
    // вместо ~1800 обработчиков на каждую кнопку — один на контейнер.
    // Ищем ближайший элемент с data-emoji через closest() (всплытие события).
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

    // Мемоизированный стиль CSS Grid для строки эмодзи
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

    // Ширина контейнера = (ширина кнопки × кол-во в строке) + (gap × кол-во) + паддинги
    const containerWidth = useMemo(
        () =>
            emojiButtonStyle.width * emojisPerRow +
            ROW_GAP * emojisPerRow +
            PADDING_X_AXIS * 2,
        [emojiButtonStyle.width, emojisPerRow],
    )

    // Ширина строки эмодзи (без боковых паддингов контейнера)
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
            {/* Виртуализированный контейнер с прокруткой:
                рендерит только видимые строки + overscan (5 строк буфера) */}
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

            {/* Панель вкладок категорий: при клике скроллит к нужной категории,
                вкладка «Недавние» отображается только при наличии истории */}
            <EmojiCategoryTabs
                selectedCategory={selectedCategory}
                onCategoryChange={scrollToCategory}
                showRecent={recentEmojis.length > 0}
            />
        </div>
    )
}

/**
 * Заголовок категории эмодзи — sticky-элемент, который остаётся
 * видимым при прокрутке, показывая название текущей группы.
 */
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
