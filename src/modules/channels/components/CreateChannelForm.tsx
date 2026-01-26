// CreateChannelForm.tsx
'use client'

import {
    useEffect,
    useState,
    useRef,
    useCallback,
} from 'react'
import FloatingTextarea from '@shared/ui/floating/FloatingTextarea'
import AvatarPicker from '@shared/ui/avatar/AvatarPicker'
import { AvatarCropper } from '@shared/ui/avatarCropper/AvatarCropper'
import GroupTypeSelect from '@shared/ui/select/GroupTypeSelect'
import { Button } from '@shared/ui/button/Button'
import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import {
    GroupTypeOptionProps,
    onNextProps,
    CropParams,
} from '@shared/types/createGroup'
import { Area } from 'react-easy-crop'

// Интерфейс для внутреннего состояния кадрирования
interface CropState {
    crop: { x: number; y: number }
    zoom: number
    croppedAreaPixels: Area | null
    croppedBlob: Blob | null
    originalFile: File | null
}

interface CreateChannelFormProps {
    onBack: () => void
    onNext: (data: onNextProps | string) => void
    initialData: onNextProps | null
}

// Опции для выбора типа канала
const channelOptions = [
    {
        value: 'public',
        optionName: 'Публичный',
        optionDescription: `Публичный канал можно найти через поиск. Подписаться на него может любой пользователь`,
    },
    {
        value: 'private',
        optionName: 'Частный',
        optionDescription: `В частный канал можно попасть только по приглашению или пригласительной ссылке`,
    },
]

export default function CreateChannelForm({
    onBack,
    onNext,
    initialData,
}: CreateChannelFormProps) {
    const isFirstRender = useRef(true)
    const previousPreviewRef = useRef<string | null>(null)

    // Состояния для кадрирования
    const [isCropperOpen, setIsCropperOpen] =
        useState(false)
    const [selectedFile, setSelectedFile] =
        useState<File | null>(null)

    // Полное состояние кадрирования для сохранения
    const [cropState, setCropState] = useState<CropState>({
        crop: { x: 0, y: 0 },
        zoom: 1.2,
        croppedAreaPixels: null,
        croppedBlob: null,
        originalFile: null,
    })

    // Остальные состояния
    const [photoFile, setPhotoFile] = useState<File | null>(
        initialData?.photo || null,
    )
    const [name, setName] = useState(
        initialData?.name || '',
    )
    const [description, setDescription] = useState(
        initialData?.description || '',
    )
    const [choosenOption, setChoosenOption] =
        useState<GroupTypeOptionProps>(() => {
            const getInitialOption = () => {
                if (initialData?.type) {
                    const foundOption = channelOptions.find(
                        (option) =>
                            option.value ===
                            initialData.type,
                    )
                    return (
                        foundOption || {
                            value: '',
                            optionName: '',
                            optionDescription: '',
                        }
                    )
                }
                return {
                    value: '',
                    optionName: '',
                    optionDescription: '',
                }
            }
            return getInitialOption()
        })

    // Состояние для preview URL
    const [photoPreview, setPhotoPreview] = useState<
        string | null
    >(null)

    // Определяем, есть ли изображение (не дефолтное)
    const hasImage = Boolean(
        photoPreview &&
        !photoPreview.includes('userAvatar.svg'),
    )

    // Создание preview URL с использованием useEffect
    useEffect(() => {
        let isMounted = true
        let animationFrameId: number | null = null

        // Очищаем предыдущий preview URL
        if (previousPreviewRef.current) {
            URL.revokeObjectURL(previousPreviewRef.current)
        }

        let newPreview: string | null = null

        if (cropState.croppedBlob) {
            newPreview = URL.createObjectURL(
                cropState.croppedBlob,
            )
        } else if (cropState.originalFile) {
            newPreview = URL.createObjectURL(
                cropState.originalFile,
            )
        } else if (photoFile) {
            newPreview = URL.createObjectURL(photoFile)
        } else {
            // Используем дефолтное изображение
            newPreview = '/images/chatHeader/userAvatar.svg'
        }

        // Сохраняем новый preview в ref
        previousPreviewRef.current = newPreview

        // Откладываем обновление состояния до следующего кадра анимации
        animationFrameId = requestAnimationFrame(() => {
            if (isMounted) {
                setPhotoPreview(newPreview)
            }
        })

        // Очистка при размонтировании
        return () => {
            isMounted = false

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId)
            }

            if (
                previousPreviewRef.current &&
                previousPreviewRef.current.startsWith(
                    'blob:',
                )
            ) {
                URL.revokeObjectURL(
                    previousPreviewRef.current,
                )
                previousPreviewRef.current = null
            }
        }
    }, [
        cropState.croppedBlob,
        cropState.originalFile,
        photoFile,
    ])

    // Восстановление состояния из initialData при первом рендере
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false

            // Используем setTimeout для асинхронного восстановления состояния
            setTimeout(() => {
                if (initialData) {
                    setName(initialData.name || '')
                    setDescription(
                        initialData.description || '',
                    )

                    // Восстанавливаем состояние кадрирования если есть параметры
                    if (initialData.photo) {
                        setPhotoFile(initialData.photo)

                        // Восстанавливаем cropState если есть параметры кадрирования
                        if (initialData.cropParams) {
                            setCropState({
                                crop: initialData.cropParams
                                    .crop || { x: 0, y: 0 },
                                zoom:
                                    initialData.cropParams
                                        .zoom || 1.2,
                                croppedAreaPixels:
                                    initialData.cropParams
                                        .croppedAreaPixels ||
                                    null,
                                croppedBlob: null,
                                originalFile:
                                    initialData.photo,
                            })
                        } else {
                            setCropState((prev) => ({
                                ...prev,
                                originalFile:
                                    initialData.photo,
                            }))
                        }
                    }

                    // Восстанавливаем выбранную опцию
                    if (initialData.type) {
                        const foundOption =
                            channelOptions.find(
                                (option) =>
                                    option.value ===
                                    initialData.type,
                            )
                        if (foundOption) {
                            setChoosenOption(foundOption)
                        }
                    }
                }
            }, 0)
        }
    }, [initialData])

    // Обработчик выбора файла из AvatarPicker (по кнопке)
    const handleFileSelect = useCallback(
        (file: File | null) => {
            if (file) {
                // Сохраняем файл как originalFile в cropState
                setCropState((prev) => ({
                    ...prev,
                    originalFile: file,
                    croppedBlob: null,
                    croppedAreaPixels: null,
                }))
                setSelectedFile(file)
                setPhotoFile(file)
                // НЕ открываем кадрирование! Только сохраняем файл
            } else {
                // Сброс аватарки
                setPhotoFile(null)
                setSelectedFile(null)
                setCropState({
                    crop: { x: 0, y: 0 },
                    zoom: 1.2,
                    croppedAreaPixels: null,
                    croppedBlob: null,
                    originalFile: null,
                })
            }
        },
        [],
    )

    // Обработчик клика по изображению в AvatarPicker
    const handleImageClick = useCallback(() => {
        // Открываем кадрирование только если есть изображение
        if (hasImage) {
            // Используем originalFile для кадрирования
            if (cropState.originalFile) {
                setSelectedFile(cropState.originalFile)
            } else if (photoFile) {
                setSelectedFile(photoFile)
            }
            setIsCropperOpen(true)
        }
    }, [hasImage, cropState.originalFile, photoFile])

    // Обработчик закрытия кадрирования
    const handleCropperClose = useCallback(() => {
        setIsCropperOpen(false)
    }, [])

    // Обработчик подтверждения кадрирования
    const handleCropperConfirm = useCallback(
        (
            blob: Blob,
            cropParams?: {
                crop: { x: number; y: number }
                zoom: number
                croppedAreaPixels: Area | null
            },
        ) => {
            // Конвертируем Blob в File для сохранения
            const fileName =
                selectedFile?.name || 'channel-avatar.png'
            const fileType =
                blob.type ||
                selectedFile?.type ||
                'image/png'
            const file = new File([blob], fileName, {
                type: fileType,
            })

            // Сохраняем полное состояние кадрирования
            setCropState((prev) => ({
                ...prev,
                croppedBlob: blob,
                ...(cropParams || {
                    crop: prev.crop,
                    zoom: prev.zoom,
                    croppedAreaPixels:
                        prev.croppedAreaPixels,
                }),
            }))

            setPhotoFile(file)
            setIsCropperOpen(false)
        },
        [selectedFile],
    )

    // Обработчик изменения файла в кадрировании (загрузка нового)
    const handleCropperFileChange = useCallback(
        (file: File) => {
            setSelectedFile(file)
            // Сохраняем как originalFile и сбрасываем предыдущее кадрирование
            setCropState((prev) => ({
                ...prev,
                originalFile: file,
                croppedBlob: null,
                croppedAreaPixels: null,
            }))
        },
        [],
    )

    // Обработчик отправки формы
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Валидация обязательных полей
        if (
            !name.trim() ||
            !description.trim() ||
            !choosenOption.value
        )
            return

        // Создаем объект CropParams для передачи
        const cropParams: CropParams = {
            crop: cropState.crop,
            zoom: cropState.zoom,
            croppedAreaPixels: cropState.croppedAreaPixels,
        }

        // Передача данных в родительский компонент
        onNext({
            name: name.trim(),
            description: description.trim(),
            type: choosenOption.value,
            photo: photoFile,
            cropParams:
                cropState.croppedBlob ||
                cropState.originalFile
                    ? cropParams
                    : undefined,
        })
    }

    // Обновление состояния формы при изменении initialData (после первого рендера)
    useEffect(() => {
        if (isFirstRender.current) {
            return
        }

        if (initialData) {
            const updateTimer = setTimeout(() => {
                setName(initialData.name || '')
                setDescription(
                    initialData.description || '',
                )

                if (
                    initialData.photo !== undefined &&
                    initialData.photo
                ) {
                    setPhotoFile(initialData.photo)
                    // Если есть photo, устанавливаем его как originalFile
                    setCropState((prev) => ({
                        ...prev,
                        originalFile:
                            initialData.photo as File,
                        ...(initialData.cropParams
                            ? {
                                  crop: initialData
                                      .cropParams.crop,
                                  zoom: initialData
                                      .cropParams.zoom,
                                  croppedAreaPixels:
                                      initialData.cropParams
                                          .croppedAreaPixels,
                              }
                            : {}),
                    }))
                } else if (initialData.photo === null) {
                    // Если photo явно null, сбрасываем
                    setPhotoFile(null)
                    setCropState({
                        crop: { x: 0, y: 0 },
                        zoom: 1.2,
                        croppedAreaPixels: null,
                        croppedBlob: null,
                        originalFile: null,
                    })
                }

                if (initialData.type) {
                    const foundOption = channelOptions.find(
                        (option) =>
                            option.value ===
                            initialData.type,
                    )
                    if (foundOption) {
                        setChoosenOption(foundOption)
                    }
                }
            }, 0)

            return () => clearTimeout(updateTimer)
        } else {
            const resetTimer = setTimeout(() => {
                setName('')
                setDescription('')
                setPhotoFile(null)
                setSelectedFile(null)
                setCropState({
                    crop: { x: 0, y: 0 },
                    zoom: 1.2,
                    croppedAreaPixels: null,
                    croppedBlob: null,
                    originalFile: null,
                })
                setChoosenOption({
                    value: '',
                    optionName: '',
                    optionDescription: '',
                })
            }, 0)

            return () => clearTimeout(resetTimer)
        }
    }, [initialData])

    // Обработчик изменения типа канала
    const handleChangeOption = (
        option: GroupTypeOptionProps,
    ) => {
        setChoosenOption((prev) => ({ ...prev, ...option }))
    }

    return (
        <div className="flex h-full flex-col rounded-md bg-gray-main">
            <div
                className={`
                  flex items-center justify-start gap-3 rounded-t-md border-b
                  border-app-divider bg-gray-main px-6 py-4
                `}
            >
                <Button
                    onClick={onBack}
                    aria-label="Назад"
                    variant="ghost"
                    size="sm"
                    className={`
                      flex items-center justify-center rounded-full
                      text-text-black transition-colors
                      hover:bg-accent-violet-ultra-light
                    `}
                >
                    <BackIcon className="mx-1 cursor-pointer" />
                </Button>
                <h2
                    className={`
                      text-lg font-medium tracking-extra-tight text-text-black
                    `}
                >
                    Создать канал
                </h2>
            </div>

            <div className="flex flex-1 justify-center p-4">
                <form
                    onSubmit={onSubmit}
                    className="w-full max-w-82 space-y-4"
                >
                    <div className="flex flex-col items-center">
                        <AvatarPicker
                            src={photoPreview}
                            name={name || 'Канал'}
                            onFile={handleFileSelect}
                            onImageClick={handleImageClick}
                        />
                    </div>

                    <div className="w-full">
                        <div className="flex w-full flex-col">
                            <FloatingTextarea
                                position="top"
                                label="Название*"
                                maxLength={100}
                                value={name}
                                onChange={(e) =>
                                    setName(
                                        (
                                            e.target as HTMLTextAreaElement
                                        ).value,
                                    )
                                }
                            />
                            <FloatingTextarea
                                position="bottom"
                                label="Описание"
                                maxLength={250}
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        (
                                            e.target as HTMLTextAreaElement
                                        ).value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <GroupTypeSelect
                            selectLabel="Тип канала"
                            value={choosenOption.value}
                            options={channelOptions}
                            onChange={(option) =>
                                handleChangeOption(option)
                            }
                        />
                    </div>

                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            disabled={
                                !name.trim() ||
                                !description.trim() ||
                                !choosenOption.value
                            }
                            variant="solid"
                            size="md"
                            className={`
                              h-14 w-full max-w-82 rounded-md
                              disabled:cursor-not-allowed disabled:opacity-50
                            `}
                        >
                            <span className="text-base font-medium">
                                Далее
                            </span>
                        </Button>
                    </div>
                </form>
            </div>

            {/* Модальное окно кадрирования с передачей сохраненных параметров */}
            <AvatarCropper
                isOpen={isCropperOpen}
                imageFile={selectedFile ?? undefined}
                onClose={handleCropperClose}
                onFileChange={handleCropperFileChange}
                onConfirm={handleCropperConfirm}
                initialCrop={cropState.crop}
                initialZoom={cropState.zoom}
                initialCroppedAreaPixels={
                    cropState.croppedAreaPixels || undefined
                }
                minZoom={1}
                maxZoom={3}
            />
        </div>
    )
}
