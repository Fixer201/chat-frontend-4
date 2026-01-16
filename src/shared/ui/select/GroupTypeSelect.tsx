import { GroupTypeOptionProps } from '@shared/types/createGroup'
import { useState } from 'react'

export interface GroupTypeSelectProps {
    selectLabel?: string
    value?: string
    options: GroupTypeOptionProps[]
    onChange?: (option: GroupTypeOptionProps) => void
    placeholder?: string
}

const GroupTypeSelect: React.FC<GroupTypeSelectProps> = ({
    selectLabel,
    options,
    value = '',
    onChange,
    placeholder = 'Выберите тип',
}) => {
    const [open, setOpen] = useState(false)
    const selectedOption = options?.find(
        (option) => option.value === value,
    )
    return (
        <div className="w-full">
            <div className="mb-1 text-sm font-medium text-(--color-text-gray)">
                {selectLabel}
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
                        ? selectedOption?.optionName
                        : placeholder}
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

            {open && options?.length > 0 && (
                <div
                    className={`
                      mt-2 flex w-full flex-col gap-3 rounded-md bg-white p-4
                    `}
                >
                    {options?.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange?.(option)
                                setOpen(false)
                            }}
                            className={`
                              flex h-19 w-full items-center gap-3 rounded-md
                              px-4 text-left transition
                              hover:bg-(--color-gray-light)
                            `}
                        >
                            <div
                                className={`
                                   mr-2 flex h-5 w-5 items-center justify-center
                                 `}
                            >
                                {value === option.value ? (
                                    <div
                                        className={`
                                              flex h-5 w-5 items-center
                                              justify-center rounded-full border
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
                                    {option.optionName}
                                </div>
                                <div
                                    className={`
                                  mt-1 text-sm text-(--color-text-gray)
                                `}
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
