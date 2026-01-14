import React, { useRef } from 'react'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'

export interface AvatarPickerProps {
    src?: string | null
    name?: string
    size?: number
    onFile?: (file: File | null) => void
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
    src,
    name = '',
    size = 200,
    onFile,
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null)

    const handleChoose = () => inputRef.current?.click()
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const f = e.target.files?.[0] ?? null
        onFile?.(f)
    }

    return (
        <div className="flex w-full flex-col items-center">
            <div
                style={{ width: size, height: size }}
                className={`
          flex items-center justify-center overflow-hidden rounded-full
          bg-(--color-accent-violet-light)
        `}
            >
                <Image
                    src={
                        src ??
                        '/images/chatHeader/userAvatar.svg'
                    }
                    alt={name}
                    className={`h-full w-full object-cover`}
                />
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />
            <Button
                type="button"
                onClick={handleChoose}
                variant="ghost"
                size="md"
                className={`
          mt-1 w-full text-center text-base text-(--color-accent-violet-primary)
        `}
            >
                Выбрать фотографию
            </Button>
        </div>
    )
}

export default AvatarPicker
