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
    className?: string // Дополнительные CSS классы
}

// Компонент кнопки с выпадающим меню для создания группы или канала
export default function CreateMenuButton({
    onSelectGroup,
    onSelectChannel,
    className = '',
}: CreateMenuButtonProps) {
    // Позиция меню относительно кнопки
    const [createMenuPosition, setCreateMenuPosition] =
        useState({ top: 0, left: 0 })
    // Реф на кнопку для получения ее размеров
    const buttonRef = useRef<HTMLButtonElement>(null)
    // Ширина меню (берется из CSS переменной)
    const [menuWidth, setMenuWidth] = useState(180) // Увеличено до 180

    // Получаем ширину меню при монтировании компонента из CSS переменной
    // Получаем ширину меню при монтировании компонента
    useLayoutEffect(() => {
        if (typeof window === 'undefined') return

        const updateWidth = () => {
            const menuWidthStr = window
                .getComputedStyle(document.documentElement)
                .getPropertyValue('--create-menu-width')
            const width = parseInt(menuWidthStr, 10) || 200
            setMenuWidth(width)
        }

        // Откладываем обновление до следующего кадра анимации
        requestAnimationFrame(updateWidth)
    }, [])

    // Обработчик открытия меню создания
    const handleCreateMenu = useCallback(
        (e: React.MouseEvent) => {
            if (!buttonRef.current) return

            const buttonRect =
                buttonRef.current.getBoundingClientRect()

            // Позиционируем меню справа от кнопки
            setCreateMenuPosition({
                left: buttonRect.right - menuWidth,
                top: buttonRect.bottom + 4, // Немного ниже кнопки
            })
        },
        [menuWidth],
    )

    return (
        <Dropdown>
            <Dropdown.Trigger>
                {/* Кнопка для открытия меню создания */}
                <button
                    ref={buttonRef}
                    type="button"
                    className={`
                      shrink-0 rounded-lg p-2 transition-colors
                      hover:bg-gray-200
                      ${className}
                    `}
                    aria-label="Создать"
                    onClick={handleCreateMenu}
                >
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
                width="auto"
                minWidth={menuWidth} // Увеличено минимальную ширину
                maxWidth={menuWidth}
                manualPosition={createMenuPosition} // Ручная установка позиции
            >
                {/* Пункт меню для создания группы */}
                <Dropdown.Item
                    label="Создать группу"
                    onSelect={onSelectGroup}
                    rightIcon={
                        <Image
                            src="/icons/chatList/createGroup.svg"
                            alt="Создать группу"
                            width={16}
                            height={16}
                            className="opacity-80"
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
