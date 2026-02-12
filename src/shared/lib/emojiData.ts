import rawEmojiData from 'unicode-emoji-json/data-by-group.json'
import { EmojiGroup } from '@shared/types/Emoji'

// Map API slug names to our internal slugs
const SLUG_MAP: Record<string, string> = {
    'smileys-emotion': 'smileys_emotion',
    'people-body': 'people_body',
    'animals-nature': 'animals_nature',
    'food-drink': 'food_drink',
    'travel-places': 'travel_places',
    activities: 'activities',
    objects: 'objects',
    symbols: 'symbols',
    flags: 'flags',
}

// Category names in Russian
const CATEGORY_NAMES: Record<string, string> = {
    smileys_emotion: 'Эмоции',
    people_body: 'Люди',
    animals_nature: 'Животные',
    food_drink: 'Еда и напитки',
    travel_places: 'Путешествие',
    activities: 'Активности',
    objects: 'Объекты',
    symbols: 'Символы',
    flags: 'Флаги стран',
    recent: 'Недавние',
}

// Helper function to check if emoji is a ZWJ sequence (compound emoji)
function isZWJSequence(emoji: string): boolean {
    // ZWJ sequences contain the Zero-Width Joiner character (U+200D)
    return emoji.includes('\u200D')
}

// Pre-process emoji data once at import time
function processEmojiData(): EmojiGroup[] {
    return (rawEmojiData as EmojiGroup[]).map((group) => ({
        ...group,
        slug: SLUG_MAP[group.slug] ?? group.slug,
        // Filter out ZWJ sequences (compound emojis) to avoid rendering issues
        emojis: group.emojis.filter(
            (e) => !isZWJSequence(e.emoji),
        ),
    }))
}

// Exported pre-computed data
export const emojiGroups: EmojiGroup[] = processEmojiData()

// Pre-computed lookup map: slug -> category name
export const categoryNameMap: Map<string, string> = new Map(
    Object.entries(CATEGORY_NAMES),
)

// Get category name by slug (O(1) lookup)
export function getCategoryName(slug: string): string {
    return categoryNameMap.get(slug) ?? 'Категория'
}

// Pre-computed lookup: slug -> group index (for scrolling)
export const groupIndexMap: Map<string, number> = new Map(
    emojiGroups.map((g, i) => [g.slug, i]),
)

// Compute rows for virtualization
export interface VirtualRow {
    type: 'header' | 'emojis'
    slug: string
    emojis?: string[] // Only for 'emojis' type
    groupIndex: number
}

export function computeVirtualRows(
    groups: EmojiGroup[],
    emojisPerRow: number,
): VirtualRow[] {
    const rows: VirtualRow[] = []

    groups.forEach((group, groupIndex) => {
        // Category header row
        rows.push({
            type: 'header',
            slug: group.slug,
            groupIndex,
        })

        // Emoji rows
        const emojis = group.emojis
        for (
            let i = 0;
            i < emojis.length;
            i += emojisPerRow
        ) {
            rows.push({
                type: 'emojis',
                slug: group.slug,
                emojis: emojis
                    .slice(i, i + emojisPerRow)
                    .map((e) => e.emoji),
                groupIndex,
            })
        }
    })

    return rows
}

// Compute row index for each category (for scroll-to-category)
export function computeCategoryRowIndices(
    rows: VirtualRow[],
): Map<string, number> {
    const indices = new Map<string, number>()

    rows.forEach((row, index) => {
        if (
            row.type === 'header' &&
            !indices.has(row.slug)
        ) {
            indices.set(row.slug, index)
        }
    })

    return indices
}
