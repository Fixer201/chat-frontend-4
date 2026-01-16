# AvatarCropper

Переиспользуемый компонент для загрузки и круглого кадрирования аватара.

## API

```ts
interface AvatarCropperProps {
    isOpen: boolean
    imageFile?: File | null
    onClose: () => void
    onConfirm: (image: Blob) => void
    onFileChange?: (file: File) => void
    minZoom?: number
    maxZoom?: number
    initialZoom?: number
}
```

- **isOpen** — управляет открытием модалки.
- **imageFile** — начальный файл (опционально).
- **onClose** — вызов при закрытии (сбрасывает внутреннее состояние).
- **onConfirm** — отдаёт Blob с обрезанным изображением.
- **onFileChange** — информирует родителя о выборе файла.
- **minZoom / maxZoom / initialZoom** — границы и стартовое значение зума.

## Пример использования

```tsx
import { useState } from 'react'
import { AvatarCropper } from '@shared/ui/avatar-cropper/AvatarCropper'

export function ProfilePhotoEditor() {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
            >
                Обновить фото
            </button>

            <AvatarCropper
                isOpen={open}
                imageFile={file ?? undefined}
                onClose={() => {
                    setOpen(false)
                    setFile(null)
                }}
                onFileChange={setFile}
                onConfirm={(blob) => {
                    // отправьте Blob в API или превратите в FormData
                    console.log('cropped blob', blob)
                }}
            />
        </>
    )
}
```
