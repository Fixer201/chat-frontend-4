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

interface CreateChannelFormProps {
    onBack: () => void
    onNext: (data: onNextProps | string) => void
    initialData: onNextProps | null
}

// Вынесем options за пределы компонента
const channelOptions = [
    {
        value: 'public',
        optionName: 'Публичный',
        optionDescription: `Публичный канал можно найти через поиск. Подписаться на него может любой пользователь`,
    },
    {
        value: 'private',
        optionName: 'Частный',
        optionDescription: `В частный канал можно попасть только по приглашению или пригласительной ссылке`,
    },
]

export default function CreateChannelForm({
    onBack,
    onNext,
    initialData,
}: CreateChannelFormProps) {
    const isFirstRender = useRef(true)

    const getInitialOption = () => {
        if (initialData?.type) {
            const foundOption = channelOptions.find(
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

    const [photoFile, setPhotoFile] = useState<File | null>(
        initialData?.photo || null,
    )

    const photoPreview = useMemo(
        () =>
            photoFile
                ? URL.createObjectURL(photoFile)
                : null,
        [photoFile],
    )

    useEffect(() => {
        return () => {
            if (photoPreview)
                URL.revokeObjectURL(photoPreview)
        }
    }, [photoPreview])

    const [name, setName] = useState(
        initialData?.name || '',
    )
    const [description, setDescription] = useState(
        initialData?.description || '',
    )
    const [choosenOption, setChoosenOption] =
        useState<GroupTypeOptionProps>(getInitialOption())

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        console.log(
            '🔄 Обновление формы канала из initialData:',
            initialData,
        )
        if (initialData) {
            const updateTimer = setTimeout(() => {
                setName(initialData.name || '')
                setDescription(
                    initialData.description || '',
                )

                if (initialData.photo !== undefined) {
                    setPhotoFile(initialData.photo)
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

        onNext({
            name: name.trim(),
            description: description.trim(),
            type: choosenOption.value,
            photo: photoFile,
        })
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
                            onFile={setPhotoFile}
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
        </div>
    )
}
