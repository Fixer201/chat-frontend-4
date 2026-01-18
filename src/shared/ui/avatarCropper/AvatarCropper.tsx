import { useCallback, useMemo, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { Check, Upload, X } from 'lucide-react'
import type { Area } from 'react-easy-crop'

import { cn } from '@shared/lib/utils'

import {
    getCroppedImage,
    useAvatarCropper,
} from '@shared/ui/avatarCropper/useAvatarCropper'
import { Slider } from '@shared/ui/avatarCropper/slider'
import { Button } from '@shared/ui/button/Button'
import Modal from '@shared/ui/modal/Modal'

export interface AvatarCropperProps {
    isOpen: boolean
    imageFile?: File | null
    onClose: () => void
    onConfirm: (image: Blob) => void
    onFileChange?: (file: File) => void
    minZoom?: number
    maxZoom?: number
    initialZoom?: number
}

const confirmButtonClass = cn(
    'h-12 w-12 rounded-full',
    'bg-[var(--color-accent-violet-primary)]',
    'p-0',
    'hover:bg-[var(--color-accent-violet-dark)]',
)

export function AvatarCropper({
    isOpen,
    imageFile,
    onClose,
    onConfirm,
    onFileChange,
    minZoom = 1,
    maxZoom = 3,
    initialZoom = 1.2,
}: AvatarCropperProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        imageSrc,
        crop,
        zoom,
        croppedAreaPixels,
        setCrop,
        setZoom,
        handleFileChange,
        handleCropComplete,
        reset,
    } = useAvatarCropper({
        imageFile,
        initialZoom,
    })

    const handleClose = useCallback(() => {
        reset()
        onClose()
    }, [onClose, reset])

    const handleFileInput = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            if (!file) return
            handleFileChange(file)
            onFileChange?.(file)
        },
        [handleFileChange, onFileChange],
    )

    const hasImage = Boolean(imageSrc)

    const canConfirm = useMemo(
        () => Boolean(imageSrc && croppedAreaPixels),
        [croppedAreaPixels, imageSrc],
    )

    const handleConfirm = useCallback(async () => {
        if (!canConfirm || !croppedAreaPixels || !imageSrc)
            return
        try {
            const blob = await getCroppedImage(
                imageSrc,
                croppedAreaPixels as Area,
            )
            onConfirm(blob)
            handleClose()
        } catch (error) {
            // В продакшене можно добавить toast/логирование
            console.error('Avatar cropping failed', error)
        }
    }, [
        canConfirm,
        croppedAreaPixels,
        handleClose,
        imageSrc,
        onConfirm,
    ])

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title="Настроить отображение фото"
            titleAlign="left"
            titleClassName="text-[1.5rem] font-semibold"
            blurBackground
            closeOnOverlayClick
            className={cn(
                'relative w-full max-w-[30rem] rounded-lg bg-white',
                'px-6',
                'sm:px-8',
            )}
        >
            <button
                type="button"
                aria-label="Закрыть"
                onClick={handleClose}
                className={cn(
                    'absolute top-6.5 right-6.5 rounded-full p-2 text-[#1c1c1e]',
                    'transition',
                    'hover:bg-black/5',
                    'cursor-pointer',
                )}
            >
                <X className="h-5 w-5" aria-hidden />
            </button>

            <div className="flex w-full flex-col self-stretch">
                {hasImage ? (
                    <div className="space-y-3">
                        <div
                            className={cn(
                                'relative aspect-square w-full',
                                'overflow-hidden',
                                'bg-[#f5f5f7]',
                                'shadow-[0_12px_60px_rgba(0,0,0,0.08)]',
                            )}
                        >
                            <Cropper
                                image={imageSrc ?? ''}
                                crop={crop}
                                zoom={zoom}
                                minZoom={minZoom}
                                maxZoom={maxZoom}
                                cropShape="round"
                                showGrid={false}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(
                                    croppedArea: Area,
                                    areaPixels: Area,
                                ) =>
                                    handleCropComplete(
                                        croppedArea,
                                        areaPixels,
                                    )
                                }
                                classes={{
                                    containerClassName:
                                        'relative bg-[#f5f5f7]',
                                    mediaClassName:
                                        'object-cover',
                                }}
                                zoomWithScroll={false}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Slider
                                value={[zoom]}
                                min={minZoom}
                                max={maxZoom}
                                step={0.01}
                                onValueChange={([
                                    value,
                                ]: number[]) =>
                                    setZoom(value)
                                }
                                aria-label="Масштаб"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="solid"
                                color="primary"
                                size="md"
                                disabled={!canConfirm}
                                onClick={handleConfirm}
                                aria-label="Применить"
                                className={
                                    confirmButtonClass
                                }
                            >
                                <Check className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={cn(
                            'flex flex-col items-center gap-4',
                            'rounded-3xl',
                            'border border-dashed border-[#d9d9e3]',
                            'bg-[#fafafa]',
                            'p-10 text-center',
                        )}
                        role="button"
                        tabIndex={0}
                        onClick={openFileDialog}
                        onKeyDown={(event) => {
                            if (
                                event.key === 'Enter' ||
                                event.key === ' '
                            ) {
                                event.preventDefault()
                                openFileDialog()
                            }
                        }}
                    >
                        <div
                            className={cn(
                                'flex h-20 w-20 items-center justify-center',
                                'rounded-full',
                                'bg-[#eae9f7] text-[#7f67f8]',
                            )}
                        >
                            <Upload
                                className="h-10 w-10"
                                aria-hidden
                            />
                        </div>
                        <div className="space-y-1">
                            <p
                                className={cn(
                                    'text-lg font-medium',
                                    'text-[#1c1c1e]',
                                )}
                            >
                                Загрузить изображение
                            </p>
                            <p className="text-sm text-[#6b7280]">
                                Поддерживаются файлы
                                изображений (JPEG, PNG,
                                WEBP)
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            color="primary"
                            size="md"
                            onClick={openFileDialog}
                            className="rounded-full px-5"
                        >
                            Выбрать файл
                        </Button>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                />
            </div>
        </Modal>
    )
}
