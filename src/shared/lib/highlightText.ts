export type TextSegment = {
    text: string
    isMatch: boolean
}

const highlightCache = new Map<string, TextSegment[]>()

// Вынесен на уровень модуля, чтобы не компилировать regex при каждом вызове escapeRegex
const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g

function escapeRegex(str: string): string {
    return str.replaceAll(ESCAPE_REGEX, String.raw`\$&`)
}

/**
 * Разбивает текст на сегменты для подсветки совпадений с поисковым запросом.
 *
 * @example
 * highlightText("Привет мир", "ив")
 * // [{ text: "Пр", isMatch: false }, { text: "ив", isMatch: true }, { text: "ет мир", isMatch: false }]
 */
export function highlightText(
    text: string,
    query: string,
): TextSegment[] {
    if (!query.trim()) {
        return [{ text, isMatch: false }]
    }

    if (!text) {
        return []
    }

    const cacheKey = `${text}::${query.toLowerCase()}`

    const cached = highlightCache.get(cacheKey)
    if (cached) return cached

    const escapedQuery = escapeRegex(query)

    // Захватывающая группа заставляет split сохранять совпавшие фрагменты в массиве результатов
    const regex = new RegExp(`(${escapedQuery})`, 'gi')
    const parts = text.split(regex)

    // Совпадение определяем прямым сравнением строк, а не чётностью индекса —
    // пустые части после split смещают позиции и делают index % 2 ненадёжным
    const lowerQuery = query.toLowerCase()
    const segments: TextSegment[] = []

    for (const part of parts) {
        if (part.length > 0) {
            segments.push({
                text: part,
                isMatch: part.toLowerCase() === lowerQuery,
            })
        }
    }

    highlightCache.set(cacheKey, segments)

    if (highlightCache.size > 500) {
        highlightCache.delete(
            highlightCache.keys().next().value!,
        )
    }

    return segments
}

/** Вызывать при смене чата или закрытии поиска, чтобы освободить память */
export function clearHighlightCache(): void {
    highlightCache.clear()
}
