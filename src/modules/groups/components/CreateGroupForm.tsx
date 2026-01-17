// Форма создания новой группы
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

// Интерфейс пропсов компонента CreateGroupForm
interface CreateGroupFormProps {
    onBack: () => void // Обработчик возврата к предыдущему экрану
    onNext: (data: onNextProps | string) => void // Обработчик перехода к следующему шагу (с данными формы или строкой названия)
}

// Компонент формы создания новой группы
export default function CreateGroupForm({
    onBack,
    onNext,
}: CreateGroupFormProps) {
    // Состояние для файла аватарки группы
    const [photoFile, setPhotoFile] = useState<File | null>(
        null,
    )
    // Мемоизированное значение для предпросмотра аватарки
    const photoPreview = useMemo(
        () =>
            photoFile
                ? URL.createObjectURL(photoFile) // Создаем URL для предпросмотра
                : null,
        [photoFile],
    )

    // Эффект для очистки URL при размонтировании компонента
    useEffect(() => {
        return () => {
            if (photoPreview)
                URL.revokeObjectURL(photoPreview) // Освобождаем память
        }
    }, [photoPreview])

    // Состояния для полей формы
    const [name, setName] = useState('') // Название группы
    const [description, setDescription] = useState('') // Описание группы

    // Опции для выбора типа группы
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

    // Состояние для выбранного типа группы
    const [choosenOption, setChoosenOption] =
        useState<GroupTypeOptionProps>({
            value: '',
            optionName: '',
            optionDescription: '',
        })

    // Обработчик изменения типа группы
    const handleChangeOption = (
        option: GroupTypeOptionProps,
    ) => {
        setChoosenOption((prev) => ({ ...prev, ...option }))
    }

    // Обработчик отправки формы
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Валидация: все обязательные поля должны быть заполнены
        if (
            !name.trim() ||
            !description.trim() ||
            !choosenOption.value
        )
            return
        // Передаем данные родительскому компоненту
        onNext({
            name: name.trim(),
            description: description.trim(),
            type: choosenOption.value,
            photo: photoFile,
        })
    }

    return (
        <div
            className={`flex h-full flex-col rounded-md bg-gray-main`}
        >
            {/* Шапка формы с кнопкой назад и заголовком */}
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
                      hover:bg-(--color-accent-violet-ultra-light)
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
                    {/* Выбор аватарки группы */}
                    <div className="flex flex-col items-center">
                        <AvatarPicker
                            src={photoPreview}
                            name={name || 'Группа'} // Fallback название если поле пустое
                            onFile={setPhotoFile}
                        />
                    </div>

                    {/* Поля ввода названия и описания */}
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

                    {/* Выбор типа группы */}
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
