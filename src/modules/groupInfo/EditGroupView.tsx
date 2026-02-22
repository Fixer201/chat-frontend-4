'use client'

import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useReducer,
} from 'react'
import { Button } from '@shared/ui/button/Button'
import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import AvatarPicker from '@shared/ui/avatar/AvatarPicker'
import { AvatarCropper } from '@shared/ui/avatarCropper/AvatarCropper'
import FloatingTextarea from '@shared/ui/floating/FloatingTextarea'
import GroupTypeSelect from '@shared/ui/select/GroupTypeSelect'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { Area } from 'react-easy-crop'
import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard'
import Modal from '@shared/ui/modal/Modal'

// Тип для опции группы (можно вынести в shared/types)
interface GroupTypeOptionProps {
    value: string
    optionName: string
    optionDescription: string
}

// Тип состояния формы
interface FormState {
    name: string
    description: string
    selectedOption: GroupTypeOptionProps
    notificationsEnabled: boolean
    photoFile: File | null
    photoPreview: string | null
    selectedFile: File | null
    cropState: CropState
}

interface CropState {
    crop: { x: number; y: number }
    zoom: number
    croppedAreaPixels: Area | null
    croppedBlob: Blob | null
    originalFile: File | null
}

// Экшены для reducer'а
type FormAction =
    | { type: 'SET_NAME'; payload: string }
    | { type: 'SET_DESCRIPTION'; payload: string }
    | {
          type: 'SET_SELECTED_OPTION'
          payload: GroupTypeOptionProps
      }
    | {
          type: 'SET_NOTIFICATIONS_ENABLED'
          payload: boolean
      }
    | { type: 'SET_PHOTO_FILE'; payload: File | null }
    | { type: 'SET_PHOTO_PREVIEW'; payload: string | null }
    | { type: 'SET_SELECTED_FILE'; payload: File | null }
    | {
          type: 'SET_CROP_STATE'
          payload:
              | Partial<CropState>
              | ((prev: CropState) => CropState)
      }
    | { type: 'RESET_FROM_PROPS'; payload: FormState }

const groupOptions: GroupTypeOptionProps[] = [
    {
        value: 'open',
        optionName: 'Открытая',
        optionDescription:
            'Открытую группу можно найти через поиск. Присоединиться к ней может любой пользователь',
    },
    {
        value: 'closed',
        optionName: 'Закрытая',
        optionDescription:
            'В закрытую группу можно попасть только по приглашению или пригласительной ссылке',
    },
]

// Редьюсер для формы
function formReducer(
    state: FormState,
    action: FormAction,
): FormState {
    switch (action.type) {
        case 'SET_NAME':
            return { ...state, name: action.payload }
        case 'SET_DESCRIPTION':
            return { ...state, description: action.payload }
        case 'SET_SELECTED_OPTION':
            return {
                ...state,
                selectedOption: action.payload,
            }
        case 'SET_NOTIFICATIONS_ENABLED':
            return {
                ...state,
                notificationsEnabled: action.payload,
            }
        case 'SET_PHOTO_FILE':
            return { ...state, photoFile: action.payload }
        case 'SET_PHOTO_PREVIEW':
            return {
                ...state,
                photoPreview: action.payload,
            }
        case 'SET_SELECTED_FILE':
            return {
                ...state,
                selectedFile: action.payload,
            }
        case 'SET_CROP_STATE':
            if (typeof action.payload === 'function') {
                return {
                    ...state,
                    cropState: action.payload(
                        state.cropState,
                    ),
                }
            }
            return {
                ...state,
                cropState: {
                    ...state.cropState,
                    ...action.payload,
                },
            }
        case 'RESET_FROM_PROPS':
            return action.payload
        default:
            return state
    }
}

interface EditGroupViewProps {
    initialName: string
    initialDescription: string
    initialType: string // 'open' | 'closed'
    initialAvatarUrl?: string | null
    initialNotificationsEnabled: boolean
    inviteLink?: string
    onSave: (data: {
        name: string
        description: string
        type: string
        notificationsEnabled: boolean
        avatarFile?: File | null
    }) => void
    onCancel: () => void
}

export default function EditGroupView({
    initialName,
    initialDescription,
    initialType,
    initialAvatarUrl,
    initialNotificationsEnabled,
    inviteLink,
    onSave,
    onCancel,
}: EditGroupViewProps) {
    const previousPreviewRef = useRef<string | null>(null)
    const prevInitialRef = useRef({
        name: initialName,
        description: initialDescription,
        type: initialType,
        notifications: initialNotificationsEnabled,
        avatar: initialAvatarUrl,
    })

    // Состояние для модалки подтверждения выхода
    const [isModalOpen, setIsModalOpen] = useState(false)
    // Состояние для кадрирования (отдельно от формы)
    const [isCropperOpen, setIsCropperOpen] =
        useState(false)

    // Хук для копирования ссылки
    const [copied, copyToClipboard] =
        useCopyToClipboard(700)

    // Начальное состояние формы
    const initialFormState = (): FormState => ({
        name: initialName,
        description: initialDescription,
        selectedOption:
            groupOptions.find(
                (opt) => opt.value === initialType,
            ) || groupOptions[0],
        notificationsEnabled: initialNotificationsEnabled,
        photoFile: null,
        photoPreview:
            initialAvatarUrl ||
            '/images/chatHeader/userAvatar.svg',
        selectedFile: null,
        cropState: {
            crop: { x: 0, y: 0 },
            zoom: 1.2,
            croppedAreaPixels: null,
            croppedBlob: null,
            originalFile: null,
        },
    })

    const [formState, dispatch] = useReducer(
        formReducer,
        null,
        initialFormState,
    )

    // Проверка наличия изображения (не заглушка)
    const hasImage = Boolean(
        formState.photoPreview &&
        !formState.photoPreview.includes('userAvatar.svg'),
    )

    // Функция проверки наличия изменений
    const hasChanges = useCallback(() => {
        if (formState.name !== initialName) return true
        if (formState.description !== initialDescription)
            return true
        if (formState.selectedOption.value !== initialType)
            return true
        if (
            formState.notificationsEnabled !==
            initialNotificationsEnabled
        )
            return true
        if (formState.photoFile !== null) return true
        if (
            initialAvatarUrl &&
            (!formState.photoPreview ||
                formState.photoPreview.includes(
                    'userAvatar.svg',
                ))
        )
            return true
        return false
    }, [
        formState,
        initialName,
        initialDescription,
        initialType,
        initialNotificationsEnabled,
        initialAvatarUrl,
    ])

    // Восстановление исходных данных при сбросе
    const resetToInitial = useCallback(() => {
        dispatch({
            type: 'RESET_FROM_PROPS',
            payload: {
                name: initialName,
                description: initialDescription,
                selectedOption:
                    groupOptions.find(
                        (opt) => opt.value === initialType,
                    ) || groupOptions[0],
                notificationsEnabled:
                    initialNotificationsEnabled,
                photoFile: null,
                photoPreview:
                    initialAvatarUrl ||
                    '/images/chatHeader/userAvatar.svg',
                selectedFile: null,
                cropState: {
                    crop: { x: 0, y: 0 },
                    zoom: 1.2,
                    croppedAreaPixels: null,
                    croppedBlob: null,
                    originalFile: null,
                },
            },
        })
    }, [
        initialName,
        initialDescription,
        initialType,
        initialNotificationsEnabled,
        initialAvatarUrl,
    ])

    // Обработчик нажатия на кнопку "Назад" или "Отмена"
    const handleCancelAttempt = useCallback(() => {
        if (hasChanges()) {
            setIsModalOpen(true)
        } else {
            onCancel()
        }
    }, [hasChanges, onCancel])

    // Обработчик кнопки "Сбросить" в модалке
    const handleDiscard = useCallback(() => {
        resetToInitial()
        setIsModalOpen(false)
        onCancel()
    }, [resetToInitial, onCancel])

    // Обработчик кнопки "Применить" в модалке
    const handleApply = useCallback(() => {
        onSave({
            name: formState.name.trim(),
            description: formState.description.trim(),
            type: formState.selectedOption.value,
            notificationsEnabled:
                formState.notificationsEnabled,
            avatarFile: formState.photoFile,
        })
        setIsModalOpen(false)
        onCancel()
    }, [formState, onSave, onCancel])

    // Создание preview URL при изменении blob или файла
    useEffect(() => {
        let isMounted = true
        let animationFrameId: number | null = null

        if (previousPreviewRef.current) {
            URL.revokeObjectURL(previousPreviewRef.current)
        }

        let newPreview: string | null = null

        if (formState.cropState.croppedBlob) {
            newPreview = URL.createObjectURL(
                formState.cropState.croppedBlob,
            )
        } else if (formState.cropState.originalFile) {
            newPreview = URL.createObjectURL(
                formState.cropState.originalFile,
            )
        } else if (formState.photoFile) {
            newPreview = URL.createObjectURL(
                formState.photoFile,
            )
        } else {
            newPreview =
                initialAvatarUrl ||
                '/images/chatHeader/userAvatar.svg'
        }

        previousPreviewRef.current = newPreview

        animationFrameId = requestAnimationFrame(() => {
            if (isMounted) {
                dispatch({
                    type: 'SET_PHOTO_PREVIEW',
                    payload: newPreview,
                })
            }
        })

        return () => {
            isMounted = false
            if (animationFrameId)
                cancelAnimationFrame(animationFrameId)
            if (
                previousPreviewRef.current?.startsWith(
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
        formState.cropState.croppedBlob,
        formState.cropState.originalFile,
        formState.photoFile,
        initialAvatarUrl,
    ])

    // Синхронизация с пропсами (сброс при изменении initial-данных)
    useEffect(() => {
        const prev = prevInitialRef.current
        const newState: Partial<FormState> = {}

        if (initialName !== prev.name)
            newState.name = initialName
        if (initialDescription !== prev.description)
            newState.description = initialDescription
        if (initialType !== prev.type) {
            newState.selectedOption =
                groupOptions.find(
                    (opt) => opt.value === initialType,
                ) || groupOptions[0]
        }
        if (
            initialNotificationsEnabled !==
            prev.notifications
        ) {
            newState.notificationsEnabled =
                initialNotificationsEnabled
        }
        if (initialAvatarUrl !== prev.avatar) {
            newState.photoPreview =
                initialAvatarUrl ||
                '/images/chatHeader/userAvatar.svg'
            newState.photoFile = null
            newState.selectedFile = null
            newState.cropState = {
                crop: { x: 0, y: 0 },
                zoom: 1.2,
                croppedAreaPixels: null,
                croppedBlob: null,
                originalFile: null,
            }
        }

        if (Object.keys(newState).length > 0) {
            dispatch({
                type: 'RESET_FROM_PROPS',
                payload: { ...formState, ...newState },
            })
        }

        // Обновляем ref
        prevInitialRef.current = {
            name: initialName,
            description: initialDescription,
            type: initialType,
            notifications: initialNotificationsEnabled,
            avatar: initialAvatarUrl,
        }
    }, [
        initialName,
        initialDescription,
        initialType,
        initialNotificationsEnabled,
        initialAvatarUrl,
        formState,
    ])

    const handleFileSelect = useCallback(
        (file: File | null) => {
            if (file) {
                dispatch({
                    type: 'SET_CROP_STATE',
                    payload: {
                        originalFile: file,
                        croppedBlob: null,
                        croppedAreaPixels: null,
                    },
                })
                dispatch({
                    type: 'SET_SELECTED_FILE',
                    payload: file,
                })
                dispatch({
                    type: 'SET_PHOTO_FILE',
                    payload: file,
                })
            } else {
                dispatch({
                    type: 'SET_PHOTO_FILE',
                    payload: null,
                })
                dispatch({
                    type: 'SET_SELECTED_FILE',
                    payload: null,
                })
                dispatch({
                    type: 'SET_CROP_STATE',
                    payload: {
                        crop: { x: 0, y: 0 },
                        zoom: 1.2,
                        croppedAreaPixels: null,
                        croppedBlob: null,
                        originalFile: null,
                    },
                })
            }
        },
        [],
    )

    const handleImageClick = useCallback(() => {
        setIsCropperOpen(true)
    }, [])

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
                formState.selectedFile?.name ||
                'group-avatar.png'
            const fileType =
                blob.type ||
                formState.selectedFile?.type ||
                'image/png'
            const file = new File([blob], fileName, {
                type: fileType,
            })

            dispatch({
                type: 'SET_CROP_STATE',
                payload: {
                    croppedBlob: blob,
                    ...(cropParams || {}),
                },
            })

            dispatch({
                type: 'SET_PHOTO_FILE',
                payload: file,
            })
            setIsCropperOpen(false)
        },
        [formState.selectedFile],
    )

    const handleCropperFileChange = useCallback(
        (file: File) => {
            dispatch({
                type: 'SET_SELECTED_FILE',
                payload: file,
            })
            dispatch({
                type: 'SET_CROP_STATE',
                payload: {
                    originalFile: file,
                    croppedBlob: null,
                    croppedAreaPixels: null,
                },
            })
        },
        [],
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (
            !formState.name.trim() ||
            !formState.description.trim() ||
            !formState.selectedOption.value
        )
            return

        onSave({
            name: formState.name.trim(),
            description: formState.description.trim(),
            type: formState.selectedOption.value,
            notificationsEnabled:
                formState.notificationsEnabled,
            avatarFile: formState.photoFile,
        })
    }

    const handleCopyLink = useCallback(() => {
        if (inviteLink) {
            copyToClipboard(inviteLink)
        }
    }, [inviteLink, copyToClipboard])

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
                    onClick={handleCancelAttempt}
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
                    Редактировать группу
                </h2>
            </div>

            {/* Скроллируемая форма */}
            <CustomScrollbar className="flex-1">
                <div className="flex justify-center p-4">
                    <form
                        onSubmit={handleSubmit}
                        className={`
                      w-full max-w-82 space-y-4
                    `}
                    >
                        {/* Блок с выбором аватарки */}
                        <div className="flex flex-col items-center">
                            <AvatarPicker
                                src={formState.photoPreview}
                                name={
                                    formState.name ||
                                    'Группа'
                                }
                                onFile={handleFileSelect}
                                onImageClick={
                                    handleImageClick
                                }
                            />
                        </div>

                        {/* Поля ввода */}
                        <div className="w-full">
                            <div className="flex w-full flex-col">
                                <FloatingTextarea
                                    position="top"
                                    label="Название*"
                                    maxLength={100}
                                    value={formState.name}
                                    onChange={(e) =>
                                        dispatch({
                                            type: 'SET_NAME',
                                            payload:
                                                e.target
                                                    .value,
                                        })
                                    }
                                />
                                <FloatingTextarea
                                    position="bottom"
                                    label="Описание"
                                    maxLength={250}
                                    value={
                                        formState.description
                                    }
                                    onChange={(e) =>
                                        dispatch({
                                            type: 'SET_DESCRIPTION',
                                            payload:
                                                e.target
                                                    .value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        {/* Тип группы */}
                        <div>
                            <GroupTypeSelect
                                selectLabel="Тип группы"
                                value={
                                    formState.selectedOption
                                        .value
                                }
                                options={groupOptions}
                                onChange={(option) =>
                                    dispatch({
                                        type: 'SET_SELECTED_OPTION',
                                        payload: option,
                                    })
                                }
                            />
                        </div>

                        {/* Переключатель уведомлений */}
                        <div className="flex items-center justify-between">
                            <span
                                className={`
                              text-base font-medium text-text-black
                            `}
                            >
                                Уведомления
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    dispatch({
                                        type: 'SET_NOTIFICATIONS_ENABLED',
                                        payload:
                                            !formState.notificationsEnabled,
                                    })
                                }
                                aria-label={
                                    formState.notificationsEnabled
                                        ? 'Отключить уведомления'
                                        : 'Включить уведомления'
                                }
                                className={cn(
                                    `
                                      relative inline-flex h-8 w-14 items-center
                                      rounded-full transition-colors
                                      hover:cursor-pointer
                                      focus:outline-none
                                    `,
                                    formState.notificationsEnabled
                                        ? `
                                      bg-blue-500
                                    `
                                        : `bg-gray-300`,
                                )}
                            >
                                <span
                                    className={cn(
                                        `
                                          inline-block h-6 w-6 transform
                                          rounded-full bg-white
                                          transition-transform
                                        `,
                                        formState.notificationsEnabled
                                            ? `
                                          translate-x-6
                                        `
                                            : `translate-x-1`,
                                    )}
                                />
                            </button>
                        </div>

                        {/* Пригласительная ссылка */}
                        {inviteLink && (
                            <div className="rounded-md bg-white-bg p-1">
                                <div
                                    className={`
                                  flex flex-col justify-between p-0.5
                                `}
                                >
                                    <span
                                        className={`
                                      mb-1 p-0 text-xs font-medium
                                      tracking-extra-tight text-text-gray
                                    `}
                                    >
                                        Ссылка на
                                        приглашение в группу
                                    </span>
                                    <div
                                        className={`
                                      flex items-center justify-between
                                    `}
                                    >
                                        <span
                                            className={`
                                          pr-2 text-base break-all
                                          text-accent-violet-primary
                                        `}
                                        >
                                            {inviteLink}
                                        </span>
                                        <Button
                                            type="button"
                                            onClick={
                                                handleCopyLink
                                            }
                                            aria-label="Копировать ссылку"
                                            variant="ghost"
                                            size="sm"
                                            className={`
                                              flex shrink-0 items-center
                                              justify-center rounded-full p-0
                                              text-text-black
                                              hover:bg-accent-violet-ultra-light
                                            `}
                                        >
                                            <Image
                                                src="/icons/detailInfo/copyLink.svg"
                                                alt="Копировать ссылку"
                                                width={24}
                                                height={24}
                                                className={cn(
                                                    copied
                                                        ? `
                                                  opacity-50
                                                `
                                                        : `opacity-100`,
                                                )}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Кнопки */}
                        <div className="flex justify-center gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="md"
                                onClick={
                                    handleCancelAttempt
                                }
                                className="h-14 w-full max-w-40 rounded-md"
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    !formState.name.trim() ||
                                    !formState.description.trim() ||
                                    !formState
                                        .selectedOption
                                        .value
                                }
                                variant="solid"
                                size="md"
                                className={`
                                  h-14 w-full max-w-40 rounded-md
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                `}
                            >
                                Сохранить
                            </Button>
                        </div>
                    </form>
                </div>
            </CustomScrollbar>

            {/* Модалка подтверждения выхода без сохранения */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Изменения не сохранены"
                description="Вы изменили настройки группы, сохранить внесённые изменения?"
                titleAlign="left"
                buttons={[
                    {
                        label: 'Сбросить',
                        variant: 'ghost',
                        color: 'danger',
                        onClick: handleDiscard,
                    },
                    {
                        label: 'Применить',
                        variant: 'primary',
                        color: 'primary',
                        onClick: handleApply,
                    },
                ]}
            />

            {/* Модалка кадрирования */}
            <AvatarCropper
                isOpen={isCropperOpen}
                imageFile={
                    formState.selectedFile ?? undefined
                }
                onClose={handleCropperClose}
                onFileChange={handleCropperFileChange}
                onConfirm={handleCropperConfirm}
                initialCrop={formState.cropState.crop}
                initialZoom={formState.cropState.zoom}
                initialCroppedAreaPixels={
                    formState.cropState.croppedAreaPixels ||
                    undefined
                }
                minZoom={1}
                maxZoom={3}
            />
        </div>
    )
}
