// Компонент для выбора аватарки (фотографии)
import React, { useRef } from 'react'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'

// Пропсы компонента AvatarPicker
export interface AvatarPickerProps {
    src?: string | null // URL текущей аватарки (для предпросмотра)
    name?: string // Название для alt текста
    size?: number // Размер аватарки в пикселях
    onFile?: (file: File | null) => void // Обработчик выбора файла
}

// Компонент для выбора и предпросмотра аватарки
export const AvatarPicker: React.FC<AvatarPickerProps> = ({
    src,
    name = '',
    size = 200,
    onFile,
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null)

    // Обработчик клика по кнопке выбора
    const handleChoose = () => inputRef.current?.click()

    // Обработчик изменения файла в input
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const f = e.target.files?.[0] ?? null
        onFile?.(f) // Передаем выбранный файл родительскому компоненту
    }

    return (
        <div className="flex w-full flex-col items-center">
            {/* Контейнер для предпросмотра аватарки */}
            <div
                style={{ width: size, height: size }}
                className={`
                  flex items-center justify-center overflow-hidden rounded-full
                  bg-(--color-accent-violet-light)
                `}
            >
                {/* Изображение аватарки (если есть) или fallback */}
                <Image
                    src={
                        src ??
                        '/images/chatHeader/userAvatar.svg'
                    }
                    alt={name}
                    className={`h-full w-full object-cover`}
                    width={80}
                    height={80}
                />
            </div>
            {/* Скрытый input для выбора файла */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*" // Только изображения
                className="hidden"
                onChange={handleChange}
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
            >
                Выбрать фотографию
            </Button>
        </div>
    )
}

export default AvatarPicker
