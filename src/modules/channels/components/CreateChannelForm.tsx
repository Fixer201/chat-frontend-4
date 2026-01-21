// Форма создания нового канала (похожа на форму создания группы)
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

// Интерфейс пропсов компонента CreateChannelForm
interface CreateChannelFormProps {
    onBack: () => void // Обработчик возврата к предыдущему экрану
    onNext: (data: onNextProps | string) => void // Обработчик перехода к следующему шагу
}

// Компонент формы создания нового канала (структурно идентичен CreateGroupForm)
// Дублирование кода оправдано тем, что в будущем формы могут развиваться по-разному
export default function CreateChannelForm({
    onBack,
    onNext,
}: CreateChannelFormProps) {
    // Состояние для файла аватарки канала
    const [photoFile, setPhotoFile] = useState<File | null>(
        null,
    )

    // Мемоизированное значение для предпросмотра аватарки
    const photoPreview = useMemo(
        () =>
            photoFile
                ? URL.createObjectURL(photoFile) // Создаем Blob URL для отображения выбранного файла
                : null,
        [photoFile], // Пересчет только при изменении photoFile
    )

    // Эффект для очистки URL при размонтировании
    // Важно для предотвращения утечек памяти в браузере
    useEffect(() => {
        return () => {
            if (photoPreview)
                URL.revokeObjectURL(photoPreview) // Освобождаем память от Blob URL
        }
    }, [photoPreview]) // Зависимость от photoPreview

    // Состояния для полей формы
    const [name, setName] = useState('') // Название канала
    const [description, setDescription] = useState('') // Описание канала

    // Опции для выбора типа канала (отличаются от групповых)
    // Значения 'public' и 'private' соответствуют бэкенд-логике
    const options = [
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

    // Состояние для выбранного типа канала
    const [choosenOption, setChoosenOption] =
        useState<GroupTypeOptionProps>({
            value: '',
            optionName: '',
            optionDescription: '',
        })

    // Обработчик изменения типа канала
    const handleChangeOption = (
        option: GroupTypeOptionProps,
    ) => {
        setChoosenOption((prev) => ({ ...prev, ...option })) // Мерджим новое значение с текущим состоянием
    }

    // Обработчик отправки формы
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault() // Предотвращаем перезагрузку страницы

        // Валидация обязательных полей
        // Проверяем, что все поля заполнены (после удаления пробелов)
        if (
            !name.trim() ||
            !description.trim() ||
            !choosenOption.value
        )
            return // Если какое-то поле пустое - не продолжаем

        // Передаем данные родительскому компоненту
        onNext({
            name: name.trim(), // Убираем лишние пробелы
            description: description.trim(),
            type: choosenOption.value,
            photo: photoFile, // Может быть null
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

            {/* Основное содержимое формы */}
            <div className="flex flex-1 justify-center p-4">
                <form
                    onSubmit={onSubmit}
                    className="w-full max-w-82 space-y-4"
                >
                    {/* Выбор аватарки канала */}
                    <div className="flex flex-col items-center">
                        <AvatarPicker
                            src={photoPreview} // Blob URL или null
                            name={name || 'Канал'} // Fallback название (опечатка, должно быть 'Канал')
                            onFile={setPhotoFile} // Колбэк для обновления состояния файла
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

                    {/* Выбор типа канала */}
                    <div>
                        <GroupTypeSelect
                            selectLabel="Тип канала" // Отличается от "Тип группы"
                            value={choosenOption.value}
                            options={options} // Другие опции для каналов
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
