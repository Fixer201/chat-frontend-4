// AvatarPicker.tsx
import React, { useRef, KeyboardEvent } from 'react'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'

// Пропсы компонента AvatarPicker
export interface AvatarPickerProps {
    src?: string | null
    name?: string
    size?: number
    onFile?: (file: File | null) => void
    onImageClick?: () => void
}

// Компонент для выбора и предпросмотра аватарки
export const AvatarPicker: React.FC<AvatarPickerProps> = ({
    src,
    name = '',
    size = 200,
    onFile,
    onImageClick,
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null)

    // Обработчик клика по кнопке выбора
    const handleChoose = () => inputRef.current?.click()

    // Обработчик изменения файла в input
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const f = e.target.files?.[0] ?? null
        onFile?.(f)

        // Сбрасываем значение input
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    // Обработчик клика по изображению
    const handleImageClick = () => {
        if (onImageClick && hasImage) {
            onImageClick()
        }
    }

    // Обработчик нажатия клавиши для доступности
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

    // Определяем, есть ли изображение (не дефолтное)
    const hasImage = Boolean(
        src && src !== '/images/chatHeader/userAvatar.svg',
    )

    // Определяем, можно ли кликать по изображению (только если есть изображение и передан обработчик)
    const canClickImage = hasImage && Boolean(onImageClick)

    return (
        <div className="flex w-full flex-col items-center">
            {/* Контейнер для предпросмотра аватарки */}
            <div
                style={{ width: size, height: size }}
                className={`
                  relative flex items-center justify-center overflow-hidden
                  rounded-full bg-(--color-accent-violet-light)
                  ${
                      canClickImage
                          ? `
                            cursor-pointer transition-all
                            hover:opacity-90
                            focus:ring-2
                            focus:ring-(--color-accent-violet-primary)
                            focus:outline-none
                          `
                          : ''
                  }
                `}
                onClick={
                    canClickImage
                        ? handleImageClick
                        : undefined
                }
                onKeyDown={
                    canClickImage
                        ? handleKeyDown
                        : undefined
                }
                role={canClickImage ? 'button' : undefined}
                aria-label={
                    canClickImage
                        ? `Изменить аватар для ${name || 'группы'}`
                        : undefined
                }
            >
                {/* Изображение аватарки (если есть) или fallback */}
                {src ? (
                    <Image
                        src={src}
                        alt={name}
                        className="h-full w-full object-cover"
                        width={size}
                        height={size}
                        unoptimized={true}
                        priority={true}
                    />
                ) : (
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
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
                aria-label={`Выбрать аватар для ${name || 'группы'}`}
            />

            {/* Кнопка для выбора фотографии */}
            <Button
                type="button"
                onClick={handleChoose}
                variant="ghost"
                size="md"
                className={`
                  mt-1 w-full text-center text-base
                  text-(--color-accent-violet-primary)
                `}
                aria-label={`Выбрать фотографию для ${name || 'группы'}`}
            >
                Выбрать фотографию
            </Button>
        </div>
    )
}

export default AvatarPicker
