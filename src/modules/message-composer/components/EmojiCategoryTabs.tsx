import TimeIcon from '../../../../public/images/messageComposer/emojiCategories/time.svg'
import EmotionIcon from '../../../../public/images/messageComposer/emojiCategories/smiley.svg'
import PeoplesIcon from '../../../../public/images/messageComposer/emojiCategories/people.svg'
import CatIcon from '../../../../public/images/messageComposer/emojiCategories/cat.svg'
import FoodDrinkIcon from '../../../../public/images/messageComposer/emojiCategories/food&drink.svg'
import TravelIcon from '../../../../public/images/messageComposer/emojiCategories/travel.svg'
import ObjectsIcon from '../../../../public/images/messageComposer/emojiCategories/objects.svg'
import SymbolsIcon from '../../../../public/images/messageComposer/emojiCategories/symbols.svg'
import FlagIcon from '../../../../public/images/messageComposer/emojiCategories/flag.svg'
import { cn } from '@shared/lib/utils'
import { Category } from '@shared/types/Emoji'


const EMOJI_CATEGORIES: Category[] = [
    {
        name: 'Recent', slug: 'recent',
        emoji: TimeIcon,
    },
    {
        name: 'Emotions', slug: 'smileys_emotion',
        emoji: EmotionIcon,
    },
    {
        name: 'Peoples', slug: 'people_body',
        emoji: PeoplesIcon,
    },
    {
        name: 'Animals', slug: 'animals_nature'
        , emoji: CatIcon,
    },
    {
        name: 'Foods & Drinks', slug: 'food_drink',
        emoji: FoodDrinkIcon,
    },
    {
        name: 'Travel', slug: 'travel_places',
        emoji: TravelIcon,
    },
    {
        name: 'Objects', slug: 'objects',
        emoji: ObjectsIcon,
    },
    {
        name: 'Symbols', slug: 'symbols',
        emoji: SymbolsIcon,
    },
    {
        name: 'Flags', slug: 'flags',
        emoji: FlagIcon,
    },
]

interface EmojiCategoryTabsProps {
    selectedCategory: string;
    onCategoryChange: (slug: string) => void;
}

export function EmojiCategoryTabs({ selectedCategory, onCategoryChange }: EmojiCategoryTabsProps) {
    return (
        <div
            className="flex items-center justify-between w-full px-2 py-2 border-t border-gray-200 bg-white">
            {EMOJI_CATEGORIES.map((category) => (
                <button
                    key={category.slug}
                    onClick={() => onCategoryChange(category.slug)}
                    className={cn(
                        'flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-gray-100',
                        selectedCategory === category.slug ? 'text-accent-violet-primary' : ' text-text-gray',
                    )}
                    title={category.name}
                >
                    {<category.emoji className="w-7 h-7" key={category.slug} />}
                </button>
            ))}
        </div>
    )
}

export { EMOJI_CATEGORIES }
