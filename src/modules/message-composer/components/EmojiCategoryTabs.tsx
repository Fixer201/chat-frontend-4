import { memo, useMemo } from 'react'
import { cn } from '@shared/lib/utils'
import { Category } from '@shared/types/Emoji'
import { EMOJI_CATEGORIES } from '@shared/config/constants'

interface EmojiCategoryTabsProps {
    selectedCategory: string
    onCategoryChange: (slug: string) => void
    showRecent?: boolean
}

export const EmojiCategoryTabs = memo(
    function EmojiCategoryTabs({
        selectedCategory,
        onCategoryChange,
        showRecent = false,
    }: EmojiCategoryTabsProps) {
        // Filter categories based on showRecent
        const visibleCategories = useMemo(() => {
            if (showRecent) return EMOJI_CATEGORIES
            return EMOJI_CATEGORIES.filter(
                (c) => c.slug !== 'recent',
            )
        }, [showRecent])

        return (
            <div className="flex items-center justify-between w-full px-5 pt-5 pb-8 bg-white-bg">
                {visibleCategories.map((category) => (
                    <CategoryTab
                        key={category.slug}
                        category={category}
                        isSelected={
                            selectedCategory ===
                            category.slug
                        }
                        onClick={onCategoryChange}
                    />
                ))}
            </div>
        )
    },
)

interface CategoryTabProps {
    category: Category
    isSelected: boolean
    onClick: (slug: string) => void
}

const CategoryTab = memo(function CategoryTab({
    category,
    isSelected,
    onClick,
}: CategoryTabProps) {
    const Icon = category.emoji

    return (
        <button
            onClick={() => onClick(category.slug)}
            className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-gray-100',
                isSelected
                    ? 'text-accent-violet-primary'
                    : 'text-text-gray',
            )}
            title={category.name}
            type="button"
        >
            <Icon className="w-7 h-7" />
        </button>
    )
})
