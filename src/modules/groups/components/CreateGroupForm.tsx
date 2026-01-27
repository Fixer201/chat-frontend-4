// CreateGroupForm.tsx
'use client' // Указываем что это клиентский компонент Next.js

import {
    useEffect,
    useState,
    useRef,
    useCallback,
} from 'react'
import FloatingTextarea from '@shared/ui/floating/FloatingTextarea' // Компонент текстового поля с плавающим лейблом
import AvatarPicker from '@shared/ui/avatar/AvatarPicker' // Компонент выбора аватарки
import { AvatarCropper } from '@shared/ui/avatarCropper/AvatarCropper' // Компонент кадрирования
import GroupTypeSelect from '@shared/ui/select/GroupTypeSelect' // Селект для выбора типа группы
import { Button } from '@shared/ui/button/Button' // Компонент кнопки
import BackIcon from '@public/icons/settings-sidebar/Back.svg' // Иконка назад
import {
    GroupTypeOptionProps,
    onNextProps,
    CropParams, // Типы из shared типов
} from '@shared/types/createGroup'
import { Area } from 'react-easy-crop' // Тип области кадрирования

// Интерфейс для внутреннего состояния кадрирования - хранит все параметры между сессиями
interface CropState {
    crop: { x: number; y: number } // Позиция кадрирования
    zoom: number // Уровень масштабирования
    croppedAreaPixels: Area | null // Область кадрирования в пикселях
    croppedBlob: Blob | null // Кадрированное изображение как Blob
    originalFile: File | null // Оригинальный файл до кадрирования
}

interface CreateGroupFormProps {
    onBack: () => void // Колбэк для навигации назад
    onNext: (data: onNextProps) => void // Колбэк для перехода к следующему шагу
    initialData: onNextProps | null // Начальные данные для восстановления формы
}

// Опции для выбора типа группы - статические данные
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
    const isFirstRender = useRef(true) // Флаг первого рендера для контроля восстановления состояния
    const previousPreviewRef = useRef<string | null>(null) // Хранит предыдущий Blob URL для очистки памяти

    // Состояния для кадрирования
    const [isCropperOpen, setIsCropperOpen] =
        useState(false) // Открыто ли окно кадрирования
    const [selectedFile, setSelectedFile] =
        useState<File | null>(null) // Файл выбранный для кадрирования

    // Полное состояние кадрирования для сохранения - инициализируем дефолтными значениями
    const [cropState, setCropState] = useState<CropState>({
        crop: { x: 0, y: 0 },
        zoom: 1.2,
        croppedAreaPixels: null,
        croppedBlob: null,
        originalFile: null,
    })

    // Остальные состояния формы с восстановлением из initialData
    const [photoFile, setPhotoFile] = useState<File | null>(
        initialData?.photo || null, // Файл фото (кадрированный или оригинальный)
    )
    const [name, setName] = useState(
        initialData?.name || '', // Название группы
    )
    const [description, setDescription] = useState(
        initialData?.description || '', // Описание группы
    )
    const [choosenOption, setChoosenOption] =
        useState<GroupTypeOptionProps>(() => {
            // Функция инициализации выбранной опции
            const getInitialOption = () => {
                if (initialData?.type) {
                    const foundOption = groupOptions.find(
                        (option) =>
                            option.value ===
                            initialData.type, // Ищем опцию по значению
                    )
                    return (
                        foundOption || {
                            // Если не нашли - возвращаем пустую
                            value: '',
                            optionName: '',
                            optionDescription: '',
                        }
                    )
                }
                return {
                    // Если нет initialData.type - пустая опция
                    value: '',
                    optionName: '',
                    optionDescription: '',
                }
            }
            return getInitialOption()
        })

    // Состояние для preview URL - будет обновляться через useEffect
    const [photoPreview, setPhotoPreview] = useState<
        string | null
    >(null)

    // Определяем, есть ли изображение (не дефолтное) - проверяем что preview не содержит путь к дефолтной иконке
    const hasImage = Boolean(
        photoPreview &&
        !photoPreview.includes('userAvatar.svg'),
    )

    // Создание preview URL с использованием useEffect - управляет Object URL для preview
    useEffect(() => {
        let isMounted = true // Флаг монтирования для предотвращения утечек памяти
        let animationFrameId: number | null = null // ID для отмены requestAnimationFrame

        // Очищаем предыдущий preview URL чтобы избежать утечек памяти
        if (previousPreviewRef.current) {
            URL.revokeObjectURL(previousPreviewRef.current)
        }

        let newPreview: string | null = null

        // Приоритет отображения: кадрированный Blob → оригинальный файл → photoFile → дефолтное изображение
        if (cropState.croppedBlob) {
            newPreview = URL.createObjectURL(
                cropState.croppedBlob, // Создаем URL для кадрированного изображения
            )
        } else if (cropState.originalFile) {
            newPreview = URL.createObjectURL(
                cropState.originalFile, // Создаем URL для оригинального файла
            )
        } else if (photoFile) {
            newPreview = URL.createObjectURL(photoFile) // Создаем URL для photoFile
        } else {
            // Используем дефолтное изображение
            newPreview = '/images/chatHeader/userAvatar.svg'
        }

        // Сохраняем новый preview в ref для будущей очистки
        previousPreviewRef.current = newPreview

        // Откладываем обновление состояния до следующего кадра анимации для оптимизации
        animationFrameId = requestAnimationFrame(() => {
            if (isMounted) {
                setPhotoPreview(newPreview)
            }
        })

        // Очистка при размонтировании
        return () => {
            isMounted = false // Помечаем что компонент размонтирован

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId) // Отменяем отложенное обновление
            }

            // Очищаем Object URL если он был создан (начинается с 'blob:')
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
        cropState.croppedBlob, // Зависимость от кадрированного Blob
        cropState.originalFile, // Зависимость от оригинального файла
        photoFile, // Зависимость от photoFile
    ])

    // Восстановление состояния из initialData при первом рендере
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false // Снимаем флаг первого рендера

            // Используем setTimeout для асинхронного восстановления состояния (после монтирования)
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
                                croppedBlob: null, // Не храним Blob между сессиями
                                originalFile:
                                    initialData.photo, // Сохраняем оригинальный файл
                            })
                        } else {
                            // Если нет параметров кадрирования - сохраняем только файл
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
    }, [initialData]) // Только при изменении initialData

    // Обработчик выбора файла из AvatarPicker (по кнопке)
    const handleFileSelect = useCallback(
        (file: File | null) => {
            if (file) {
                // Сохраняем файл как originalFile в cropState и сбрасываем предыдущее кадрирование
                setCropState((prev) => ({
                    ...prev,
                    originalFile: file,
                    croppedBlob: null, // Сбрасываем кадрированный Blob
                    croppedAreaPixels: null, // Сбрасываем область кадрирования
                }))
                setSelectedFile(file)
                setPhotoFile(file)
                // НЕ открываем кадрирование! Только сохраняем файл
            } else {
                // Сброс аватарки - очищаем все состояния
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
        [], // Без зависимостей - стабильная функция
    )

    // Обработчик клика по изображению в AvatarPicker
    const handleImageClick = useCallback(() => {
        // Открываем кадрирование только если есть изображение
        if (hasImage) {
            // Используем originalFile для кадрирования (приоритет), иначе photoFile
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
            blob: Blob, // Кадрированное изображение как Blob
            cropParams?: {
                // Параметры кадрирования для сохранения
                crop: { x: number; y: number }
                zoom: number
                croppedAreaPixels: Area | null
            },
        ) => {
            // Конвертируем Blob в File для сохранения - сохраняем оригинальное имя или дефолтное
            const fileName =
                selectedFile?.name || 'group-avatar.png'
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
                croppedBlob: blob, // Сохраняем кадрированный Blob
                ...(cropParams || {
                    // Если переданы параметры - используем их, иначе текущие
                    crop: prev.crop,
                    zoom: prev.zoom,
                    croppedAreaPixels:
                        prev.croppedAreaPixels,
                }),
            }))

            setPhotoFile(file) // Сохраняем кадрированный файл
            setIsCropperOpen(false) // Закрываем окно кадрирования
        },
        [selectedFile], // Зависимость от выбранного файла
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

    // Обновленная функция отправки формы
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Валидация обязательных полей
        if (
            !name.trim() ||
            !description.trim() ||
            !choosenOption.value
        ) {
            return
        }

        // Создаем объект CropParams для передачи в onNext
        const cropParams: CropParams = {
            crop: cropState.crop,
            zoom: cropState.zoom,
            croppedAreaPixels: cropState.croppedAreaPixels,
        }

        // При отправке формы передаем текущий photoFile (кадрированный) и параметры кадрирования
        const dataToSend: onNextProps = {
            name: name.trim(), // Очищаем от лишних пробелов
            description: description.trim(),
            type: choosenOption.value,
            photo: photoFile, // Текущий файл (кадрированный или оригинальный)
            cropParams:
                cropState.croppedBlob || // Если есть кадрированный Blob
                cropState.originalFile // Или оригинальный файл
                    ? cropParams // Тогда передаем параметры кадрирования
                    : undefined, // Иначе не передаем
        }

        onNext(dataToSend)
    }

    // Обновление состояния формы при изменении initialData (после первого рендера)
    useEffect(() => {
        if (isFirstRender.current) {
            return // Пропускаем первый рендер
        }

        if (initialData) {
            const updateTimer = setTimeout(() => {
                setName(initialData.name || '')
                setDescription(
                    initialData.description || '',
                )

                if (
                    initialData.photo !== undefined && // Проверяем что photo явно передано
                    initialData.photo // И не null
                ) {
                    setPhotoFile(initialData.photo)
                    // Если есть photo, устанавливаем его как originalFile
                    setCropState((prev) => ({
                        ...prev,
                        originalFile:
                            initialData.photo as File,
                        ...(initialData.cropParams // Если есть параметры кадрирования
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
                    // Если photo явно null, сбрасываем все
                    setPhotoFile(null)
                    setCropState({
                        crop: { x: 0, y: 0 },
                        zoom: 1.2,
                        croppedAreaPixels: null,
                        croppedBlob: null,
                        originalFile: null,
                    })
                }

                // Восстанавливаем выбранную опцию типа группы
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
            }, 0) // setTimeout с 0 для отложенного выполнения

            return () => clearTimeout(updateTimer) // Очистка таймера при размонтировании
        } else {
            // Если initialData нет или null - сбрасываем форму к начальному состоянию
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
    }, [initialData]) // Запускается при каждом изменении initialData

    // Обработчик изменения типа группы
    const handleChangeOption = (
        option: GroupTypeOptionProps,
    ) => {
        setChoosenOption((prev) => ({ ...prev, ...option })) // Объединяем с предыдущим состоянием
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

            {/* Основное содержимое формы */}
            <div className="flex flex-1 justify-center p-4">
                <form
                    onSubmit={onSubmit}
                    className="w-full max-w-82 space-y-4"
                >
                    {/* Блок с выбором аватарки */}
                    <div className="flex flex-col items-center">
                        <AvatarPicker
                            src={photoPreview} // URL для preview
                            name={name || 'Группа'}
                            onFile={handleFileSelect} // Обработчик выбора файла
                            onImageClick={handleImageClick} // Обработчик клика по изображению
                        />
                    </div>

                    {/* Поля ввода названия и описания */}
                    <div className="w-full">
                        <div className="flex w-full flex-col">
                            <FloatingTextarea
                                position="top" // Позиция плавающего лейбла
                                label="Название*" // Обязательное поле
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

                    {/* Выбор типа группы */}
                    <div>
                        <GroupTypeSelect
                            selectLabel="Тип группы"
                            value={choosenOption.value} // Текущее значение
                            options={groupOptions} // Массив опций
                            onChange={(option) =>
                                handleChangeOption(option)
                            }
                        />
                    </div>

                    {/* Кнопка отправки формы */}
                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            disabled={
                                // Отключаем если не все обязательные поля заполнены
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
                isOpen={isCropperOpen} // Управление видимостью
                imageFile={selectedFile ?? undefined} // Файл для кадрирования
                onClose={handleCropperClose}
                onFileChange={handleCropperFileChange} // Загрузка нового файла в кадрировании
                onConfirm={handleCropperConfirm}
                initialCrop={cropState.crop} // Передаем сохраненную позицию
                initialZoom={cropState.zoom} // Передаем сохраненный зум
                initialCroppedAreaPixels={
                    cropState.croppedAreaPixels || undefined // Передаем сохраненную область
                }
                minZoom={1}
                maxZoom={3}
            />
        </div>
    )
}
