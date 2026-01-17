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
export interface PositionStyle {
    single: string
    top: string
    bottom: string
    middle: string
}
//Объект для возвращения стилей в зависимости от позиции
const positionStyle: PositionStyle = {
    single: `rounded-md border border-(--color-gray-border)`,
    top: `rounded-t-md rounded-b-none border border-b border-(--color-gray-border)`,
    bottom: `rounded-t-none rounded-b-md border border-t border-(--color-gray-border)`,
    middle: `rounded-none border border-t-0 border-b-0 border-(--color-gray-border)`,
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
        // Используем useRef для сохранения ссылки на DOM-элемент textarea между рендерами
        // Это позволяет управлять элементом напрямую (например, для авторазмера)
        const innerRef = useRef<HTMLTextAreaElement | null>(
            null,
        )

        // Кастомная функция mergeRefs, которая объединяет внешний ref (из пропсов)
        // и внутренний ref (innerRef) в одну функцию
        // Это позволяет родительскому компоненту также иметь доступ к textarea элементу
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

        // useState для отслеживания состояния фокуса
        // Нужен для определения, когда показывать счетчик и изменять стили лейбла
        const [focused, setFocused] = useState(false)
        // Определяем, контролируется ли компонент извне
        // В React есть два подхода: controlled (значение через props) и uncontrolled (значение в state)
        const isControlled = typeof value === 'string'
        // Локальное состояние для uncontrolled режима
        // Используем useState вместо useRef, чтобы вызывать ререндер при изменении значения
        const [internalVal, setInternalVal] =
            useState<string>(
                isControlled ? (value as string) : '',
            )
        // Выбираем значение в зависимости от режима работы компонента
        const val = isControlled
            ? (value as string)
            : internalVal

        // Функция автоматического изменения высоты textarea
        // Использует scrollHeight для определения фактической высоты содержимого
        // Ограничивает максимальную высоту 300px для предотвращения чрезмерного роста
        const autoSize = (
            el?: HTMLTextAreaElement | null,
        ) => {
            if (!el) return
            // Устанавливаем высоту 'auto' для сброса предыдущих значений
            // Затем вычисляем необходимую высоту на основе scrollHeight
            el.style.height = 'auto'
            el.style.height = `${Math.min(300, el.scrollHeight)}px`
        }

        // useEffect для вызова autoSize при каждом изменении значения
        // Зависимость [val] гарантирует, что высота пересчитывается при изменении текста
        // Используем innerRef.current для доступа к DOM-элементу
        useEffect(() => {
            autoSize(innerRef.current)
        }, [val]) // Пересчет только при изменении значения, а не при каждом рендере

        // Обработчик изменения значения в textarea
        const handleChange = (
            e: React.ChangeEvent<HTMLTextAreaElement>,
        ) => {
            // В uncontrolled режиме обновляем локальное состояние
            if (!isControlled)
                setInternalVal(e.target.value)
            // Прокидываем событие onChange родительскому компоненту
            // Это позволяет родителю реагировать на изменения даже в uncontrolled режиме
            if (onChange) onChange(e)
        }

        // Функция очистки поля
        // Работает в обоих режимах (controlled и uncontrolled)
        const clear = () => {
            // В uncontrolled режиме сбрасываем локальное состояние
            if (!isControlled) setInternalVal('')
            // Прямая работа с DOM-элементом для немедленного обновления
            if (innerRef.current) {
                innerRef.current.value = ''
                autoSize(innerRef.current) // Сбрасываем высоту после очистки
                innerRef.current.focus() // Возвращаем фокус на поле
            }
            // Создаем синтетическое событие для уведомления родительского компонента
            // Важно для controlled компонентов, чтобы родитель знал об очистке
            if (onChange) {
                const synthetic = {
                    target: { value: '' },
                } as unknown as React.ChangeEvent<HTMLTextAreaElement>
                onChange(synthetic)
            }
        }

        // Логика отображения счетчика символов
        // Счетчик показывается только при определенных условиях:
        // 1. Если указан maxLength
        // 2. Если поле в фокусе И (есть текст ИЛИ showCounterOnFocus=true)
        const showCounter = maxLength
            ? focused &&
              (val.length > 0 || showCounterOnFocus)
            : false

        return (
            <div
                className={cn(
                    `relative bg-white-bg`,
                    `bg-white-bg`,
                    // Стили для разных позиций (для объединенных полей формы)
                    positionStyle[position],
                    className || '',
                )}
                // Кастомный обработчик клика для улучшения UX
                // Решает проблему потери фокуса при клике внутри поля
                onMouseDown={(e) => {
                    const el = innerRef.current
                    const target = e.target as HTMLElement
                    // Игнорируем клики по кнопкам внутри контейнера
                    if (target.closest('button')) return

                    // Если поле уже в фокусе, предотвращаем стандартное поведение
                    // чтобы не вызывать blur/focus цикл при клике внутри активного поля
                    if (document.activeElement === el) {
                        e.preventDefault()
                        el?.focus()
                    } else {
                        // Даем браузеру сначала обработать blur предыдущего элемента
                        // Затем фокусируем текущее поле
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
                                    text-text-gray
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
                                      ? 'text-text-gray'
                                      : 'text-system-red'
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
