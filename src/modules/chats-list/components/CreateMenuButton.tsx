// Кнопка для создания нового чата (группы или канала) с выпадающим меню
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import {
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import Image from 'next/image'
import Dropdown from '@shared/ui/dropdown/Dropdown'

// Интерфейс пропсов компонента CreateMenuButton
interface CreateMenuButtonProps {
    onSelectGroup?: () => void // Обработчик выбора "Создать группу"
    onSelectChannel?: () => void // Обработчик выбора "Создать канал"
    className?: string // Дополнительные CSS классы для кастомизации
}

// Компонент кнопки с выпадающим меню для создания группы или канала
// Использует Dropdown compound компонент для реализации выпадающего меню
export default function CreateMenuButton({
    onSelectGroup,
    onSelectChannel,
    className = '',
}: CreateMenuButtonProps) {
    // Позиция меню относительно кнопки
    // useState используется потому что позиция меняется и должна вызывать ререндер Dropdown.Content
    const [createMenuPosition, setCreateMenuPosition] =
        useState({ top: 0, left: 0 })
    // Реф на кнопку для получения ее размеров и позиции на экране
    // useRef используется для доступа к DOM элементу без вызова ререндера
    const buttonRef = useRef<HTMLButtonElement>(null)
    // Ширина меню (берется из CSS переменной)
    // Начальное значение 180px как fallback если CSS переменная не загрузится
    const [menuWidth, setMenuWidth] = useState(180)

    // Получаем ширину меню при монтировании компонента из CSS переменной
    // useLayoutEffect выполняется синхронно после всех DOM мутаций, но перед paint
    // Это важно для измерения layout-dependent значений (ширины, высоты)
    useLayoutEffect(() => {
        if (typeof window === 'undefined') return // Проверка на серверный рендеринг

        const updateWidth = () => {
            // Читаем CSS переменную из :root (document.documentElement)
            const menuWidthStr = window
                .getComputedStyle(document.documentElement)
                .getPropertyValue('--create-menu-width')
            // Парсим значение (убираем 'px' если есть) или используем fallback 200
            const width = parseInt(menuWidthStr, 10) || 200
            setMenuWidth(width)
        }

        // Откладываем обновление до следующего кадра анимации
        // Это гарантирует, что DOM уже полностью отрендерен и CSS переменные применены
        requestAnimationFrame(updateWidth)
    }, []) // Пустой массив зависимостей - эффект выполняется только при монтировании

    // Обработчик открытия меню создания
    // useCallback мемоизирует функцию, предотвращая создание новой при каждом рендере
    // [menuWidth] в зависимостях - функция изменится только если изменится menuWidth
    const handleCreateMenu = useCallback(
        (e: React.MouseEvent) => {
            if (!buttonRef.current) return // Защита от null ref

            // Получаем размеры и позицию кнопки относительно viewport
            const buttonRect =
                buttonRef.current.getBoundingClientRect()

            // Позиционируем меню справа от кнопки
            // buttonRect.right - menuWidth: выравниваем правый край меню с правым краем кнопки
            // buttonRect.bottom + 4: размещаем меню на 4px ниже кнопки
            setCreateMenuPosition({
                left: buttonRect.right - menuWidth,
                top: buttonRect.bottom + 4,
            })
        },
        [menuWidth], // Зависимость от menuWidth - если ширина изменится, нужно пересчитать позицию
    )

    return (
        <Dropdown>
            <Dropdown.Trigger>
                {/* Кнопка для открытия меню создания */}
                <button
                    ref={buttonRef} // Сохраняем ссылку на DOM элемент кнопки
                    type="button"
                    className={`
                      shrink-0 rounded-lg p-2 transition-colors
                      hover:bg-gray-200
                      ${className}
                    `}
                    aria-label="Создать" // Для accessibility и скринридеров
                    onClick={handleCreateMenu} // Открывает меню при клике
                >
                    {/* Иконка создания */}
                    <Image
                        src="/icons/createCollab.svg"
                        alt="Создать"
                        width={20}
                        height={20}
                    />
                </button>
            </Dropdown.Trigger>
            {/* Выпадающее меню с опциями создания */}
            <Dropdown.Content
                width="auto" // Ширина будет рассчитываться автоматически
                minWidth={menuWidth} // Используем вычисленную ширину как минимальную
                maxWidth={menuWidth} // И максимальную - фиксированная ширина меню
                manualPosition={createMenuPosition} // Ручная установка позиции
            >
                {/* Пункт меню для создания группы */}
                <Dropdown.Item
                    label="Создать группу" // Текстовая метка
                    onSelect={onSelectGroup} // Обработчик выбора
                    rightIcon={
                        // Иконка справа от текста
                        <Image
                            src="/icons/chatList/createGroup.svg"
                            alt="Создать группу"
                            width={16}
                            height={16}
                            className="opacity-80" // Легкая прозрачность для визуальной иерархии
                        />
                    }
                />
                {/* Пункт меню для создания канала */}
                <Dropdown.Item
                    label="Создать канал"
                    onSelect={onSelectChannel}
                    rightIcon={
                        <Image
                            src="/icons/chatList/createChannel.svg"
                            alt="Создать канал"
                            width={16}
                            height={16}
                            className="opacity-80"
                        />
                    }
                />
            </Dropdown.Content>
        </Dropdown>
    )
}
