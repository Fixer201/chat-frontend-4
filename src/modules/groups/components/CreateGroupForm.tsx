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
    onBack: () => void // Обработчик возврата к предыдущему экрану - вызывается при клике на кнопку "Назад"
    onNext: (data: onNextProps | string) => void // Обработчик перехода к следующему шагу (с данными формы или строкой названия)
    // Поддерживает два формата данных для обратной совместимости со старым кодом
}

// Компонент формы создания новой группы
export default function CreateGroupForm({
    onBack,
    onNext,
}: CreateGroupFormProps) {
    // Состояние для файла аватарки группы
    // Используем useState с типом File | null, так как аватар может отсутствовать
    const [photoFile, setPhotoFile] = useState<File | null>(
        null,
    )

    // Мемоизированное значение для предпросмотра аватарки
    // useMemo используется для оптимизации - URL.createObjectURL создается только при изменении photoFile
    const photoPreview = useMemo(
        () =>
            photoFile
                ? URL.createObjectURL(photoFile) // Создаем Blob URL для предпросмотра выбранного файла
                : null, // Если файла нет - возвращаем null
        [photoFile], // Пересчет только при изменении photoFile
    )

    // Эффект для очистки URL при размонтировании компонента или изменении photoPreview
    // URL.createObjectURL создает URL, который занимает память в браузере
    useEffect(() => {
        return () => {
            if (photoPreview)
                URL.revokeObjectURL(photoPreview) // Освобождаем память, удаляя Blob URL
        }
    }, [photoPreview]) // Зависимость от photoPreview - очищаем при изменении или размонтировании

    // Состояния для полей формы
    const [name, setName] = useState('') // Название группы - инициализируем пустой строкой
    const [description, setDescription] = useState('') // Описание группы

    // Опции для выбора типа группы
    // Массив объектов с фиксированными значениями - не изменяется между рендерами
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
    // Инициализируем пустым объектом с полями-заглушками
    const [choosenOption, setChoosenOption] =
        useState<GroupTypeOptionProps>({
            value: '',
            optionName: '',
            optionDescription: '',
        })

    // Обработчик изменения типа группы
    // Принимает частичный объект option и объединяет его с текущим состоянием
    const handleChangeOption = (
        option: GroupTypeOptionProps,
    ) => {
        setChoosenOption((prev) => ({ ...prev, ...option })) // Мерджим предыдущее состояние с новыми значениями
    }

    // Обработчик отправки формы
    // Вызывается при submit формы (клик на кнопку или Enter в поле ввода)
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault() // Предотвращаем стандартное поведение формы (перезагрузку страницы)

        // Валидация: все обязательные поля должны быть заполнены
        // trim() удаляет пробелы в начале и конце строки
        if (
            !name.trim() ||
            !description.trim() ||
            !choosenOption.value
        )
            return // Если какое-то поле пустое - прерываем выполнение

        // Передаем данные родительскому компоненту
        // Собираем все данные формы в объект onNextProps
        onNext({
            name: name.trim(), // Убираем лишние пробелы
            description: description.trim(),
            type: choosenOption.value,
            photo: photoFile, // Может быть null если пользователь не выбрал фото
        })
    }

    return (
        <div
            className={`flex h-full flex-col rounded-md bg-gray-main`}
        >
            {/* Шапка формы с кнопкой назад и заголовком */}
            {/* Используем flex для горизонтального выравнивания элементов */}
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
                    {/* SVG иконка импортированная как React компонент */}
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
            {/* flex-1 позволяет форме занимать все доступное пространство */}
            <div className="flex flex-1 justify-center p-4">
                <form
                    onSubmit={onSubmit}
                    className="w-full max-w-82 space-y-4"
                >
                    {/* Выбор аватарки группы */}
                    <div className="flex flex-col items-center">
                        <AvatarPicker
                            src={photoPreview} // Blob URL для предпросмотра
                            name={name || 'Группа'} // Fallback название если поле пустое
                            onFile={setPhotoFile} // Колбэк для обновления photoFile
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
                            type="submit" // type="submit" активирует отправку формы при клике
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
