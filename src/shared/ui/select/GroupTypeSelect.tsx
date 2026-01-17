// Компонент выбора типа группы/канала с радиокнопками
import { GroupTypeOptionProps } from '@shared/types/createGroup'
import { useState } from 'react'

// Пропсы компонента GroupTypeSelect
export interface GroupTypeSelectProps {
    selectLabel?: string // Заголовок/лейбл для селектора
    value?: string // Текущее выбранное значение
    options: GroupTypeOptionProps[] // Массив опций для выбора
    onChange?: (option: GroupTypeOptionProps) => void // Обработчик изменения выбора
    placeholder?: string // Текст-плейсхолдер при отсутствии выбора
}

// Компонент выбора типа группы/канала с кастомным dropdown
const GroupTypeSelect: React.FC<GroupTypeSelectProps> = ({
    selectLabel,
    options,
    value = '',
    onChange,
    placeholder = 'Выберите тип',
}) => {
    const [open, setOpen] = useState(false) // Состояние открытия/закрытия dropdown

    // Находим выбранную опцию по значению
    const selectedOption = options?.find(
        (option) => option.value === value,
    )

    return (
        <div className="w-full">
            {/* Заголовок селектора */}
            <div className="mb-1 text-sm font-medium text-text-gray">
                {selectLabel}
            </div>

            {/* Кнопка для открытия/закрытия dropdown */}
            <button
                type="button"
                aria-expanded={open} // Атрибут доступности для скринридеров
                onClick={() => setOpen((s) => !s)} // Инвертируем состояние открытия
                className={`
                  flex h-14 w-full items-center justify-between rounded-md
                  bg-white-bg px-3 py-0 text-left
                `}
            >
                {/* Отображаем выбранное значение или плейсхолдер */}
                <div className="text-base text-text-gray">
                    {value
                        ? selectedOption?.optionName
                        : placeholder}
                </div>

                {/* Иконка стрелки вниз/вверх (индикатор открытия) */}
                <div className="flex items-center">
                    <svg
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1 1L6 6L11 1"
                            stroke="rgba(116,116,116,1)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </button>

            {/* Dropdown с опциями выбора (показывается при open === true) */}
            {open && options?.length > 0 && (
                <div
                    className={`
                      mt-2 flex w-full flex-col gap-3 rounded-md bg-white p-4
                    `}
                >
                    {/* Маппинг опций в кнопки выбора */}
                    {options?.map((option) => (
                        <button
                            key={option.value} // Уникальный ключ для React
                            type="button"
                            onClick={() => {
                                onChange?.(option) // Вызываем обработчик с выбранной опцией
                                setOpen(false) // Закрываем dropdown после выбора
                            }}
                            className={`
                              flex h-19 w-full items-center gap-3 rounded-md
                              px-4 text-left transition
                              hover:bg-gray-light
                            `}
                        >
                            {/* Радиокнопка (кастомная) */}
                            <div
                                className={`
                                  mr-2 flex h-5 w-5 items-center justify-center
                                `}
                            >
                                {/* Если опция выбрана - показываем заполненную радиокнопку */}
                                {value === option.value ? (
                                    <div
                                        className={`
                                          flex h-5 w-5 items-center
                                          justify-center rounded-full border
                                          border-system-blue bg-white-bg
                                        `}
                                    >
                                        <div
                                            className={`
                                              h-3 w-3 rounded-full
                                              bg-system-blue
                                            `}
                                        />
                                    </div>
                                ) : (
                                    /* Если опция не выбрана - показываем пустую радиокнопку */
                                    <div
                                        className={`
                                          h-5 w-5 rounded-full border
                                          border-text-gray bg-white-bg
                                        `}
                                    />
                                )}
                            </div>

                            {/* Текстовое содержимое опции */}
                            <div className="flex-1">
                                {/* Название опции */}
                                <div
                                    className={`
                                      text-base leading-3 text-text-black
                                    `}
                                >
                                    {option.optionName}
                                </div>

                                {/* Описание опции (меньшим шрифтом, серым цветом) */}
                                <div
                                    className={`mt-1 text-sm text-text-gray`}
                                >
                                    {
                                        option.optionDescription
                                    }
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default GroupTypeSelect
