import { ComponentType, SVGProps } from 'react'

export interface Emoji {
    emoji: string;
    name: string;
    slug: string;
    skin_tone_support: boolean;
}

export interface EmojiGroup {
    name: string;
    slug: string;
    emojis: Emoji[];
}

export interface EmojiPickerWithCategoriesProps {
    onEmojiSelect: (emoji: string) => void;
    className?: string;
    emojisPerRow?: number;
    emojiSize?: number;
}

export interface Category {
    name: string;
    slug: string;
    emoji: ComponentType<SVGProps<SVGSVGElement>>;
}

// Memoized emoji row component
export interface EmojiRowProps {
    emojis: string[]
    gridStyle: React.CSSProperties
    buttonStyle: React.CSSProperties
}