import { useState, useCallback } from 'react'

/**
 * Хук для поиска по сообщениям внутри чата.
 *
 * Управляет состоянием открытия/закрытия поиска, текстом запроса,
 * навигацией по результатам (вверх/вниз с циклическим переходом).
 *
 * Полностью самодостаточный — не зависит от внешних данных.
 * Выделен из ChatRoom, чтобы изолировать логику поиска (~80 строк)
 * от основного оркестратора.
 */
export function useInChatSearch() {
    /** Флаг активности режима поиска. При true ChatHeader показывает InChatSearch. */
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    /** Поисковый запрос для фильтрации сообщений (case-insensitive) */
    const [searchQuery, setSearchQuery] = useState('')
    /**
     * Индекс текущего результата поиска в массиве совпадений (0-based).
     * null = нет активного результата, 0 = первый результат (нижний/последний по времени).
     */
    const [currentMatchIndex, setCurrentMatchIndex] =
        useState<number | null>(null)
    /** Общее количество найденных результатов. Обновляется через handleSearchMatchesFound. */
    const [totalSearchResults, setTotalSearchResults] =
        useState(0)

    /**
     * Открытие режима поиска.
     * Очищаем все состояния поиска для чистого старта.
     * ChatHeader переключается в режим InChatSearch при isSearchOpen === true.
     */
    const handleSearchOpen = useCallback(() => {
        setIsSearchOpen(true)
        setSearchQuery('')
        setCurrentMatchIndex(null)
        setTotalSearchResults(0)
    }, [])

    /**
     * Закрытие режима поиска.
     * Полностью очищаем состояние поиска и возвращаемся к обычному виду шапки.
     */
    const handleSearchClose = useCallback(() => {
        setIsSearchOpen(false)
        setSearchQuery('')
        setCurrentMatchIndex(null)
        setTotalSearchResults(0)
    }, [])

    /**
     * Изменение поискового запроса.
     * При вводе нового текста сбрасываем currentMatchIndex в null,
     * чтобы MessagesList пересчитал совпадения и установил индекс на первый результат (снизу).
     *
     * Также сбрасываем totalSearchResults в 0, чтобы избежать показа "0 из N"
     * в момент между вводом и пересчётом результатов.
     */
    const handleSearchQueryChange = useCallback(
        (query: string) => {
            setSearchQuery(query)
            // Сброс индекса и счётчика: новый поиск начинается заново
            setCurrentMatchIndex(null)
            setTotalSearchResults(0)
        },
        [],
    )

    /**
     * Callback вызываемый MessagesList когда пересчитаны совпадения.
     * Обновляем totalSearchResults и при первом результате устанавливаем индекс.
     *
     * Логика инициализации индекса:
     * - Если найдены результаты (count > 0)
     * - И текущий индекс не установлен (currentMatchIndex === null)
     * - И есть активный поисковый запрос
     * → Устанавливаем индекс 0, который соответствует последнему (нижнему) результату
     *
     * Почему 0 = нижний результат:
     * MessagesList возвращает индексы в порядке снизу вверх согласно дизайну.
     */
    const handleSearchMatchesFound = useCallback(
        (count: number) => {
            setTotalSearchResults(count)

            // Автоматическая установка индекса при первом результате.
            // Используем функциональный updater вместо замыкания на currentMatchIndex,
            // чтобы избежать stale closure при пакетных обновлениях React.
            if (count > 0 && searchQuery) {
                setCurrentMatchIndex((prev) =>
                    prev === null ? 0 : prev,
                )
            }
        },
        [searchQuery],
    )

    /**
     * Навигация по результатам поиска.
     *
     * matchingMessageIndices упорядочен сверху вниз (индекс 0 = самый старый/верхний).
     *
     * Направления:
     * - 'up' → переход к более старым сообщениям (индекс уменьшается)
     * - 'down' → переход к более новым сообщениям (индекс увеличивается)
     *
     * Циклическая навигация (wrap around):
     * - При достижении верха → переход к самому новому (индекс totalSearchResults - 1)
     * - При достижении низа → переход к самому старому (индекс 0)
     */
    const handleSearchNavigate = useCallback(
        (direction: 'up' | 'down') => {
            if (totalSearchResults === 0) return

            setCurrentMatchIndex((prev) => {
                // Граничный случай: индекс не установлен
                if (prev === null) return 0

                if (direction === 'up') {
                    // Навигация вверх: к более старым сообщениям
                    return prev - 1 < 0
                        ? totalSearchResults - 1
                        : prev - 1
                } else {
                    // Навигация вниз: к более новым сообщениям
                    return prev + 1 >= totalSearchResults
                        ? 0
                        : prev + 1
                }
            })
        },
        [totalSearchResults],
    )

    return {
        isSearchOpen,
        searchQuery,
        currentMatchIndex,
        totalSearchResults,
        setCurrentMatchIndex,
        handleSearchOpen,
        handleSearchClose,
        handleSearchQueryChange,
        handleSearchMatchesFound,
        handleSearchNavigate,
    }
}
