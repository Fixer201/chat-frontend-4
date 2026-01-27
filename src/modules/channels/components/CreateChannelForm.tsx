// CreateChannelForm.tsx
'use client' // Указываем что это клиентский компонент Next.js

import {
    useEffect,
    useState,
    useRef,
    useCallback,
} from 'react'
import FloatingTextarea from '@shared/ui/floating/FloatingTextarea' // Компонент текстового поля с плавающим лейблом
import AvatarPicker from '@shared/ui/avatar/AvatarPicker' // Компонент выбора аватарки
import { AvatarCropper } from '@shared/ui/avatarCropper/AvatarCropper' // Компонент кадрирования изображений
import GroupTypeSelect from '@shared/ui/select/GroupTypeSelect' // Компонент выбора типа (переиспользуется для канала)
import { Button } from '@shared/ui/button/Button' // Компонент кнопки
import BackIcon from '@public/icons/settings-sidebar/Back.svg' // Иконка для кнопки "назад"
import {
    GroupTypeOptionProps, // Тип для опций выбора типа (переиспользуется для канала)
    onNextProps, // Тип данных, передаваемых в родительский компонент
    CropParams, // Тип параметров кадрирования
} from '@shared/types/createGroup' // Типы из общей библиотеки (переиспользуются для канала)
import { Area } from 'react-easy-crop' // Тип области кадрирования из библиотеки

// Интерфейс для внутреннего состояния кадрирования - полностью идентичен CreateGroupForm
interface CropState {
    crop: { x: number; y: number } // Позиция кадрирования по осям X и Y
    zoom: number // Уровень масштабирования
    croppedAreaPixels: Area | null // Область кадрирования в пикселях
    croppedBlob: Blob | null // Кадрированное изображение в формате Blob
    originalFile: File | null // Оригинальный файл до кадрирования
}

interface CreateChannelFormProps {
    onBack: () => void // Колбэк для возврата на предыдущий шаг
    onNext: (data: onNextProps | string) => void // Колбэк для перехода дальше, может принимать как данные формы, так и строку
    initialData: onNextProps | null // Начальные данные для восстановления формы
}

// Опции для выбора типа канала - отличаются от групповых только текстом и значениями
const channelOptions = [
    {
        value: 'public', // Значение для публичного канала
        optionName: 'Публичный', // Отображаемое название
        optionDescription: `Публичный канал можно найти через поиск. Подписаться на него может любой пользователь`, // Описание
    },
    {
        value: 'private', // Значение для частного канала
        optionName: 'Частный',
        optionDescription: `В частный канал можно попасть только по приглашению или пригласительной ссылке`,
    },
]

export default function CreateChannelForm({
    onBack,
    onNext,
    initialData,
}: CreateChannelFormProps) {
    const isFirstRender = useRef(true) // Флаг для отслеживания первого рендера (чтобы не восстанавливать состояние при каждом рендере)
    const previousPreviewRef = useRef<string | null>(null) // Ref для хранения предыдущего preview URL (чтобы очищать Object URL и избегать утечек памяти)

    // Состояния для управления кадрированием
    const [isCropperOpen, setIsCropperOpen] =
        useState(false) // Открыто ли модальное окно кадрирования
    const [selectedFile, setSelectedFile] =
        useState<File | null>(null) // Файл, выбранный для кадрирования

    // Полное состояние кадрирования для сохранения между сессиями
    const [cropState, setCropState] = useState<CropState>({
        crop: { x: 0, y: 0 }, // Начальная позиция кадрирования
        zoom: 1.2, // Начальный уровень масштабирования
        croppedAreaPixels: null, // Пока нет области кадрирования
        croppedBlob: null, // Пока нет кадрированного изображения
        originalFile: null, // Пока нет оригинального файла
    })

    // Остальные состояния формы
    const [photoFile, setPhotoFile] = useState<File | null>(
        initialData?.photo || null, // Файл фотографии (кадрированный или оригинальный)
    )
    const [name, setName] = useState(
        initialData?.name || '', // Название канала
    )
    const [description, setDescription] = useState(
        initialData?.description || '', // Описание канала
    )
    const [choosenOption, setChoosenOption] =
        useState<GroupTypeOptionProps>(() => {
            // Функция инициализации выбранной опции типа канала
            const getInitialOption = () => {
                if (initialData?.type) {
                    // Если в initialData есть тип, ищем соответствующую опцию
                    const foundOption = channelOptions.find(
                        (option) =>
                            option.value ===
                            initialData.type, // Сравниваем значения
                    )
                    return (
                        foundOption || {
                            // Если нашли - возвращаем, иначе - пустую опцию
                            value: '',
                            optionName: '',
                            optionDescription: '',
                        }
                    )
                }
                return {
                    // Если в initialData нет типа - пустая опция
                    value: '',
                    optionName: '',
                    optionDescription: '',
                }
            }
            return getInitialOption() // Вызываем функцию инициализации
        })

    // Состояние для preview URL изображения
    const [photoPreview, setPhotoPreview] = useState<
        string | null
    >(null)

    // Определяем, есть ли изображение (не дефолтное)
    const hasImage = Boolean(
        photoPreview &&
        !photoPreview.includes('userAvatar.svg'), // Проверяем, что preview не содержит путь к дефолтной иконке
    )

    // Создание preview URL с использованием useEffect (управление Object URL)
    useEffect(() => {
        let isMounted = true // Флаг для отслеживания монтирования компонента
        let animationFrameId: number | null = null // ID для отмены requestAnimationFrame

        // Очищаем предыдущий preview URL для предотвращения утечек памяти
        if (previousPreviewRef.current) {
            URL.revokeObjectURL(previousPreviewRef.current) // Освобождаем память
        }

        let newPreview: string | null = null

        // Определяем приоритет отображения preview:
        if (cropState.croppedBlob) {
            // 1. Если есть кадрированное изображение (Blob)
            newPreview = URL.createObjectURL(
                cropState.croppedBlob, // Создаем Object URL из Blob
            )
        } else if (cropState.originalFile) {
            // 2. Если есть оригинальный файл (до кадрирования)
            newPreview = URL.createObjectURL(
                cropState.originalFile,
            )
        } else if (photoFile) {
            // 3. Если есть photoFile (переданный файл)
            newPreview = URL.createObjectURL(photoFile)
        } else {
            // 4. Если ничего нет - используем дефолтное изображение
            newPreview = '/images/chatHeader/userAvatar.svg'
        }

        // Сохраняем новый preview в ref для будущей очистки
        previousPreviewRef.current = newPreview

        // Откладываем обновление состояния до следующего кадра анимации (оптимизация производительности)
        animationFrameId = requestAnimationFrame(() => {
            if (isMounted) {
                setPhotoPreview(newPreview) // Обновляем состояние preview
            }
        })

        // Функция очистки при размонтировании компонента или изменении зависимостей
        return () => {
            isMounted = false // Помечаем компонент как размонтированный

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId) // Отменяем запланированное обновление
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
        cropState.croppedBlob, // При изменении кадрированного Blob
        cropState.originalFile, // При изменении оригинального файла
        photoFile, // При изменении photoFile
    ])

    // Восстановление состояния формы из initialData при первом рендере
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false // Снимаем флаг первого рендера

            // Используем setTimeout для асинхронного восстановления состояния (после полного монтирования)
            setTimeout(() => {
                if (initialData) {
                    setName(initialData.name || '')
                    setDescription(
                        initialData.description || '',
                    )

                    // Восстанавливаем состояние кадрирования если есть фото и параметры
                    if (initialData.photo) {
                        setPhotoFile(initialData.photo)

                        // Восстанавливаем cropState если есть параметры кадрирования
                        if (initialData.cropParams) {
                            setCropState({
                                crop: initialData.cropParams
                                    .crop || { x: 0, y: 0 }, // Позиция кадрирования
                                zoom:
                                    initialData.cropParams
                                        .zoom || 1.2, // Уровень масштабирования
                                croppedAreaPixels:
                                    initialData.cropParams
                                        .croppedAreaPixels ||
                                    null, // Область кадрирования
                                croppedBlob: null, // Blob не хранится между сессиями
                                originalFile:
                                    initialData.photo, // Сохраняем оригинальный файл
                            })
                        } else {
                            // Если нет параметров кадрирования, сохраняем только файл
                            setCropState((prev) => ({
                                ...prev,
                                originalFile:
                                    initialData.photo,
                            }))
                        }
                    }

                    // Восстанавливаем выбранную опцию типа канала
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
            }, 0) // Нулевая задержка - выполнится в следующем цикле событий
        }
    }, [initialData]) // Зависимость от initialData

    // Обработчик выбора файла из AvatarPicker (при клике на кнопку "Выбрать фотографию")
    const handleFileSelect = useCallback(
        (file: File | null) => {
            if (file) {
                // Если файл выбран (не null)
                // Сохраняем файл как originalFile в cropState и сбрасываем предыдущее кадрирование
                setCropState((prev) => ({
                    ...prev,
                    originalFile: file, // Сохраняем оригинальный файл
                    croppedBlob: null, // Сбрасываем кадрированный Blob
                    croppedAreaPixels: null, // Сбрасываем область кадрирования
                }))
                setSelectedFile(file) // Сохраняем для передачи в кадрировщик
                setPhotoFile(file) // Сохраняем как текущий файл фото
                // НЕ открываем кадрирование! Только сохраняем файл (пользователь может кадрировать позже)
            } else {
                // Если file = null (сброс аватарки)
                // Сбрасываем все состояния, связанные с изображением
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
        [], // Пустой массив зависимостей - функция не пересоздается
    )

    // Обработчик клика по изображению в AvatarPicker (открывает кадрирование)
    const handleImageClick = useCallback(() => {
        // Открываем кадрирование только если есть изображение
        if (hasImage) {
            // Используем originalFile для кадрирования (если есть), иначе photoFile
            if (cropState.originalFile) {
                setSelectedFile(cropState.originalFile)
            } else if (photoFile) {
                setSelectedFile(photoFile)
            }
            setIsCropperOpen(true) // Открываем модальное окно кадрирования
        }
    }, [hasImage, cropState.originalFile, photoFile])

    // Обработчик закрытия окна кадрирования
    const handleCropperClose = useCallback(() => {
        setIsCropperOpen(false)
    }, [])

    // Обработчик подтверждения кадрирования (получает результат из AvatarCropper)
    const handleCropperConfirm = useCallback(
        (
            blob: Blob, // Кадрированное изображение в формате Blob
            cropParams?: {
                // Параметры кадрирования (опционально)
                crop: { x: number; y: number }
                zoom: number
                croppedAreaPixels: Area | null
            },
        ) => {
            // Конвертируем Blob в File для сохранения
            const fileName =
                selectedFile?.name || 'channel-avatar.png' // Сохраняем оригинальное имя или дефолтное
            const fileType =
                blob.type ||
                selectedFile?.type ||
                'image/png' // Определяем тип файла
            const file = new File([blob], fileName, {
                type: fileType,
            })

            // Сохраняем полное состояние кадрирования
            setCropState((prev) => ({
                ...prev,
                croppedBlob: blob, // Сохраняем кадрированный Blob
                ...(cropParams || {
                    // Если переданы параметры - используем их, иначе оставляем текущие
                    crop: prev.crop,
                    zoom: prev.zoom,
                    croppedAreaPixels:
                        prev.croppedAreaPixels,
                }),
            }))

            setPhotoFile(file) // Сохраняем кадрированный файл как текущее фото
            setIsCropperOpen(false) // Закрываем окно кадрирования
        },
        [selectedFile], // Зависимость от selectedFile
    )

    // Обработчик изменения файла внутри кадрировщика (загрузка нового файла)
    const handleCropperFileChange = useCallback(
        (file: File) => {
            setSelectedFile(file)
            // Сохраняем как originalFile и сбрасываем предыдущее кадрирование
            setCropState((prev) => ({
                ...prev,
                originalFile: file, // Обновляем оригинальный файл
                croppedBlob: null, // Сбрасываем кадрированный Blob
                croppedAreaPixels: null, // Сбрасываем область кадрирования
            }))
        },
        [],
    )

    // Обработчик отправки формы
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault() // Предотвращаем стандартное поведение формы

        // Валидация обязательных полей
        if (
            !name.trim() || // Название не должно быть пустым или состоять из пробелов
            !description.trim() || // Описание обязательно
            !choosenOption.value // Должен быть выбран тип канала
        )
            return // Если какое-то поле не заполнено - не отправляем форму

        // Создаем объект CropParams для передачи вместе с данными формы
        const cropParams: CropParams = {
            crop: cropState.crop,
            zoom: cropState.zoom,
            croppedAreaPixels: cropState.croppedAreaPixels,
        }

        // Передача данных в родительский компонент через колбэк onNext
        onNext({
            name: name.trim(), // Очищаем пробелы в начале и конце
            description: description.trim(),
            type: choosenOption.value, // Значение выбранной опции
            photo: photoFile, // Файл фотографии (может быть null)
            cropParams:
                cropState.croppedBlob || // Если есть кадрированный Blob
                cropState.originalFile // Или оригинальный файл
                    ? cropParams // Тогда передаем параметры кадрирования
                    : undefined, // Иначе не передаем
        })
    }

    // Обновление состояния формы при изменении initialData (после первого рендера)
    useEffect(() => {
        if (isFirstRender.current) {
            return // Пропускаем первый рендер (для него уже есть отдельный useEffect)
        }

        if (initialData) {
            // Если есть initialData - обновляем форму в соответствии с ним
            const updateTimer = setTimeout(() => {
                setName(initialData.name || '')
                setDescription(
                    initialData.description || '',
                )

                if (
                    initialData.photo !== undefined && // Проверяем что photo не undefined
                    initialData.photo // И не null
                ) {
                    setPhotoFile(initialData.photo)
                    // Если есть photo, устанавливаем его как originalFile
                    setCropState((prev) => ({
                        ...prev,
                        originalFile:
                            initialData.photo as File, // Приводим к типу File
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
                            : {}), // Иначе оставляем предыдущие значения
                    }))
                } else if (initialData.photo === null) {
                    // Если photo явно null, сбрасываем все состояния изображения
                    setPhotoFile(null)
                    setCropState({
                        crop: { x: 0, y: 0 },
                        zoom: 1.2,
                        croppedAreaPixels: null,
                        croppedBlob: null,
                        originalFile: null,
                    })
                }

                // Обновляем выбранную опцию типа канала
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

    // Обработчик изменения типа канала (при выборе опции в GroupTypeSelect)
    const handleChangeOption = (
        option: GroupTypeOptionProps,
    ) => {
        setChoosenOption((prev) => ({ ...prev, ...option })) // Объединяем с предыдущим состоянием
    }

    return (
        <div className="flex h-full flex-col rounded-md bg-gray-main">
            {/* Заголовок формы с кнопкой "назад" */}
            <div
                className={`
                  flex items-center justify-start gap-3 rounded-t-md border-b
                  border-app-divider bg-gray-main px-6 py-4
                `}
            >
                <Button
                    onClick={onBack}
                    aria-label="Назад"
                    variant="ghost" // Прозрачный стиль кнопки
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
                    Создать канал{' '}
                    {/* Отличается от CreateGroupForm */}
                </h2>
            </div>

            {/* Основное содержимое формы */}
            <div className="flex flex-1 justify-center p-4">
                <form
                    onSubmit={onSubmit}
                    className="w-full max-w-82 space-y-4"
                >
                    {/* Блок с выбором аватарки канала */}
                    <div className="flex flex-col items-center">
                        <AvatarPicker
                            src={photoPreview} // URL для отображения preview
                            name={name || 'Канал'} // Имя для alt текста
                            onFile={handleFileSelect} // Обработчик выбора файла
                            onImageClick={handleImageClick} // Обработчик клика по изображению (открывает кадрирование)
                        />
                    </div>

                    {/* Поля ввода названия и описания канала */}
                    <div className="w-full">
                        <div className="flex w-full flex-col">
                            <FloatingTextarea
                                position="top" // Плавающий лейбл сверху
                                label="Название*" // Обязательное поле
                                maxLength={100} // Максимальная длина
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
                                position="bottom" // Плавающий лейбл снизу
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

                    {/* Выбор типа канала */}
                    <div>
                        <GroupTypeSelect
                            selectLabel="Тип канала" // Отличается от группы
                            value={choosenOption.value} // Текущее значение
                            options={channelOptions} // Опции для канала
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
                                // Отключаем кнопку если не все обязательные поля заполнены
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
                imageFile={selectedFile ?? undefined} // Файл для кадрирования (undefined если null)
                onClose={handleCropperClose}
                onFileChange={handleCropperFileChange} // Обработчик загрузки нового файла в кадрировщике
                onConfirm={handleCropperConfirm}
                initialCrop={cropState.crop} // Начальная позиция кадрирования (для восстановления)
                initialZoom={cropState.zoom} // Начальный зум
                initialCroppedAreaPixels={
                    cropState.croppedAreaPixels || undefined // Начальная область кадрирования
                }
                minZoom={1}
                maxZoom={3}
            />
        </div>
    )
}
