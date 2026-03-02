// EditGroupView.tsx
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

// Тип для опции группы
interface GroupTypeOptionProps {
    value: string // 'open' | 'closed'
    optionName: string // Название опции
    optionDescription: string // Описание опции
}

// Тип состояния формы
interface FormState {
    name: string // Название группы
    description: string // Описание
    selectedOption: GroupTypeOptionProps // Выбранный тип группы
    notificationsEnabled: boolean // Уведомления включены/выключены
    photoFile: File | null // Файл фото (после обработки)
    photoPreview: string | null // URL для предпросмотра
    selectedFile: File | null // Выбранный файл (до обработки)
    cropState: CropState // Состояние кадрирования
}

interface CropState {
    crop: { x: number; y: number } // Позиция кадрирования
    zoom: number // Масштаб
    croppedAreaPixels: Area | null // Область кадрирования в пикселях
    croppedBlob: Blob | null // Обрезанное изображение в виде Blob
    originalFile: File | null // Исходный файл
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

// Доступные опции для группы
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

// Интерфейс пропсов компонента
interface EditGroupViewProps {
    initialName: string // Исходное название
    initialDescription: string // Исходное описание
    initialType: string // 'open' | 'closed'
    initialAvatarUrl?: string | null // Исходный URL аватара
    initialNotificationsEnabled: boolean // Исходный статус уведомлений
    inviteLink?: string // Ссылка-приглашение
    onSave: (data: {
        name: string
        description: string
        type: string
        notificationsEnabled: boolean
        avatarFile?: File | null
    }) => void // Колбэк сохранения
    onCancel: () => void // Колбэк отмены
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
    const previousPreviewRef = useRef<string | null>(null) // Предыдущий preview URL для очистки
    const prevInitialRef = useRef({
        name: initialName,
        description: initialDescription,
        type: initialType,
        notifications: initialNotificationsEnabled,
        avatar: initialAvatarUrl,
    }) // Предыдущие исходные данные для сравнения

    const [isModalOpen, setIsModalOpen] = useState(false) // Модалка подтверждения выхода
    const [isCropperOpen, setIsCropperOpen] =
        useState(false) // Модалка кадрирования
    const [copied, copyToClipboard] =
        useCopyToClipboard(700) // Хук для копирования ссылки

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

    // Проверка наличия изменений в форме
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

    // Сброс к исходным данным
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

    // Обработчик попытки отмены (если есть изменения - показываем модалку)
    const handleCancelAttempt = useCallback(() => {
        if (hasChanges()) {
            setIsModalOpen(true)
        } else {
            onCancel()
        }
    }, [hasChanges, onCancel])

    // Обработчик сброса изменений
    const handleDiscard = useCallback(() => {
        resetToInitial()
        setIsModalOpen(false)
        onCancel()
    }, [resetToInitial, onCancel])

    // Обработчик применения изменений
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

        // Очищаем предыдущий preview URL
        if (previousPreviewRef.current) {
            URL.revokeObjectURL(previousPreviewRef.current)
        }

        let newPreview: string | null = null

        // Определяем новый preview в порядке приоритета
        if (formState.cropState.croppedBlob) {
            newPreview = URL.createObjectURL(
                formState.cropState.croppedBlob,
            ) // Обрезанное изображение
        } else if (formState.cropState.originalFile) {
            newPreview = URL.createObjectURL(
                formState.cropState.originalFile,
            ) // Исходный файл
        } else if (formState.photoFile) {
            newPreview = URL.createObjectURL(
                formState.photoFile,
            ) // Файл фото
        } else {
            newPreview =
                initialAvatarUrl ||
                '/images/chatHeader/userAvatar.svg' // Дефолтная заглушка
        }

        previousPreviewRef.current = newPreview

        // Обновляем preview в следующем кадре анимации для оптимизации
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

    // Синхронизация с пропсами при их изменении
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

        // Обновляем ref с текущими исходными данными
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

    // Обработчик выбора файла
    const handleFileSelect = useCallback(
        (file: File | null) => {
            if (file) {
                // Если файл выбран - устанавливаем его в cropState и selectedFile
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
                // Если файл сброшен - очищаем всё
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

    // Обработчик клика по изображению (открывает кадрирование)
    const handleImageClick = useCallback(() => {
        setIsCropperOpen(true)
    }, [])

    // Закрытие кадрирования
    const handleCropperClose = useCallback(() => {
        setIsCropperOpen(false)
    }, [])

    // Подтверждение кадрирования
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
            }) // Создаём файл из Blob

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
            }) // Устанавливаем новый файл
            setIsCropperOpen(false)
        },
        [formState.selectedFile],
    )

    // Обработчик изменения файла в кадрировании
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

    // Обработчик отправки формы
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Валидация обязательных полей
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

    // Копирование ссылки в буфер обмена
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
                        className={`w-full max-w-82 space-y-4`}
                    >
                        {/* Выбор аватара */}
                        <div className="flex flex-col items-center">
                            <AvatarPicker
                                src={formState.photoPreview} // URL для предпросмотра
                                name={
                                    formState.name ||
                                    'Группа'
                                }
                                onFile={handleFileSelect} // Обработчик выбора файла
                                onImageClick={
                                    handleImageClick
                                } // Обработчик клика по изображению
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
                                        ? `bg-blue-500`
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
                                            ? `translate-x-6`
                                            : `translate-x-1`,
                                    )}
                                />
                            </button>
                        </div>

                        {/* Поля ввода */}
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
                                    value={formState.name}
                                    onChange={(e) =>
                                        dispatch({
                                            type: 'SET_NAME',
                                            payload:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="rounded-none border-0"
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

                        {/* Пригласительная ссылка (если есть) */}
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
                                                        ? `opacity-50`
                                                        : `opacity-100`,
                                                )}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Кнопки действий */}
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

            {/* Модалка кадрирования аватара */}
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
