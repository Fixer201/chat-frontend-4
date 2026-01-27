// AvatarPicker.tsx
import React, { useRef, KeyboardEvent } from 'react'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'

// Пропсы компонента AvatarPicker
export interface AvatarPickerProps {
    src?: string | null // URL изображения или null для дефолтной аватарки
    name?: string // Имя для alt-текста
    size?: number // Размер компонента в пикселях
    onFile?: (file: File | null) => void // Колбэк при выборе/сбросе файла
    onImageClick?: () => void // Колбэк при клике на существующее изображение
}

// Компонент для выбора и предпросмотра аватарки
export const AvatarPicker: React.FC<AvatarPickerProps> = ({
    src,
    name = '',
    size = 200,
    onFile,
    onImageClick,
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null) // Ref для доступа к скрытому input элементу

    // Обработчик клика по кнопке выбора - вызывает клик по скрытому input
    const handleChoose = () => inputRef.current?.click()

    // Обработчик изменения файла в input
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const f = e.target.files?.[0] ?? null // Получаем первый файл или null
        onFile?.(f) // Вызываем колбэк с выбранным файлом

        // Сбрасываем значение input для возможности повторного выбора того же файла
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    // Обработчик клика по изображению - вызывается только если есть изображение и обработчик
    const handleImageClick = () => {
        if (onImageClick && hasImage) {
            onImageClick()
        }
    }

    // Обработчик нажатия клавиши для доступности - позволяет кликать по изображению с клавиатуры
    const handleKeyDown = (
        e: KeyboardEvent<HTMLDivElement>,
    ) => {
        if (
            hasImage &&
            onImageClick &&
            (e.key === 'Enter' || e.key === ' ')
        ) {
            e.preventDefault()
            handleImageClick()
        }
    }

    // Определяем, есть ли изображение (не дефолтное) - проверяем что src не null и не дефолтная иконка
    const hasImage = Boolean(
        src && src !== '/images/chatHeader/userAvatar.svg',
    )

    // Определяем, можно ли кликать по изображению (только если есть изображение и передан обработчик)
    const canClickImage = hasImage && Boolean(onImageClick)

    return (
        <div className="flex w-full flex-col items-center">
            {/* Контейнер для предпросмотра аватарки */}
            <div
                style={{ width: size, height: size }} // Динамический размер из пропсов
                className={`
                  relative flex items-center justify-center overflow-hidden
                  rounded-full bg-accent-violet-light
                  ${
                      canClickImage
                          ? `
                            cursor-pointer transition-all
                            hover:opacity-90
                            focus:ring-2 focus:ring-accent-violet-primary
                            focus:outline-none
                          `
                          : ''
                  }
                `}
                onClick={
                    canClickImage
                        ? handleImageClick // Клик только если можно
                        : undefined
                }
                onKeyDown={
                    canClickImage
                        ? handleKeyDown // Обработка клавиатуры только если можно
                        : undefined
                }
                role={canClickImage ? 'button' : undefined} // Семантическая роль для доступности
                aria-label={
                    canClickImage
                        ? `Изменить аватар для ${name || 'группы'}` // Описание для скринридеров
                        : undefined
                }
            >
                {/* Изображение аватарки (если есть) или fallback */}
                {src ? ( // Если есть src - показываем изображение
                    <Image
                        src={src}
                        alt={name} // Alt текст из name
                        className="h-full w-full object-cover" // Растягиваем на весь контейнер
                        width={size}
                        height={size}
                        unoptimized={true} // Отключаем оптимизацию Next.js для Blob URL
                        priority={true} // Приоритетная загрузка (LCP элемент)
                    />
                ) : (
                    // Иначе - показываем дефолтную иконку
                    <Image
                        src="/images/chatHeader/userAvatar.svg"
                        alt={name || 'Аватар по умолчанию'}
                        className="h-full w-full object-cover"
                        width={size}
                        height={size}
                        unoptimized={true}
                        priority={true}
                    />
                )}
            </div>

            {/* Скрытый input для выбора файла */}
            <input
                ref={inputRef} // Привязываем ref для программного доступа
                type="file"
                accept="image/*" // Только изображения
                className="hidden" // Скрываем визуально
                onChange={handleChange} // Обработчик выбора файла
                aria-label={`Выбрать аватар для ${name || 'группы'}`} // Описание для скринридеров
            />

            {/* Кнопка для выбора фотографии */}
            <Button
                type="button"
                onClick={handleChoose} // Вызывает клик по скрытому input
                variant="ghost" // Стиль кнопки - прозрачная
                size="md" // Средний размер
                className={`
                  mt-1 w-full text-center text-base text-accent-violet-primary
                `}
                aria-label={`Выбрать фотографию для ${name || 'группы'}`} // Для доступности
            >
                Выбрать фотографию
            </Button>
        </div>
    )
}

export default AvatarPicker
