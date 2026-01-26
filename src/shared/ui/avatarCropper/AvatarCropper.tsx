import { useCallback, useMemo, useRef } from 'react'
import Cropper from 'react-easy-crop' // Компонент кадрирования
import { Check, Upload, X } from 'lucide-react' // Иконки
import type { Area } from 'react-easy-crop' // Тип области кадрирования

import { cn } from '@shared/lib/utils' // Утилита для объединения классов

import {
    getCroppedImage, // Функция для получения кадрированного изображения
    useAvatarCropper, // Кастомный хук для управления состоянием кадрирования
} from '@shared/ui/avatarCropper/useAvatarCropper'
import { Slider } from '@shared/ui/avatarCropper/slider' // Кастомный слайдер
import { Button } from '@shared/ui/button/Button'
import Modal from '@shared/ui/modal/Modal' // Компонент модального окна

export interface AvatarCropperProps {
    isOpen: boolean // Управление видимостью модального окна
    imageFile?: File | null // Файл изображения для кадрирования
    onClose: () => void // Колбэк закрытия модалки
    onConfirm: (
        // Меняем сигнатуру - теперь возвращаем и Blob и параметры
        image: Blob, // Кадрированное изображение
        cropParams?: {
            // Параметры кадрирования для сохранения
            crop: { x: number; y: number } // Позиция
            zoom: number // Масштаб
            croppedAreaPixels: Area | null // Область в пикселях
        },
    ) => void
    onFileChange?: (file: File) => void // Колбэк при изменении файла в кадрировании
    minZoom?: number // Минимальный зум
    maxZoom?: number // Максимальный зум
    initialZoom?: number // Начальный зум
    // Добавляем новые пропсы для сохраненного состояния
    initialCrop?: { x: number; y: number } // Сохраненное положение кадрирования
    initialCroppedAreaPixels?: Area // Сохраненная область кадрирования
}

// Предопределенные стили для кнопки подтверждения
const confirmButtonClass = cn(
    'h-12 w-12 rounded-full', // Круглая кнопка фиксированного размера
    'bg-accent-violet-primary', // Основной цвет
    'p-0', // Без padding (только иконка)
    'hover:bg-accent-violet-dark', // Эффект при наведении
)

export function AvatarCropper({
    isOpen,
    imageFile,
    onClose,
    onConfirm,
    onFileChange,
    minZoom = 1, // Дефолтные значения
    maxZoom = 3,
    initialZoom = 1.2,
    // Добавляем новые пропсы с дефолтными значениями
    initialCrop = { x: 0, y: 0 },
    initialCroppedAreaPixels,
}: AvatarCropperProps) {
    const fileInputRef = useRef<HTMLInputElement>(null) // Ref для скрытого файлового input

    // Используем кастомный хук для управления состоянием кадрирования
    const {
        imageSrc, // URL изображения для Cropper
        crop, // Текущая позиция кадрирования
        zoom, // Текущий зум
        croppedAreaPixels, // Область кадрирования в пикселях
        setCrop, // Установщик позиции
        setZoom, // Установщик зума
        handleFileChange, // Обработчик изменения файла
        handleCropComplete, // Обработчик завершения кадрирования
        reset, // Сброс состояния
    } = useAvatarCropper({
        imageFile,
        initialZoom,
        initialCrop, // Передаем начальное положение кадрирования для восстановления
        initialCroppedAreaPixels, // Передаем начальную область кадрирования
    })

    // Обработчик закрытия модалки - сбрасывает состояние и вызывает onClose
    const handleClose = useCallback(() => {
        reset() // Сбрасываем состояние кадрирования
        onClose() // Вызываем внешний колбэк
    }, [onClose, reset])

    // Обработчик выбора файла через input
    const handleFileInput = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            if (!file) return
            handleFileChange(file) // Обновляем состояние в хуке
            onFileChange?.(file) // Вызываем внешний колбэк
        },
        [handleFileChange, onFileChange],
    )

    const hasImage = Boolean(imageSrc) // Есть ли изображение для кадрирования

    // Мемоизированная проверка можно ли подтвердить кадрирование
    const canConfirm = useMemo(
        () => Boolean(imageSrc && croppedAreaPixels), // Нужны и изображение и область
        [croppedAreaPixels, imageSrc],
    )

    // Обработчик подтверждения кадрирования
    const handleConfirm = useCallback(async () => {
        if (!canConfirm || !croppedAreaPixels || !imageSrc)
            return // Защита от вызова без данных
        try {
            // Получаем кадрированное изображение как Blob
            const blob = await getCroppedImage(
                imageSrc,
                croppedAreaPixels as Area,
            )
            // Передаем не только blob, но и текущие параметры кадрирования
            onConfirm(blob, {
                crop, // текущее положение
                zoom, // текущий зум
                croppedAreaPixels, // текущая область кадрирования
            })
            handleClose() // Закрываем модалку после успеха
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
        crop, // Добавляем в зависимости - при изменении crop функция пересоздается
        zoom, // Добавляем в зависимости
    ])

    // Функция для открытия диалога выбора файла
    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click() // Программный клик по input
    }, [])

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title="Настроить отображение фото"
            titleAlign="left" // Выравнивание заголовка
            titleClassName="text-[1.5rem] font-semibold" // Стили заголовка
            blurBackground // Эффект размытия фона
            closeOnOverlayClick // Закрытие по клику на оверлей
            className={cn(
                'relative w-full max-w-120 rounded-lg bg-white-bg',
                'px-6',
                'sm:px-8',
            )}
        >
            {/* Кнопка закрытия модалки (крестик) */}
            <button
                type="button"
                aria-label="Закрыть" // Для скринридеров
                onClick={handleClose}
                className={cn(
                    `
                      absolute top-6.5 right-6.5 rounded-full p-2
                      text-text-black
                    `,
                    'transition',
                    'hover:bg-text-black/5',
                    'cursor-pointer',
                )}
            >
                <X className="h-5 w-5" aria-hidden />{' '}
                {/* Иконка закрытия */}
            </button>

            <div className="flex w-full flex-col self-stretch">
                {hasImage ? ( // Если есть изображение - показываем кадрировщик
                    <div className="space-y-3">
                        {/* Контейнер для компонента кадрирования */}
                        <div
                            className={cn(
                                'relative aspect-square w-full',
                                'overflow-hidden',
                                'bg-white-bg',
                                'shadow-[0_12px_60px_rgba(0,0,0,0.08)]',
                            )}
                        >
                            <Cropper
                                image={imageSrc ?? ''} // URL изображения
                                crop={crop} // Позиция кадрирования
                                zoom={zoom} // Уровень масштабирования
                                minZoom={minZoom}
                                maxZoom={maxZoom}
                                cropShape="round" // Круглая область кадрирования
                                showGrid={false} // Не показывать сетку
                                aspect={1} // Квадратное соотношение сторон
                                onCropChange={setCrop} // Обработчик изменения позиции
                                onZoomChange={setZoom} // Обработчик изменения зума
                                onCropComplete={(
                                    croppedArea: Area,
                                    areaPixels: Area,
                                ) =>
                                    handleCropComplete(
                                        // Сохраняем область кадрирования
                                        croppedArea,
                                        areaPixels,
                                    )
                                }
                                classes={{
                                    // Кастомные классы для внутренних элементов
                                    containerClassName:
                                        'relative bg-gray-main', // Фон контейнера
                                    mediaClassName:
                                        'object-cover', // Стили изображения
                                }}
                                zoomWithScroll={false} // Отключаем масштабирование скроллом
                            />
                        </div>

                        {/* Панель управления с слайдером и кнопкой подтверждения */}
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[zoom]} // Текущее значение в массиве
                                min={minZoom}
                                max={maxZoom}
                                step={0.01} // Мелкий шаг для плавности
                                onValueChange={
                                    ([value]: number[]) =>
                                        setZoom(value) // Обновляем зум
                                }
                                aria-label="Масштаб" // Для доступности
                                className="flex-1" // Занимает доступное пространство
                            />
                            <Button
                                type="button"
                                variant="solid"
                                color="primary"
                                size="md"
                                disabled={!canConfirm} // Отключаем если нельзя подтвердить
                                onClick={handleConfirm}
                                aria-label="Применить"
                                className={
                                    confirmButtonClass // Предопределенные стили
                                }
                            >
                                <Check className="h-6 w-6" />{' '}
                                {/* Иконка галочки */}
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Если нет изображения - показываем зону загрузки
                    <div
                        className={cn(
                            'flex flex-col items-center gap-4',
                            'rounded-3xl',
                            'border border-dashed border-white-bg',
                            'bg-white-bg',
                            'p-10 text-center',
                        )}
                        role="button" // Семантическая роль для доступности
                        tabIndex={0} // Делаем фокусируемым
                        onClick={openFileDialog} // Клик открывает диалог выбора файла
                        onKeyDown={(event) => {
                            // Обработка клавиатуры для доступности
                            if (
                                event.key === 'Enter' ||
                                event.key === ' '
                            ) {
                                event.preventDefault()
                                openFileDialog()
                            }
                        }}
                    >
                        {/* Иконка загрузки */}
                        <div
                            className={cn(
                                'flex h-20 w-20 items-center justify-center',
                                'rounded-full',
                                'bg-white-bg text-accent-violet-primary',
                            )}
                        >
                            <Upload
                                className="h-10 w-10"
                                aria-hidden // Скрываем от скринридеров (есть текстовое описание)
                            />
                        </div>
                        <div className="space-y-1">
                            <p
                                className={cn(
                                    'text-lg font-medium',
                                    'text-text-black',
                                )}
                            >
                                Загрузить изображение
                            </p>
                            <p className="text-sm text-gray-light">
                                Поддерживаются файлы
                                изображений (JPEG, PNG,
                                WEBP) // Информация о
                                форматах
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline" // Контурная кнопка
                            color="primary"
                            size="md"
                            onClick={openFileDialog}
                            className="rounded-full px-5"
                        >
                            Выбрать файл
                        </Button>
                    </div>
                )}

                {/* Скрытый input для выбора файла */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*" // Только изображения
                    className="hidden"
                    onChange={handleFileInput}
                />
            </div>
        </Modal>
    )
}
