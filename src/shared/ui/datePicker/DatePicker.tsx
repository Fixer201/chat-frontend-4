'use client'

import {
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import ChevronDownIcon from '@public/icons/settings-sidebar/ChevronDown.svg'
import Dropdown from '@shared/ui/dropdown/Dropdown'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import { cn } from '@shared/lib/utils'

type DateSegment = 'day' | 'month' | 'year'

type DateValue = {
    day: number | null
    month: number | null
    year: number | null
}

type SelectOption = {
    value: number
    label: string
}

interface DatePickerProps {
    label?: string
    value?: DateValue
    defaultValue?: DateValue
    onChange?: (value: DateValue) => void
    minYear?: number
    maxYear?: number
    monthNames?: string[]
    name?: string
    className?: string
    dayPlaceholder?: string
    monthPlaceholder?: string
    yearPlaceholder?: string
}

const DEFAULT_MONTHS = [
    'Января',
    'Февраля',
    'Марта',
    'Апреля',
    'Мая',
    'Июня',
    'Июля',
    'Августа',
    'Сентября',
    'Октября',
    'Ноября',
    'Декабря',
]

const DEFAULT_VALUE: DateValue = {
    day: null,
    month: null,
    year: null,
}

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_YEAR_SPAN = 80

const CheckIcon = (
    props: React.SVGProps<SVGSVGElement>,
) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M12.6667 4.6665L6.00001 11.3332L3.33334 8.6665"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const getDaysInMonth = (
    month: number | null,
    year: number | null,
) => {
    if (!month) return 31
    const safeYear = year ?? CURRENT_YEAR
    return new Date(safeYear, month, 0).getDate()
}

const clampDate = (value: DateValue): DateValue => {
    if (!value.day) return value

    const maxDays = getDaysInMonth(value.month, value.year)
    if (value.day <= maxDays) return value

    return {
        ...value,
        day: maxDays,
    }
}

interface SelectFieldProps {
    id: string
    options: SelectOption[]
    value: number | null
    onSelect: (value: number) => void
    placeholder: string
    ariaLabel: string
    className?: string
}

const SelectField = ({
    id,
    options,
    value,
    onSelect,
    placeholder,
    ariaLabel,
    className,
}: SelectFieldProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const triggerRef = useRef<HTMLButtonElement | null>(
        null,
    )
    const [dropdownWidth, setDropdownWidth] = useState<
        number | null
    >(null)

    const selectedOption = useMemo(
        () =>
            options.find(
                (option) => option.value === value,
            ),
        [options, value],
    )

    const updateWidth = useCallback(() => {
        if (!triggerRef.current) return
        const { width } =
            triggerRef.current.getBoundingClientRect()
        setDropdownWidth(width)
    }, [])

    useLayoutEffect(() => {
        updateWidth()
    }, [options, selectedOption, updateWidth])

    useEffect(() => {
        const handleResize = () => updateWidth()
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener(
                'resize',
                handleResize,
            )
        }
    }, [updateWidth])

    useEffect(() => {
        if (!isOpen) return
        updateWidth()
    }, [isOpen, updateWidth])

    const listboxId = `${id}-listbox`

    useEffect(() => {
        if (!isOpen) return

        const frame = requestAnimationFrame(() => {
            const listElement = document.getElementById(
                listboxId,
            ) as HTMLDivElement | null

            if (!listElement) return

            if (value === null || value === undefined) {
                listElement.scrollTop = 0
                return
            }

            const selectedNode =
                listElement.querySelector<HTMLElement>(
                    `[data-option-value="${value}"]`,
                )

            if (!selectedNode) return

            listElement.scrollTop = selectedNode.offsetTop
        })

        return () => cancelAnimationFrame(frame)
    }, [isOpen, listboxId, value])

    return (
        <div className={cn('relative flex-1', className)}>
            <Dropdown
                open={isOpen}
                onOpenChange={setIsOpen}
                closeOnSelect={false}
                offset={0}
            >
                <Dropdown.Trigger>
                    <button
                        ref={triggerRef}
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        aria-controls={listboxId}
                        aria-label={ariaLabel}
                        className={cn(
                            `
                              flex h-12 w-full cursor-pointer items-center
                              justify-between rounded-md border
                              border-transparent bg-white-bg px-4 text-base
                              text-text-black transition-colors
                              focus:border-accent-violet-primary focus:ring-2
                              focus:ring-accent-violet-primary/20
                              focus:outline-none
                            `,
                            isOpen &&
                                `
                                  rounded-b-none border-b-0
                                  border-accent-violet-primary
                                  shadow-(--color-context-shadow)
                                `,
                            !selectedOption &&
                                `text-text-gray`,
                        )}
                    >
                        <span>
                            {selectedOption?.label ??
                                placeholder}
                        </span>
                        <ChevronDownIcon
                            className={cn(
                                `
                                  h-4 w-4 text-text-gray transition-transform
                                  duration-200
                                `,
                                isOpen && `rotate-180`,
                            )}
                        />
                    </button>
                </Dropdown.Trigger>

                <Dropdown.Content
                    width={dropdownWidth ?? 'auto'}
                    minWidth={dropdownWidth ?? undefined}
                    className={`
                      rounded-t-none rounded-b-md border border-t-0
                      border-accent-violet-primary bg-white-bg p-1
                      shadow-(--color-context-shadow)
                    `}
                    style={{
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                        borderTopWidth: 1,
                        borderColor:
                            'var(--color-accent-violet-primary)',
                    }}
                >
                    <CustomScrollbar
                        className="max-h-60"
                        contentClassName="flex flex-col py-1"
                        contentProps={{
                            id: listboxId,
                            role: 'listbox',
                            'aria-label': ariaLabel,
                        }}
                        style={{ height: '8.75rem' }}
                    >
                        {options.map((option) => {
                            const isSelected =
                                option.value === value

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={
                                        isSelected
                                    }
                                    data-option-value={
                                        option.value
                                    }
                                    onClick={() => {
                                        onSelect(
                                            option.value,
                                        )
                                        setIsOpen(false)
                                    }}
                                    className={cn(
                                        `
                                          flex w-full items-center
                                          justify-between rounded-md px-4 py-2
                                          text-base transition-colors
                                          focus:outline-none
                                          focus-visible:ring-2
                                          focus-visible:ring-accent-violet-primary/20
                                        `,
                                        isSelected
                                            ? `
                                              bg-(--color-accent-violet-ultra-light)
                                              font-medium
                                              text-accent-violet-primary
                                            `
                                            : `
                                              text-text-black
                                              hover:bg-(--color-accent-violet-ultra-light)
                                            `,
                                    )}
                                >
                                    <span>
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <CheckIcon
                                            className={`
                                              h-4 w-4 text-accent-violet-primary
                                            `}
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </CustomScrollbar>
                </Dropdown.Content>
            </Dropdown>
        </div>
    )
}

const DatePicker = ({
    label,
    value,
    defaultValue,
    onChange,
    minYear,
    maxYear,
    monthNames,
    name,
    className,
    dayPlaceholder = 'День',
    monthPlaceholder = 'Месяц',
    yearPlaceholder = 'Год',
}: DatePickerProps) => {
    const isControlled = typeof value !== 'undefined'
    const [internalValue, setInternalValue] =
        useState<DateValue>(() =>
            clampDate(defaultValue ?? DEFAULT_VALUE),
        )
    const currentValue = isControlled
        ? clampDate(value ?? DEFAULT_VALUE)
        : internalValue

    const resolvedMaxYear = maxYear ?? CURRENT_YEAR
    const resolvedMinYear =
        minYear ?? resolvedMaxYear - DEFAULT_YEAR_SPAN
    const topYear = Math.max(
        resolvedMaxYear,
        resolvedMinYear,
    )
    const bottomYear =
        Math.min(resolvedMaxYear, resolvedMinYear) ||
        topYear

    const daysInMonth = useMemo(
        () =>
            getDaysInMonth(
                currentValue.month,
                currentValue.year,
            ),
        [currentValue.month, currentValue.year],
    )

    const dayOptions = useMemo<SelectOption[]>(() => {
        return Array.from(
            { length: daysInMonth },
            (_, index) => {
                const day = index + 1
                return {
                    value: day,
                    label: day.toString(),
                }
            },
        )
    }, [daysInMonth])

    const monthOptions = useMemo<SelectOption[]>(() => {
        const source = monthNames ?? DEFAULT_MONTHS
        return source.map((name, index) => ({
            value: index + 1,
            label: name,
        }))
    }, [monthNames])

    const yearOptions = useMemo<SelectOption[]>(() => {
        const years: SelectOption[] = []
        for (
            let year = topYear;
            year >= bottomYear;
            year -= 1
        ) {
            years.push({
                value: year,
                label: year.toString(),
            })
        }
        return years
    }, [bottomYear, topYear])

    const emitChange = useCallback(
        (nextValue: DateValue) => {
            if (!isControlled) {
                setInternalValue(nextValue)
            }
            onChange?.(nextValue)
        },
        [isControlled, onChange],
    )

    const handleSegmentChange = useCallback(
        (
            segment: DateSegment,
            nextSegmentValue: number,
        ) => {
            const nextValue = clampDate({
                ...currentValue,
                [segment]: nextSegmentValue,
            })
            emitChange(nextValue)
        },
        [currentValue, emitChange],
    )

    const idBase = useId()
    const dayId = `${idBase}-day`
    const monthId = `${idBase}-month`
    const yearId = `${idBase}-year`

    return (
        <div
            className={cn('flex flex-col gap-1', className)}
        >
            {label && (
                <span className="text-sm text-text-gray">
                    {label}
                </span>
            )}

            <div className="flex justify-between gap-1">
                <SelectField
                    id={dayId}
                    options={dayOptions}
                    value={currentValue.day}
                    onSelect={(next) =>
                        handleSegmentChange('day', next)
                    }
                    placeholder={dayPlaceholder}
                    ariaLabel="Выберите день"
                    className="basis-[24%]"
                />
                <SelectField
                    id={monthId}
                    options={monthOptions}
                    value={currentValue.month}
                    onSelect={(next) =>
                        handleSegmentChange('month', next)
                    }
                    placeholder={monthPlaceholder}
                    ariaLabel="Выберите месяц"
                    className="basis-[42%]"
                />
                <SelectField
                    id={yearId}
                    options={yearOptions}
                    value={currentValue.year}
                    onSelect={(next) =>
                        handleSegmentChange('year', next)
                    }
                    placeholder={yearPlaceholder}
                    ariaLabel="Выберите год"
                    className="basis-[33%]"
                />
            </div>

            {name && (
                <>
                    <input
                        type="hidden"
                        name={`${name}.day`}
                        value={currentValue.day ?? ''}
                    />
                    <input
                        type="hidden"
                        name={`${name}.month`}
                        value={currentValue.month ?? ''}
                    />
                    <input
                        type="hidden"
                        name={`${name}.year`}
                        value={currentValue.year ?? ''}
                    />
                </>
            )}
        </div>
    )
}

export type { DateValue }
export { DatePicker }
