'use client'

import { useMemo, useState } from 'react'
import { EmojiCategoryTabs } from './EmojiCategoryTabs'
import emojiData from 'unicode-emoji-json/data-by-group.json'
import { cn } from '@lib/utils'
import { EmojiGroup, EmojiPickerWithCategoriesProps } from '@shared/types/Emoji'

export function EmojiPickerWithCategories({
                                              onEmojiSelect,
                                              className = '',
                                              emojisPerRow = 9,
                                              emojiSize = 32,
                                          }: Readonly<EmojiPickerWithCategoriesProps>) {

    const [selectedCategory, setSelectedCategory] = useState('smileys_emotion')
    const [searchQuery, setSearchQuery] = useState('')

    const typedEmojiData: EmojiGroup[] = emojiData

    // Фильтрация эмодзи по категории и поисковому запросу
    const filteredEmojis = useMemo(() => {
        const categoryData = typedEmojiData.find(group => group.slug === selectedCategory)
        if (!categoryData) return []

        let emojis = categoryData.emojis

        // Фильтрация по поисковому запросу
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            emojis = emojis.filter(emoji =>
                emoji.name.toLowerCase().includes(query) ||
                emoji.slug.toLowerCase().includes(query),
            )
        }

        return emojis
    }, [selectedCategory, searchQuery, typedEmojiData])

    return (
        <div className={cn('flex flex-col items-start', className)}>
            {/* Сетка эмодзи */}
            <p className="text-text-gray text-lg px-5 py-4">Недавние</p>
            <p className="text-text-gray text-lg px-5 py-4">Эмоции</p>
            <div
                className="h-72 grid gap-1 justify-center px-4 overflow-y-auto"
                style={{
                    gridTemplateColumns: `repeat(${emojisPerRow}, ${emojiSize}px)`,
                }}
            >
                {filteredEmojis.length > 0 ? (
                    filteredEmojis.map((emoji) => (
                        <button
                            key={emoji.slug}
                            onClick={() => onEmojiSelect(emoji.emoji)}
                            className="flex items-center justify-center hover:bg-gray-200 radius-md transition-colors"
                            style={{ width: `${emojiSize}px`, height: `${emojiSize}px` }}
                            title={emoji.name}
                        >
                            <span style={{ fontSize: `${emojiSize * 0.7}px` }}>{emoji.emoji}</span>
                        </button>
                    ))
                ) : (
                    <div className="col-span-full flex items-center justify-center text-text-gray text-sm">
                        Эмодзи не найдены
                    </div>
                )}
            </div>

            {/* Категории снизу */}
            <EmojiCategoryTabs
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />
        </div>
    )
}
