'use client'

import Image from 'next/image'

type InChatSearchProps = {
    /** Текущий поисковый запрос */
    searchQuery: string
    /** Обработчик изменения поискового запроса */
    onChange: (value: string) => void
    /** Обработчик навигации: 'up' к предыдущему (более старому), 'down' к следующему (более новому) */
    onNavigate: (direction: 'up' | 'down') => void
    /** Обработчик закрытия поиска */
    onClose: () => void
    /** Текущий индекс результата (0-based) */
    currentIndex: number | null
    /** Общее количество найденных результатов */
    totalResults: number
    /** URL аватара для отображения слева */
    avatarSrc?: string
}

/**
 * Компонент поиска внутри чата.
 *
 * Заменяет обычную шапку ChatHeader при активации режима поиска (isSearchOpen === true).
 * Отображается в том же месте где ChatHeader для плавного UX-перехода.
 *
 * Архитектура компонента:
 * - Использует общий компонент Search для поискового ввода
 * - Показывает счётчик результатов в формате "X из Y"
 * - Предоставляет навигацию по результатам через стрелки вверх/вниз
 * - Кнопка закрытия возвращает к обычному виду шапки
 *
 * Логика навигации согласно дизайну Telegram:
 * - Навигация начинается с нижнего (последнего по времени) результата
 * - Стрелка вверх → переход к более старым сообщениям
 * - Стрелка вниз → переход к более новым сообщениям
 * - Обе стрелки всегда видимы (даже на первом/последнем результате)
 * - Циклическая навигация: при достижении границы возврат к началу
 *
 * Props управляются из ChatRoom, все обработчики прокидываются сверху.
 */
export default function InChatSearch({
    searchQuery,
    onChange,
    onNavigate,
    onClose,
    currentIndex,
    totalResults,
    avatarSrc,
}: InChatSearchProps) {
    /**
     * Вычисляем отображаемый номер для UI.
     * Внутренняя логика использует 0-based индексы,
     * но для пользователя отображаем 1-based счётчик ("1 из 5" вместо "0 из 5").
     *
     * Если currentIndex === null но есть результаты (totalResults > 0),
     * показываем 1, чтобы избежать отображения "0 из N" в момент между
     * нахождением результатов и установкой индекса.
     */
    const displayIndex =
        currentIndex !== null
            ? currentIndex + 1
            : totalResults > 0
              ? 1
              : 0

    return (
        <div
            className={`
        flex items-center gap-3 border-b border-gray-border bg-white-bg px-3
        py-2
      `}
        >
            {/* Аватар пользователя слева - согласно дизайну из chat_search.png */}
            {avatarSrc && (
                <Image
                    src={avatarSrc}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="shrink-0 rounded-full"
                    unoptimized
                />
            )}

            {/* Поисковый ввод с иконкой поиска. Все цвета из globals.css */}
            <div className="relative flex min-w-0 flex-1 items-center">
                <Image
                    src="/images/search/iconsSearch.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="absolute left-3 text-text-gray"
                />
                <input
                    type="text"
                    placeholder="Поиск в чате"
                    value={searchQuery}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    className={`
            h-11 w-full rounded-lg border border-gray-border bg-white-bg py-2.5
            pr-3 pl-10 text-sm text-text-black
            placeholder:text-text-gray
            focus:border-accent-violet-primary focus:outline-none
          `}
                    aria-label="Поиск в чате"
                />
            </div>

            {/* Счётчик результатов и навигация. Цвета из globals.css */}
            {searchQuery && (
                <div className="flex shrink-0 items-center gap-2">
                    {/* Счётчик результатов - цвет текста text-gray из globals.css */}
                    <span
                        className={`text-sm whitespace-nowrap text-text-gray`}
                    >
                        {totalResults > 0
                            ? `${displayIndex} из ${totalResults}`
                            : 'Нет результатов'}
                    </span>

                    {/* Навигационные кнопки - hover использует gray-light из globals.css */}
                    {totalResults > 0 && (
                        <>
                            {/* Стрелка вверх - к более старым сообщениям */}
                            <button
                                type="button"
                                onClick={() =>
                                    onNavigate('up')
                                }
                                aria-label="Предыдущий результат"
                                className={`
                  rounded-lg p-1 text-text-gray transition-colors
                  hover:bg-gray-light
                  active:scale-95
                `}
                            >
                                <Image
                                    src="/images/search/arrow-up.svg"
                                    alt=""
                                    width={16}
                                    height={16}
                                />
                            </button>

                            {/* Стрелка вниз - к более новым сообщениям */}
                            <button
                                type="button"
                                onClick={() =>
                                    onNavigate('down')
                                }
                                aria-label="Следующий результат"
                                className={`
                  rounded-lg p-1 text-text-gray transition-colors
                  hover:bg-gray-light
                  active:scale-95
                `}
                            >
                                <Image
                                    src="/images/search/arrow-down.svg"
                                    alt=""
                                    width={16}
                                    height={16}
                                />
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Кнопка закрытия - hover использует gray-light из globals.css */}
            <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть поиск"
                className={`
          rounded-lg p-1 text-text-gray transition-colors
          hover:bg-gray-light
          active:scale-95
        `}
            >
                <Image
                    src="/images/search/iconsClose.svg"
                    alt=""
                    width={20}
                    height={20}
                />
            </button>
        </div>
    )
}
