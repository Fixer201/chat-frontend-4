import React, {
    useRef,
    KeyboardEvent,
    useState,
    useEffect,
} from 'react'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'

export interface AvatarPickerProps {
    src?: string | null
    name?: string
    size?: number
    onFile?: (file: File | null) => void
    onImageClick?: () => void
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({
    src,
    name = '',
    size = 200,
    onFile,
    onImageClick,
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [hasError, setHasError] = useState(false)

    const handleChoose = () => inputRef.current?.click()

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const f = e.target.files?.[0] ?? null
        onFile?.(f)
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    const handleImageClick = () => {
        if (onImageClick && hasImage) {
            onImageClick()
        }
    }

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

    const handleImageError = () => {
        setHasError(true)
    }

    const imageUrl = hasError
        ? '/images/altImage.png'
        : src || '/images/chatHeader/userAvatar.svg'

    const hasImage =
        Boolean(src && !src.includes('userAvatar.svg')) &&
        !hasError
    const canClickImage = hasImage && Boolean(onImageClick)

    return (
        <div className="flex w-full flex-col items-center">
            <div
                style={{ width: size, height: size }}
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
                <Image
                    key={src} // ✅ ключ заставляет пересоздавать компонент при смене src
                    src={imageUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                    width={size}
                    height={size}
                    unoptimized={true}
                    priority={true}
                    onError={handleImageError}
                />
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
                aria-label={`Выбрать аватар для ${name || 'группы'}`}
            />

            <Button
                type="button"
                onClick={handleChoose}
                variant="ghost"
                size="md"
                className={`
                  mt-1 w-full text-center text-base text-accent-violet-primary
                `}
                aria-label={`Выбрать фотографию для ${name || 'группы'}`}
            >
                Выбрать фотографию
            </Button>
        </div>
    )
}
export default AvatarPicker
