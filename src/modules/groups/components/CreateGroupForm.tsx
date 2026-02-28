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
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'

interface CropState {
    crop: { x: number; y: number }
    zoom: number
    croppedAreaPixels: Area | null
    croppedBlob: Blob | null
    originalFile: File | null
}

interface CreateGroupFormProps {
    onBack: () => void
    onNext: (data: onNextProps) => void
    initialData: onNextProps | null
}

const groupOptions = [
    {
        value: 'open',
        optionName: 'Открытая',
        optionDescription: `Открытую группу можно найти через поиск. Присоединиться к ней может любой пользователь`,
    },
    {
        value: 'closed',
        optionName: 'Закрытая',
        optionDescription: `В закрытую группу можно попасть только по приглашению или пригласительной ссылке`,
    },
]

export default function CreateGroupForm({
    onBack,
    onNext,
    initialData,
}: CreateGroupFormProps) {
    const isFirstRender = useRef(true)
    const previousPreviewRef = useRef<string | null>(null)

    const [isCropperOpen, setIsCropperOpen] =
        useState(false)
    const [selectedFile, setSelectedFile] =
        useState<File | null>(null)

    const [cropState, setCropState] = useState<CropState>({
        crop: { x: 0, y: 0 },
        zoom: 1.2,
        croppedAreaPixels: null,
        croppedBlob: null,
        originalFile: null,
    })

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
                    const foundOption = groupOptions.find(
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

    const [photoPreview, setPhotoPreview] = useState<
        string | null
    >(null)
    const hasImage = Boolean(
        photoPreview &&
        !photoPreview.includes('userAvatar.svg'),
    )

    // Создание preview URL
    useEffect(() => {
        let isMounted = true
        let animationFrameId: number | null = null

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
            newPreview = '/images/chatHeader/userAvatar.svg'
        }

        previousPreviewRef.current = newPreview

        animationFrameId = requestAnimationFrame(() => {
            if (isMounted) {
                setPhotoPreview(newPreview)
            }
        })

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

    // Восстановление из initialData при первом рендере
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            setTimeout(() => {
                if (initialData) {
                    setName(initialData.name || '')
                    setDescription(
                        initialData.description || '',
                    )

                    if (initialData.photo) {
                        setPhotoFile(initialData.photo)
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

                    if (initialData.type) {
                        const foundOption =
                            groupOptions.find(
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

    const handleFileSelect = useCallback(
        (file: File | null) => {
            if (file) {
                setCropState((prev) => ({
                    ...prev,
                    originalFile: file,
                    croppedBlob: null,
                    croppedAreaPixels: null,
                }))
                setSelectedFile(file)
                setPhotoFile(file)
            } else {
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

    const handleImageClick = useCallback(() => {
        if (hasImage) {
            if (cropState.originalFile) {
                setSelectedFile(cropState.originalFile)
            } else if (photoFile) {
                setSelectedFile(photoFile)
            }
            setIsCropperOpen(true)
        }
    }, [hasImage, cropState.originalFile, photoFile])

    const handleCropperClose = useCallback(() => {
        setIsCropperOpen(false)
    }, [])

    const handleCropperConfirm = useCallback(
        (
            blob: Blob,
            cropParams?: {
                crop: { x: number; y: number }
                zoom: number
                croppedAreaPixels: Area | null
            },
        ) => {
            const fileName =
                selectedFile?.name || 'group-avatar.png'
            const fileType =
                blob.type ||
                selectedFile?.type ||
                'image/png'
            const file = new File([blob], fileName, {
                type: fileType,
            })

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

    const handleCropperFileChange = useCallback(
        (file: File) => {
            setSelectedFile(file)
            setCropState((prev) => ({
                ...prev,
                originalFile: file,
                croppedBlob: null,
                croppedAreaPixels: null,
            }))
        },
        [],
    )

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (
            !name.trim() ||
            !description.trim() ||
            !choosenOption.value
        ) {
            return
        }

        const cropParams: CropParams = {
            crop: cropState.crop,
            zoom: cropState.zoom,
            croppedAreaPixels: cropState.croppedAreaPixels,
        }

        const dataToSend: onNextProps = {
            name: name.trim(),
            description: description.trim(),
            type: choosenOption.value,
            photo: photoFile,
            cropParams:
                cropState.croppedBlob ||
                cropState.originalFile
                    ? cropParams
                    : undefined,
        }

        onNext(dataToSend)
    }

    useEffect(() => {
        if (isFirstRender.current) return

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
                    const foundOption = groupOptions.find(
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

    const handleChangeOption = (
        option: GroupTypeOptionProps,
    ) => {
        setChoosenOption((prev) => ({ ...prev, ...option }))
    }

    return (
        <div className="flex h-full flex-col rounded-md bg-gray-main">
            {/* Заголовок с кнопкой назад */}
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
                    Создать группу
                </h2>
            </div>

            {/* Основное содержимое формы с кастомным скроллом */}
            <CustomScrollbar className="flex-1">
                <div className="flex justify-center p-4">
                    <form
                        onSubmit={onSubmit}
                        className="w-full max-w-82 space-y-4"
                    >
                        {/* Блок с выбором аватарки */}
                        <div className="flex flex-col items-center">
                            <AvatarPicker
                                src={photoPreview}
                                name={name || 'Группа'}
                                onFile={handleFileSelect}
                                onImageClick={
                                    handleImageClick
                                }
                            />
                        </div>

                        {/* Поля ввода названия и описания */}
                        <div className="w-full">
                            <div
                                className={`
                                  overflow-hidden rounded-md border
                                  border-app-divider
                                `}
                            >
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
                                    className="rounded-none border-0"
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
                                    className={`
                                      rounded-none border-0 border-t
                                      border-app-divider
                                    `}
                                />
                            </div>
                        </div>

                        {/* Выбор типа группы */}
                        <div>
                            <GroupTypeSelect
                                selectLabel="Тип группы"
                                value={choosenOption.value}
                                options={groupOptions}
                                onChange={
                                    handleChangeOption
                                }
                            />
                        </div>

                        {/* Кнопка отправки формы */}
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
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                `}
                            >
                                <span className="text-base font-medium">
                                    Далее
                                </span>
                            </Button>
                        </div>
                    </form>
                </div>
            </CustomScrollbar>

            {/* Модальное окно кадрирования */}
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
