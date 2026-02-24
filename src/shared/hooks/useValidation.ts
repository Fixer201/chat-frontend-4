import { useState, useCallback } from 'react'

interface ValidationRule {
    regex: RegExp
    maxLength: number
    errorMessage: string
}

interface UseValidationProps {
    initialValue?: string
    validationRule: ValidationRule
    required?: boolean
    requiredMessage?: string
}

/**
 * Хук для управления состоянием поля ввода, валидацией и фокусом.
 * @param initialValue - начальное значение поля
 * @param validationRule - правила валидации (регулярка, макс. длина, сообщение об ошибке)
 * @param required - обязательное ли поле
 * @param requiredMessage - сообщение, если поле пустое при required=true
 */
export const useValidation = ({
    initialValue = '',
    validationRule,
    required = false,
    requiredMessage = 'Заполните поле',
}: UseValidationProps) => {
    const [value, setValue] = useState(initialValue)
    const [error, setError] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    const validate = useCallback(
        (val: string): string => {
            if (required && !val.trim()) {
                return requiredMessage
            }
            if (val.length > validationRule.maxLength) {
                return `Максимальная длина ${validationRule.maxLength} символов`
            }
            if (!validationRule.regex.test(val)) {
                return validationRule.errorMessage
            }
            return ''
        },
        [required, requiredMessage, validationRule],
    )

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value
            setValue(newValue)
            setError('') // сбрасываем ошибку при изменении
        },
        [],
    )

    const handleBlur = useCallback(() => {
        setIsFocused(false)
        const validationError = validate(value)
        setError(validationError)
    }, [value, validate])

    const handleFocus = useCallback(() => {
        setIsFocused(true)
    }, [])

    const validateField = useCallback((): boolean => {
        const validationError = validate(value)
        setError(validationError)
        return !validationError
    }, [value, validate])

    const resetError = useCallback(() => setError(''), [])

    return {
        value,
        error,
        isFocused,
        handleChange,
        handleBlur,
        handleFocus,
        validateField,
        resetError,
        setValue,
    }
}
