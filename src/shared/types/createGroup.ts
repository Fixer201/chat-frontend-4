import { Area } from 'react-easy-crop'

// Интерфейс для параметров кадрирования
export interface CropParams {
    crop: { x: number; y: number }
    zoom: number
    croppedAreaPixels: Area | null
}

// Обновляем интерфейс onNextProps
export interface onNextProps {
    name: string
    description: string
    type: string
    photo: File | null
    cropParams?: CropParams // Добавляем опциональный параметр кадрирования
}
export interface GroupTypeOptionProps {
    value?: string
    optionName?: string
    optionDescription?: string
}
export interface GroupTypeOptionProps {
    value?: string
    optionName?: string
    optionDescription?: string
}
