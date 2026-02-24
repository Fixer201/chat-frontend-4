// hooks/useCodeInput.ts
import { useReducer, useRef, useCallback } from 'react'

function codeReducer(
    state: string[],
    action: {
        type: string
        index?: number
        value?: string
    },
) {
    switch (action.type) {
        case 'clear':
            return Array(5).fill('')
        case 'set_digit':
            if (
                action.index !== undefined &&
                action.value !== undefined
            ) {
                const newCode = [...state]
                newCode[action.index] = action.value
                return newCode
            }
            return state
        default:
            return state
    }
}

export function useCodeInput(length: number = 5) {
    const [code, dispatch] = useReducer(
        codeReducer,
        Array(length).fill(''),
    )
    const inputRefs = useRef<(HTMLInputElement | null)[]>(
        Array(length).fill(null),
    )

    const handleChange = useCallback(
        (
            index: number,
            value: string,
            onComplete?: (fullCode: string) => void,
        ) => {
            const sanitized = value
                .replace(/\D/g, '')
                .slice(0, 1)

            // Строим новый массив на основе текущего состояния и новой цифры
            const newCode = [...code]
            newCode[index] = sanitized

            // Диспатчим обновление (синхронизируем состояние)
            dispatch({
                type: 'set_digit',
                index,
                value: sanitized,
            })

            // Автоматический переход к следующему полю
            if (sanitized && index < length - 1) {
                inputRefs.current[index + 1]?.focus()
            }

            // Проверяем, заполнен ли код полностью (по newCode)
            if (
                newCode.every((d) => d !== '') &&
                onComplete
            ) {
                onComplete(newCode.join(''))
            }
        },
        [code, length],
    )

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent) => {
            if (
                e.key === 'Backspace' &&
                !code[index] &&
                index > 0
            ) {
                inputRefs.current[index - 1]?.focus()
            }
        },
        [code],
    )

    const clear = useCallback(
        () => dispatch({ type: 'clear' }),
        [],
    )

    const isComplete = code.every((d) => d !== '')

    return {
        code,
        inputRefs,
        handleChange,
        handleKeyDown,
        clear,
        isComplete,
    }
}
