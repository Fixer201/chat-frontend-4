import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import type { Area } from 'react-easy-crop'

interface UseAvatarCropperParams {
    imageFile?: File | null
    initialZoom?: number
    initialCrop?: { x: number; y: number } // Добавляем начальный crop
    initialCroppedAreaPixels?: Area | null // Добавляем начальную область кадрировани
}

interface CropState {
    x: number
    y: number
}

export function useAvatarCropper({
    imageFile,
    initialZoom = 1.2,
    initialCrop = { x: 0, y: 0 }, // Добавляем дефолтное значение
    initialCroppedAreaPixels = null, // Добавляем дефолтное значение
}: UseAvatarCropperParams) {
    const [localFile, setLocalFile] = useState<File | null>(
        null,
    )
    const [imageSrc, setImageSrc] = useState<string | null>(
        null,
    )
    const [crop, setCrop] = useState<CropState>(initialCrop)
    const [zoom, setZoom] = useState<number>(initialZoom)
    const [croppedAreaPixels, setCroppedAreaPixels] =
        useState<Area | null>(initialCroppedAreaPixels)

    const reset = useCallback(() => {
        setLocalFile(null)
        setImageSrc(null)
        setCrop(initialCrop)
        setZoom(initialZoom)
        setCroppedAreaPixels(initialCroppedAreaPixels)
    }, [initialZoom, initialCrop, initialCroppedAreaPixels])

    const activeFile = useMemo(
        () => imageFile ?? localFile,
        [imageFile, localFile],
    )

    useEffect(() => {
        let cancelled = false

        const loadImage = async () => {
            if (!activeFile) {
                setImageSrc(null)
                return
            }

            const dataUrl = await fileToDataUrl(activeFile)

            if (!cancelled) {
                setImageSrc(dataUrl)
                // Если это новый файл (не тот же самый), сбрасываем параметры к дефолтным
                // Можно добавить проверку, если нужно сохранять параметры для того же файла
                // const isSameFile = imageFile && localFile && imageFile.name === localFile.name
                setZoom(initialZoom)
                setCrop(initialCrop)
                setCroppedAreaPixels(
                    initialCroppedAreaPixels,
                )
            }
        }

        void loadImage()

        return () => {
            cancelled = true
        }
    }, [
        activeFile,
        initialZoom,
        initialCrop,
        initialCroppedAreaPixels,
    ])

    const handleCropComplete = useCallback(
        (_croppedArea: Area, areaPixels: Area) => {
            setCroppedAreaPixels(areaPixels)
        },
        [],
    )

    const handleFileChange = useCallback(
        (file: File) => {
            if (!file.type.startsWith('image/')) {
                return
            }
            setLocalFile(file)
            // При изменении файла сбрасываем параметры к начальным
            setZoom(initialZoom)
            setCrop(initialCrop)
            setCroppedAreaPixels(initialCroppedAreaPixels)
        },
        [
            initialZoom,
            initialCrop,
            initialCroppedAreaPixels,
        ],
    )

    return {
        imageSrc,
        crop,
        zoom,
        croppedAreaPixels,
        setCrop,
        setZoom,
        handleFileChange,
        handleCropComplete,
        reset,
    }
}

export async function getCroppedImage(
    imageSrc: string,
    pixelCrop: Area,
): Promise<Blob> {
    const image = await loadImage(imageSrc)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error(
            'Canvas is not supported in this browser',
        )
    }

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Область обрезки — круг, поэтому обрезаем по радиусу
    ctx.beginPath()
    ctx.arc(
        pixelCrop.width / 2,
        pixelCrop.height / 2,
        Math.min(pixelCrop.width, pixelCrop.height) / 2,
        0,
        2 * Math.PI,
    )
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
    )

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((file) => resolve(file), 'image/png'),
    )

    if (!blob) {
        throw new Error('Failed to crop image')
    }

    return blob
}

const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () =>
            resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.addEventListener('load', () => resolve(img))
        img.addEventListener('error', (error) =>
            reject(error),
        )
        img.setAttribute('crossOrigin', 'anonymous')
        img.src = src
    })
