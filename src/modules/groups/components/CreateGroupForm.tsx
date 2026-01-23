// CreateGroupForm.tsx - добавим логирование фото
'use client'

import { useEffect, useMemo, useState } from 'react'
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
}

export default function CreateGroupForm({
    onBack,
    onNext,
}: CreateGroupFormProps) {
    const [photoFile, setPhotoFile] = useState<File | null>(
        null,
    )

    // Мемоизированное значение для предпросмотра аватарки
    const photoPreview = useMemo(
        () => {
            console.log('📸 Обновление photoPreview:', {
                hasPhotoFile: !!photoFile,
                photoFileName: photoFile?.name,
                photoFileSize: photoFile?.size,
            })
            return photoFile
                ? URL.createObjectURL(photoFile) // Создаем Blob URL для предпросмотра выбранного файла
                : null
        },
        [photoFile], // Пересчет только при изменении photoFile
    )

    // Эффект для очистки URL при размонтировании компонента или изменении photoPreview
    useEffect(() => {
        return () => {
            console.log('🧹 Очистка photoPreview URL')
            if (photoPreview) {
                URL.revokeObjectURL(photoPreview) // Освобождаем память, удаляя Blob URL
            }
        }
    }, [photoPreview]) // Зависимость от photoPreview - очищаем при изменении или размонтировании

    // Состояния для полей формы
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const options = [
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

    const [choosenOption, setChoosenOption] =
        useState<GroupTypeOptionProps>({
            value: '',
            optionName: '',
            optionDescription: '',
        })

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
            photo: photoFile, // Передаем File объект
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
            flex items-center justify-center rounded-full text-text-black
            transition-colors
            hover:bg-accent-violet-ultra-light
          `}
                >
                    <BackIcon className="mx-1 cursor-pointer" />
                </Button>
                <h2 className="text-lg font-medium tracking-extra-tight text-text-black">
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
                            onFile={handleFileSelect} // Передаем обработчик выбора файла
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
                            options={options}
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
