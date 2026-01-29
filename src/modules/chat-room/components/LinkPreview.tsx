'use client'

interface LinkPreviewProps {
    readonly url: string
    readonly title?: string
    readonly description?: string
    readonly imageUrl?: string
}

/**
 * Компонент для отображения превью ссылок в сообщениях
 *
 * TODO: Реализовать верстку согласно дизайну
 * - Иконка/изображение сайта слева
 * - Заголовок ссылки
 * - Описание (preview текста со страницы)
 * - Вертикальная полоска accent-violet-primary
 * - Кнопка "ПЕРЕЙТИ В КАНАЛ" или аналогичная
 * - Кликабельная ссылка на URL
 *
 * TODO: Интеграция с Open Graph или аналогичным API для получения метаданных
 */
export default function LinkPreview({
    url,
    title,
    description,
    imageUrl,
}: LinkPreviewProps) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block rounded-lg bg-gray-main p-3"
        >
            <div className="flex items-start gap-3">
                {imageUrl && (
                    <div
                        className={`
                          h-12 w-12 flex-shrink-0 rounded bg-gray-border
                        `}
                    />
                )}
                <div className="flex-1">
                    <p className="text-sm font-medium text-text-black">
                        {title || url}
                    </p>
                    {description && (
                        <p className="mt-1 line-clamp-2 text-xs text-text-gray">
                            {description}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-accent-violet-primary">
                        {new URL(url).hostname}
                    </p>
                </div>
            </div>
        </a>
    )
}
