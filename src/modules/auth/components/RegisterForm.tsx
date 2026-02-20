'use client'

/**
 * @component RegisterForm
 * @description Компонент второго шага регистрации: ввод имени и никнейма.
 * Использует кастомные хуки useValidation и useNicknameUnique для управления
 * состоянием полей, валидацией и проверкой уникальности никнейма.
 * Обёрнут в React.memo для предотвращения лишних ререндеров, если пропсы не менялись.

 */

import { Button } from '@shared/ui/button/Button'
import { Input } from '@shared/ui/Input'
import Image from 'next/image'
import { useState, memo, useCallback } from 'react'
import { useValidation } from '@shared/hooks/useValidation'
import { useNicknameUnique } from '@shared/hooks/useNicknameUnique'

interface RegisterFormProps {
    phoneNumber: string
    onSubmit: (data: {
        name: string
        nickname: string
    }) => Promise<void>
    onBack: () => void
}

const RegisterForm = memo(function RegisterForm({
    onSubmit,
    onBack,
}: RegisterFormProps) {
    const nameValidationRule = {
        regex: /^[а-яА-Яa-zA-Z\s\-]*$/,
        maxLength: 30,
        errorMessage:
            'Используйте только буквы, пробел или тире',
    }

    const nicknameValidationRule = {
        regex: /^[a-zA-Z0-9._]*$/,
        maxLength: 30,
        errorMessage:
            'Используйте только буквы, цифры, точку или подчеркивание',
    }

    // =========================================================================
    // ХУКИ УПРАВЛЕНИЯ ПОЛЯМИ
    // =========================================================================
    // useValidation — кастомный хук, который инкапсулирует логику состояния,
    // валидации и фокуса для одного поля. Это уменьшает дублирование кода
    // и упрощает тестирование.

    const nameField = useValidation({
        validationRule: nameValidationRule,
        required: true,
        requiredMessage: 'Заполните поле',
    })

    const nicknameField = useValidation({
        validationRule: nicknameValidationRule,
        required: true,
        requiredMessage: 'Заполните поле',
    })

    // =========================================================================
    // ПРОВЕРКА УНИКАЛЬНОСТИ НИКНЕЙМА
    // =========================================================================
    // useNicknameUnique — хук, который выполняет проверку уникальности с debounce,
    // отменой предыдущих запросов (AbortController) и возвращает состояние ошибки,
    // флаг загрузки и методы для принудительной проверки и сброса.
    // Debounce (500 мс) предотвращает лишние запросы при быстром наборе.
    const {
        uniqueError,
        isChecking: isUniqueChecking,
        validateUniqueNow,
        resetUniqueError,
    } = useNicknameUnique({
        nickname: nicknameField.value,
        validationRegex: nicknameValidationRule.regex,
    })

    // =========================================================================
    // СОСТОЯНИЯ ОТПРАВКИ ФОРМЫ И СЕРВЕРНОЙ ОШИБКИ
    // =========================================================================
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [serverError, setServerError] = useState('') // ошибка, возвращённая сервером при вызове onSubmit

    // =========================================================================
    // ОБРАБОТЧИК ОТПРАВКИ ФОРМЫ
    // =========================================================================
    const handleSubmit = useCallback(async () => {
        // 1. Валидация полей на стороне клиента (обязательные поля, допустимые символы, длина)
        const isNameValid = nameField.validateField()
        const isNicknameValid =
            nicknameField.validateField()
        if (!isNameValid || !isNicknameValid) return

        // 2. Если уже есть ошибка уникальности от хука (например, никнейм занят) — не отправляем
        if (uniqueError) return

        // 3. Принудительно проверяем уникальность прямо перед отправкой,
        //    чтобы избежать ситуации, когда никнейм стал занят после последней проверки.
        //    validateUniqueNow возвращает true, если никнейм уникален.
        const isUnique = await validateUniqueNow()
        if (!isUnique) return

        // 4. Отправка данных на сервер
        setIsSubmitting(true)
        setServerError('')
        try {
            await onSubmit({
                name: nameField.value,
                nickname: nicknameField.value,
            })
        } catch (error: unknown) {
            // 5. Обработка ошибки, выброшенной onSubmit (например, дубликат никнейма на сервере)
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка'
            setServerError(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }, [
        nameField,
        nicknameField,
        uniqueError,
        validateUniqueNow,
        onSubmit,
    ])

    // =========================================================================
    // ОБРАБОТЧИК ИЗМЕНЕНИЯ НИКНЕЙМА
    // =========================================================================
    // Сбрасывает ошибки уникальности и серверную ошибку при каждом изменении поля.
    // Это улучшает UX: пользователь сразу видит, что ввод меняется, и старые ошибки исчезают.
    const handleNicknameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            nicknameField.handleChange(e)
            resetUniqueError()
            setServerError('')
        },
        [nicknameField, resetUniqueError],
    )

    // =========================================================================
    // ЛОГИКА БЛОКИРОВКИ КНОПКИ ОТПРАВКИ
    // =========================================================================
    const isButtonDisabled =
        !nameField.value.trim() || // имя не пустое
        !nicknameField.value.trim() || // никнейм не пустой
        !!nameField.error || // есть ошибка валидации имени
        !!nicknameField.error || // есть ошибка валидации никнейма
        !!uniqueError || // никнейм не уникален
        !!serverError || // ошибка от сервера при отправке
        isUniqueChecking || // идёт проверка уникальности
        isSubmitting // форма уже отправляется

    const buttonColor = isButtonDisabled
        ? 'light-gray'
        : 'primary'

    // =========================================================================
    // ОБРАБОТЧИК СКАЧИВАНИЯ ПОЛЬЗОВАТЕЛЬСКОГО СОГЛАШЕНИЯ
    // =========================================================================
    const handleDownload = useCallback(() => {
        window.open('/contract.pdf', '_blank')
    }, [])

    // =========================================================================
    // РЕНДЕР
    // =========================================================================
    return (
        <div className="flex min-h-screen items-center justify-center">
            {/* Внешний контейнер с фоновым изображением на десктопе */}
            <div
                className={`
                  relative flex h-screen w-(--app-login-width) flex-col
                  items-center justify-center bg-none
                  md:bg-app-login-background
                `}
            >
                {/* Карточка формы с эффектом тени на десктопе */}
                <div
                    className={`
                      flex flex-col items-center justify-center gap-4 bg-white
                      md:absolute md:h-190 md:w-122 md:flex-col md:items-center
                      md:justify-center md:rounded-2xl md:bg-app-login-start
                      md:filter-app-start-screen-shadow
                    `}
                >
                    <div
                        className={`
                          absolute flex flex-col items-center justify-between
                          gap-4
                          md:justify-between md:gap-6
                        `}
                    >
                        {/* Шапка: кнопка назад и логотип */}
                        <div
                            className={`
                              relative flex h-17 w-90 items-center
                              justify-between
                              md:justify-center
                            `}
                        >
                            <Image
                                src="/images/login/back.svg"
                                alt="Назад"
                                width={32}
                                height={32}
                                className="absolute top-0 left-0 cursor-pointer"
                                loading="eager" // критическое изображение, должно загрузиться сразу
                                onClick={onBack}
                            />
                            <Image
                                src="/images/login/Logo.svg"
                                alt="Логотип"
                                width={78}
                                height={70}
                                className={`
                                  absolute right-0 h-14 w-14
                                  md:absolute md:left-1/2 md:h-18 md:w-20
                                  md:-translate-x-1/2 md:transform
                                `}
                                loading="eager"
                            />
                        </div>

                        {/* Форма */}
                        <div
                            className={`
                              flex h-126 w-90 flex-col items-center
                              justify-between gap-4
                              md:justify-between md:gap-6
                            `}
                        >
                            <div
                                className={`
                                  flex w-90 items-center justify-center
                                `}
                            >
                                <p className="text-center text-[32px] font-bold">
                                    Личная информация
                                </p>
                            </div>
                            <div
                                className={`
                                  flex h-112 w-90 flex-col items-center
                                  justify-between
                                `}
                            >
                                <p className="text-center text-[18px]">
                                    Пожалуйста, заполните
                                    данные
                                </p>

                                {/* Поле ввода имени */}
                                {/**
                                 * Input — кастомный компонент UI.
                                 * label отображает либо ошибку, либо обычную подсказку.
                                 * borderColor меняется в зависимости от состояния (ошибка, фокус, обычное).
                                 * inputMode="text" — стандартный режим ввода текста (не цифровой).
                           
                                 */}
                                <Input
                                    label={
                                        nameField.error ||
                                        'Введите имя'
                                    }
                                    placeholder=""
                                    value={nameField.value}
                                    onChange={
                                        nameField.handleChange
                                    }
                                    onFocus={
                                        nameField.handleFocus
                                    }
                                    onBlur={
                                        nameField.handleBlur
                                    }
                                    inputSize="lg"
                                    color={
                                        nameField.error
                                            ? 'red'
                                            : 'gray'
                                    }
                                    borderColor={
                                        nameField.error
                                            ? 'red'
                                            : nameField.isFocused
                                              ? 'violet'
                                              : 'gray'
                                    }
                                    labelColor={
                                        nameField.error
                                            ? 'red'
                                            : 'gray'
                                    }
                                    inputMode="text"
                                    autoComplete="name"
                                />

                                {/* Поле ввода никнейма */}
                                {/**
                                 * Приоритет отображения ошибок:
                                 * 1. serverError (ошибка при отправке, например, никнейм уже занят)
                                 * 2. uniqueError (ошибка от хука проверки уникальности)
                                 * 3. nicknameField.error (ошибка валидации символов/длины)
                                 * 4. обычная подсказка
                                 */}
                                <Input
                                    label={
                                        serverError ||
                                        uniqueError ||
                                        nicknameField.error ||
                                        'Придумайте никнейм'
                                    }
                                    placeholder=""
                                    value={
                                        nicknameField.value
                                    }
                                    onChange={
                                        handleNicknameChange
                                    }
                                    onFocus={
                                        nicknameField.handleFocus
                                    }
                                    onBlur={
                                        nicknameField.handleBlur
                                    }
                                    inputSize="lg"
                                    color={
                                        serverError ||
                                        uniqueError ||
                                        nicknameField.error
                                            ? 'red'
                                            : 'gray'
                                    }
                                    borderColor={
                                        serverError ||
                                        uniqueError ||
                                        nicknameField.error
                                            ? 'red'
                                            : nicknameField.isFocused
                                              ? 'violet'
                                              : 'gray'
                                    }
                                    labelColor={
                                        serverError ||
                                        uniqueError ||
                                        nicknameField.error
                                            ? 'red'
                                            : 'gray'
                                    }
                                    inputMode="text"
                                    autoComplete="nickname" // корректное значение для никнейма
                                />

                                {/* Индикатор проверки уникальности */}
                                {isUniqueChecking && (
                                    <span className="text-sm text-gray-500">
                                        Проверка никнейма...
                                    </span>
                                )}

                                {/* Текст с ссылкой на пользовательское соглашение */}
                                {/**
                                 * Вместо span с role="button" лучше использовать <button>,
                                 * но здесь оставлено как есть для сохранения вёрстки.
                                 */}
                                <span className="text-[14px]">
                                    Нажимая на
                                    &quot;Зарегистрироваться&quot;,
                                    вы соглашаетесь с{' '}
                                    <span
                                        className={`
                                          cursor-pointer
                                          text-(--color-accent-violet-primary)
                                          hover:underline
                                        `}
                                        onClick={
                                            handleDownload
                                        }
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key ===
                                                    'Enter' ||
                                                e.key ===
                                                    ' '
                                            ) {
                                                handleDownload()
                                            }
                                        }}
                                    >
                                        Пользовательским
                                        соглашением
                                    </span>
                                </span>

                                {/* Кнопка отправки */}
                                <Button
                                    variant="solid"
                                    size="md"
                                    color={buttonColor}
                                    className={`
                                      mt-4 w-full
                                      md:mt-0
                                    `}
                                    onClick={handleSubmit}
                                    disabled={
                                        isButtonDisabled
                                    }
                                >
                                    {isSubmitting
                                        ? 'Отправка...'
                                        : 'Зарегистрироваться'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default RegisterForm
