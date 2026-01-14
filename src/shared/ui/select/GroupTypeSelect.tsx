import React from 'react'

export interface GroupTypeSelectProps {
    value?: 'open' | 'closed' | ''
    onChange?: (v: 'open' | 'closed' | '') => void
}

const GroupTypeSelect: React.FC<GroupTypeSelectProps> = ({
    value = '',
    onChange,
}) => {
    const [open, setOpen] = React.useState(false)

    return (
        <div className="w-full">
            <div className="mb-1 text-sm font-medium text-(--color-text-gray)">
                Тип группы
            </div>

            <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((s) => !s)}
                className={`
                  flex h-14 w-full items-center justify-between rounded-md
                  bg-(--color-white-bg) px-3 py-0 text-left
                `}
            >
                <div className="text-base text-(--color-text-gray)">
                    {value
                        ? value === 'closed'
                            ? 'Закрытая'
                            : 'Открытая'
                        : 'Выберите тип'}
                </div>
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

            {open && (
                <div
                    className={`
                      mt-2 flex w-full flex-col gap-3 rounded-md bg-white p-4
                    `}
                >
                    <button
                        type="button"
                        onClick={() => {
                            onChange?.('closed')
                            setOpen(false)
                        }}
                        className={`
                          flex h-19 w-full items-center gap-3 rounded-md px-4
                          text-left
                          hover:bg-(--color-gray-light)
                        `}
                    >
                        <div
                            className={`
                              mr-2 flex h-5 w-5 items-center justify-center
                            `}
                        >
                            {value === 'closed' ? (
                                <div
                                    className={`
                                      flex h-5 w-5 items-center justify-center
                                      rounded-full border-1
                                      border-(--color-system-blue)
                                      bg-(--color-white-bg)
                                    `}
                                >
                                    <div
                                        className={`
                                          h-3 w-3 rounded-full
                                          bg-(--color-system-blue)
                                        `}
                                    />
                                </div>
                            ) : (
                                <div
                                    className={`
                                      h-5 w-5 rounded-full border
                                      border-(--color-text-gray)
                                      bg-(--color-white-bg)
                                    `}
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <div
                                className={`
                                  text-base leading-3 text-(--color-text-black)
                                `}
                            >
                                Закрытая
                            </div>
                            <div
                                className={`
                                  mt-1 text-sm text-(--color-text-gray)
                                `}
                            >
                                В закрытую группу можно
                                попасть только
                                по приглашению
                                или пригласительной ссылке
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            onChange?.('open')
                            setOpen(false)
                        }}
                        className={`
                          flex h-19 w-full items-center gap-3 rounded-md px-4
                          text-left
                          hover:bg-(--color-gray-light)
                        `}
                    >
                        <div
                            className={`
                              mr-2 flex h-5 w-5 items-center justify-center
                            `}
                        >
                            {value === 'open' ? (
                                <div
                                    className={`
                                      flex h-5 w-5 items-center justify-center
                                      rounded-full border-1
                                      border-(--color-system-blue)
                                      bg-(--color-white-bg)
                                    `}
                                >
                                    <div
                                        className={`
                                          h-3 w-3 rounded-full
                                          bg-(--color-system-blue)
                                        `}
                                    />
                                </div>
                            ) : (
                                <div
                                    className={`
                                      h-5 w-5 rounded-full border
                                      border-(--color-text-gray)
                                      bg-(--color-white-bg)
                                    `}
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <div
                                className={`
                                  text-base leading-3 text-(--color-text-black)
                                `}
                            >
                                Открытая
                            </div>
                            <div
                                className={`
                                  mt-1 text-sm text-(--color-text-gray)
                                `}
                            >
                                Открытую группу можно найти
                                через поиск. Присоединиться
                                к ней может любой
                                пользователь
                            </div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    )
}

export default GroupTypeSelect
