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
            <div
                className={`
                  flex w-full items-center justify-between bg-white-bg px-5 pt-5
                  pb-8
                `}
            >
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
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick(category.slug)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick(category.slug)
                }
            }}
            className={cn(
                `
                  flex h-9 w-9 cursor-pointer items-center justify-center
                  rounded-lg transition-colors
                  hover:bg-gray-100
                `,
                isSelected
                    ? 'text-accent-violet-primary'
                    : 'text-text-gray',
            )}
            aria-label={category.name}
            aria-pressed={isSelected}
        >
            <Icon className="h-7 w-7" />
        </div>
    )
})
