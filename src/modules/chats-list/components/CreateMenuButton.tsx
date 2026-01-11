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

interface CreateMenuButtonProps {
    onSelectGroup?: () => void
    onSelectChannel?: () => void
    className?: string
}

export default function CreateMenuButton({
    onSelectGroup,
    onSelectChannel,
    className = '',
}: CreateMenuButtonProps) {
    const [createMenuPosition, setCreateMenuPosition] =
        useState({ top: 0, left: 0 })
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [menuWidth, setMenuWidth] = useState(180) // Увеличено до 180

    // Получаем ширину меню при монтировании компонента
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

    const handleCreateMenu = useCallback(
        (e: React.MouseEvent) => {
            if (!buttonRef.current) return

            const buttonRect =
                buttonRef.current.getBoundingClientRect()

            setCreateMenuPosition({
                left: buttonRect.right - menuWidth,
                top: buttonRect.bottom + 4,
            })
        },
        [menuWidth],
    )

    const handleCreateGroup = useCallback(() => {
        if (onSelectGroup) {
            onSelectGroup()
        } else {
            alert('Создать группу')
        }
    }, [onSelectGroup])

    const handleCreateChannel = useCallback(() => {
        if (onSelectChannel) {
            onSelectChannel()
        } else {
            alert('Создать канал')
        }
    }, [onSelectChannel])

    return (
        <Dropdown>
            <Dropdown.Trigger>
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
            <Dropdown.Content
                width="auto"
                minWidth={menuWidth} // Увеличено минимальную ширину
                maxWidth={menuWidth}
                manualPosition={createMenuPosition}
            >
                <Dropdown.Item
                    label="Создать группу"
                    onSelect={handleCreateGroup}
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
                <Dropdown.Item
                    label="Создать канал"
                    onSelect={handleCreateChannel}
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
