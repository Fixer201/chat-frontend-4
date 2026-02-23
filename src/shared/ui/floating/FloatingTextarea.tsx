// Компонент текстового поля с плавающим лейблом, автоматической высотой и счетчиком символов
import Textarea from '@shared/ui/textarea/Textarea'
import { Button } from '@shared/ui/button/Button'
import { cn } from '@shared/lib/utils'
import {
    forwardRef,
    useEffect,
    useRef,
    useState,
} from 'react'

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    maxLength?: number
    showCounterOnFocus?: boolean
    position?: 'single' | 'top' | 'middle' | 'bottom'
}

export interface PositionStyle {
    single: string
    top: string
    bottom: string
    middle: string
}

const positionStyle: PositionStyle = {
    single: `rounded-md border border-(--color-gray-border)`,
    top: `rounded-t-md rounded-b-none border border-b border-(--color-gray-border)`,
    bottom: `rounded-t-none rounded-b-md border border-t border-(--color-gray-border)`,
    middle: `rounded-none border border-t-0 border-b-0 border-(--color-gray-border)`,
}

const FloatingTextarea = forwardRef<
    HTMLTextAreaElement,
    FloatingTextareaProps
>(
    (
        {
            label,
            maxLength,
            showCounterOnFocus = false,
            className,
            value,
            onChange,
            position = 'single',
            ...props
        },
        ref,
    ) => {
        const innerRef = useRef<HTMLTextAreaElement | null>(
            null,
        )

        const mergedRef = (
            node: HTMLTextAreaElement | null,
        ) => {
            innerRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref && typeof ref !== 'function') {
                ;(
                    ref as React.MutableRefObject<HTMLTextAreaElement | null>
                ).current = node
            }
        }

        const [focused, setFocused] = useState(false)
        const isControlled = typeof value === 'string'
        const [internalVal, setInternalVal] =
            useState<string>(
                isControlled ? (value as string) : '',
            )
        const val = isControlled
            ? (value as string)
            : internalVal

        const autoSize = (
            el?: HTMLTextAreaElement | null,
        ) => {
            if (!el) return
            el.style.height = 'auto'
            el.style.height = `${Math.min(300, el.scrollHeight)}px`
        }

        useEffect(() => {
            autoSize(innerRef.current)
        }, [val])

        const handleChange = (
            e: React.ChangeEvent<HTMLTextAreaElement>,
        ) => {
            if (!isControlled)
                setInternalVal(e.target.value)
            if (onChange) onChange(e)
        }

        const clear = () => {
            if (!isControlled) setInternalVal('')
            if (innerRef.current) {
                innerRef.current.value = ''
                autoSize(innerRef.current)
                innerRef.current.focus()
            }
            if (onChange) {
                const synthetic = {
                    target: { value: '' },
                } as unknown as React.ChangeEvent<HTMLTextAreaElement>
                onChange(synthetic)
            }
        }

        const showClearButton = focused && val.length > 0
        // Счётчик показываем при фокусе и (наличии текста или showCounterOnFocus)
        const showCounter = maxLength
            ? focused &&
              (val.length > 0 || showCounterOnFocus)
            : false

        return (
            <div
                className={cn(
                    `relative bg-white-bg`,
                    positionStyle[position],
                    className || '',
                )}
            >
                {/* Поле ввода */}
                <Textarea
                    ref={mergedRef}
                    value={val}
                    maxLength={maxLength}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={cn(
                        `
                          box-border max-h-75 w-full resize-none overflow-hidden
                          px-3 pt-5 pr-16 pb-3 text-base leading-6
                          focus:outline-none
                        `,
                        className || '',
                    )}
                    rows={1}
                    {...props}
                />

                {/* Плавающая подпись */}
                {label && (
                    <label
                        className={`
                          pointer-events-none absolute left-3 transition-all
                          ${
                              val || focused
                                  ? 'top-2 text-xs'
                                  : `
                                    top-1/2 -translate-y-1/2 text-base
                                    text-text-gray
                                  `
                          }
                        `}
                    >
                        {label}
                    </label>
                )}

                {/* Счётчик символов (клики проходят сквозь него к полю) */}
                {showCounter && maxLength && (
                    <div
                        className={cn(
                            `pointer-events-none absolute top-1 right-8 text-xs`, // right-8 для отступа от кнопки
                            `
                              ${
                                  val.length < maxLength
                                      ? 'text-text-gray'
                                      : 'text-system-red'
                              }
                            `,
                        )}
                    >
                        {`${val.length}/${maxLength}`}
                    </div>
                )}

                {/* Кнопка очистки */}
                {showClearButton && (
                    <Button
                        type="button"
                        onClick={clear}
                        onMouseDown={(e) =>
                            e.preventDefault()
                        }
                        size="sm"
                        variant="ghost"
                        color="neutral"
                        className={`
                          absolute top-1/2 right-2 flex h-4 w-4 -translate-y-1/2
                          items-center justify-center rounded-full bg-text-gray
                          p-0 text-xs text-white-bg
                        `}
                    >
                        ×
                    </Button>
                )}
            </div>
        )
    },
)

FloatingTextarea.displayName = 'FloatingTextarea'

export default FloatingTextarea
