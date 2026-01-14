import React, {
    forwardRef,
    useEffect,
    useRef,
    useState,
} from 'react'
import Textarea from '@shared/ui/textarea/Textarea'
import { Button } from '@shared/ui/button/Button'
import { cn } from '@shared/lib/utils'

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    maxLength?: number
    showCounterOnFocus?: boolean
    // layout position for joined fields: 'single' | 'top' | 'bottom' | 'middle'
    position?: 'single' | 'top' | 'middle' | 'bottom'
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
            // notify parent via onChange with a simple event-like object
            if (onChange) {
                const synthetic = {
                    target: { value: '' },
                } as unknown as React.ChangeEvent<HTMLTextAreaElement>
                onChange(synthetic)
            }
        }

        // show counter only while the field is focused (optionally when empty if showCounterOnFocus)
        const showCounter = maxLength
            ? focused &&
              (val.length > 0 || showCounterOnFocus)
            : false

        return (
            <div
                className={cn(
                    `relative bg-white`,
                    `bg-white`,
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
                onMouseDown={(e) => {
                    const el = innerRef.current
                    const target = e.target as HTMLElement
                    if (target.closest('button')) return

                    // If this textarea is already focused, preventDefault to avoid blur
                    // when clicking inside the same control. Otherwise allow the browser
                    // to blur the previously focused field, then focus this one.
                    if (document.activeElement === el) {
                        e.preventDefault()
                        el?.focus()
                    } else {
                        // allow blur on previous element first, then focus this textarea
                        setTimeout(() => el?.focus(), 0)
                    }
                }}
            >
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
