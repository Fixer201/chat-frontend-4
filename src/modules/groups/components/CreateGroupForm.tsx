'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import FloatingTextarea from '@shared/ui/floating/FloatingTextarea'
import AvatarPicker from '@shared/ui/avatar/AvatarPicker'
import GroupTypeSelect from '@shared/ui/select/GroupTypeSelect'
import { Button } from '@shared/ui/button/Button'
import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import {
    GroupTypeOptionProps,
    onNextProps,
} from '@shared/types/createGroup'

interface CreateGroupFormProps {
    onBack: () => void
    onNext: (data: onNextProps | string) => void
    initialData: onNextProps | null
}

// Вынесем options за пределы компонента, чтобы избежать пересоздания
const groupOptions = [
    {
        value: 'open',
        optionName: 'Открытая',
        optionDescription: `Открытую группу можно найти
                      через поиск. Присоединиться
                      к ней может любой
                      пользователь`,
    },
    {
        value: 'closed',
        optionName: 'Закрытая',
        optionDescription: `В закрытую группу можно
                      попасть только
                      по приглашению
                      или пригласительной ссылке`,
    },
]

export default function CreateGroupForm({
    onBack,
    onNext,
    initialData,
}: CreateGroupFormProps) {
    // Используем useRef для отслеживания первого рендера
    const isFirstRender = useRef(true)

    // Находим начальное значение типа из initialData
    const getInitialOption = () => {
        if (initialData?.type) {
            const foundOption = groupOptions.find(
                (option) =>
                    option.value === initialData.type,
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

    // Инициализируем состояния значениями из initialData
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
        useState<GroupTypeOptionProps>(getInitialOption())

    // Мемоизированное значение для предпросмотра аватарки
    const photoPreview = useMemo(() => {
        console.log('📸 Обновление photoPreview:', {
            hasPhotoFile: !!photoFile,
            photoFileName: photoFile?.name,
            photoFileSize: photoFile?.size,
        })
        return photoFile
            ? URL.createObjectURL(photoFile)
            : null
    }, [photoFile])

    // Эффект для очистки URL при размонтировании
    useEffect(() => {
        return () => {
            console.log('🧹 Очистка photoPreview URL')
            if (photoPreview) {
                URL.revokeObjectURL(photoPreview)
            }
        }
    }, [photoPreview])

    // Эффект для обновления состояния при изменении initialData (кроме первого рендера)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        console.log(
            '🔄 Обновление формы из initialData:',
            initialData,
        )
        if (initialData) {
            // Используем setTimeout для асинхронного обновления состояния
            const updateTimer = setTimeout(() => {
                setName(initialData.name || '')
                setDescription(
                    initialData.description || '',
                )

                // ВАЖНО: не перезаписываем photoFile, если он уже есть и initialData.photo = null
                if (initialData.photo !== undefined) {
                    setPhotoFile(initialData.photo)
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
            // Если initialData null, сбрасываем форму
            const resetTimer = setTimeout(() => {
                setName('')
                setDescription('')
                setPhotoFile(null)
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

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (
            !name.trim() ||
            !description.trim() ||
            !choosenOption.value
        )
            return

        console.log('📤 Отправка данных группы:', {
            name: name.trim(),
            description: description.trim(),
            type: choosenOption.value,
            photoFile: photoFile,
            photoPreview: photoPreview,
            photoFileName: photoFile?.name,
        })

        onNext({
            name: name.trim(),
            description: description.trim(),
            type: choosenOption.value,
            photo: photoFile,
        })
    }

    const handleFileSelect = (file: File | null) => {
        console.log('🖼️ Файл выбран:', {
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type,
        })
        setPhotoFile(file)
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
                    Создать группу
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
                            name={name || 'Группа'}
                            onFile={handleFileSelect}
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
                            selectLabel="Тип группы"
                            value={choosenOption.value}
                            options={groupOptions}
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
        </div>
    )
}
