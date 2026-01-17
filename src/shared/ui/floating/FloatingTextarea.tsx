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

// Интерфейс пропсов для компонента FloatingTextarea
export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string // Плавающая подпись, которая поднимается при фокусе/заполнении
    maxLength?: number // Максимальное количество символов
    showCounterOnFocus?: boolean // Показывать счетчик только при фокусе или всегда
    // Позиция для стилизации скруглений углов при объединении нескольких полей
    position?: 'single' | 'top' | 'middle' | 'bottom'
}

// Компонент текстового поля с плавающей подписью и адаптивной высотой
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
        // Внутренний ref для доступа к DOM-элементу textarea
        const innerRef = useRef<HTMLTextAreaElement | null>(
            null,
        )

        // Функция для объединения внешнего и внутреннего ref
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

        // Состояние фокуса на поле
        const [focused, setFocused] = useState(false)
        // Определяем, контролируется ли компонент извне
        const isControlled = typeof value === 'string'
        // Локальное состояние для неконтролируемого режима
        const [internalVal, setInternalVal] =
            useState<string>(
                isControlled ? (value as string) : '',
            )
        // Используем значение в зависимости от режима
        const val = isControlled
            ? (value as string)
            : internalVal

        // Функция для автоматической регулировки высоты textarea
        const autoSize = (
            el?: HTMLTextAreaElement | null,
        ) => {
            if (!el) return
            // Сбрасываем высоту, затем устанавливаем нужную
            el.style.height = 'auto'
            el.style.height = `${Math.min(300, el.scrollHeight)}px`
        }

        // Эффект для изменения высоты при изменении значения
        useEffect(() => {
            autoSize(innerRef.current)
        }, [val])

        // Обработчик изменения значения в textarea
        const handleChange = (
            e: React.ChangeEvent<HTMLTextAreaElement>,
        ) => {
            if (!isControlled)
                setInternalVal(e.target.value)
            if (onChange) onChange(e)
        }

        // Функция очистки поля
        const clear = () => {
            if (!isControlled) setInternalVal('')
            if (innerRef.current) {
                innerRef.current.value = ''
                autoSize(innerRef.current)
                innerRef.current.focus()
            }
            // Имитируем событие onChange для уведомления родительского компонента
            if (onChange) {
                const synthetic = {
                    target: { value: '' },
                } as unknown as React.ChangeEvent<HTMLTextAreaElement>
                onChange(synthetic)
            }
        }

        // Определяем, нужно ли показывать счетчик символов
        const showCounter = maxLength
            ? focused &&
              (val.length > 0 || showCounterOnFocus)
            : false

        return (
            <div
                className={cn(
                    `relative bg-white`,
                    `bg-white`,
                    // Стили для разных позиций (для объединенных полей формы)
                    position === 'single'
                        ? `rounded-md border border-(--color-gray-border)`
                        : position === 'top'
                          ? `
                            rounded-t-md rounded-b-none border border-b
                            border-(--color-gray-border)
                          `
                          : position === 'bottom'
                            ? `
                              rounded-t-none rounded-b-md border border-t
                              border-(--color-gray-border)
                            `
                            : `
                              rounded-none border border-t-0 border-b-0
                              border-(--color-gray-border)
                            `,
                    className || '',
                )}
                // Обработчик клика для управления фокусом
                onMouseDown={(e) => {
                    const el = innerRef.current
                    const target = e.target as HTMLElement
                    if (target.closest('button')) return

                    // Предотвращаем потерю фокуса при клике внутри уже активного поля
                    if (document.activeElement === el) {
                        e.preventDefault()
                        el?.focus()
                    } else {
                        // Даем браузеру сначала снять фокус с предыдущего элемента
                        setTimeout(() => el?.focus(), 0)
                    }
                }}
            >
                {/* Основное текстовое поле */}
                <Textarea
                    ref={mergedRef}
                    value={val}
                    maxLength={maxLength}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={cn(
                        `
                          max-h-75 resize-none overflow-hidden px-3 pt-5 pr-10
                          pb-3 text-base leading-6
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
                                    text-(--color-text-gray)
                                  `
                          }
                        `}
                    >
                        {label}
                    </label>
                )}

                {/* Счетчик символов (показывается при определенных условиях) */}
                {showCounter && maxLength && (
                    <div
                        className={cn(
                            `absolute top-1 right-2 text-xs`,
                            `
                              ${
                                  val.length < maxLength
                                      ? 'text-(--color-text-gray)'
                                      : 'text-(--color-system-red)'
                              }
                            `,
                        )}
                    >
                        {`${val.length}/${maxLength}`}
                    </div>
                )}

                {/* Кнопка очистки (появляется при фокусе и наличии текста) */}
                {focused && val.length > 0 && (
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
                          items-center justify-center rounded-full
                          bg-(--color-text-gray) p-0 text-xs text-white
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
