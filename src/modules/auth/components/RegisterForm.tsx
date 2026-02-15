/* eslint-disable better-tailwindcss/no-unregistered-classes */
/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import { Button } from '@shared/ui/button/Button'
import { Input } from '@shared/ui/Input'
import Image from 'next/image'
import { useState, useEffect, memo } from 'react'
import '@app/globals.css'

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
    const [name, setName] = useState('')
    const [nickname, setNickname] = useState('')
    const [nameError, setNameError] = useState('')
    const [nicknameError, setNicknameError] = useState('')
    const [nicknameUniqueError, setNicknameUniqueError] =
        useState('')
    const [isServerError, setIsServerError] =
        useState(false) // Флаг для ошибки от сервера
    const [debouncedNickname, setDebouncedNickname] =
        useState('')
    const [lastCheckedNickname, setLastCheckedNickname] =
        useState('') // Для отслеживания последнего проверенного nickname
    const nameValidationRegex = /^[а-яА-Яa-zA-Z\s\-]*$/
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const nicknameValidationRegex = /^[a-zA-Z0-9._]*$/
    const [isNameFocused, setIsNameFocused] =
        useState(false) // состояние для фокуса имени
    const [isNicknameFocused, setIsNicknameFocused] =
        useState(false) // состояние для фокуса никнейма

    // Debouncing для nickname
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedNickname(nickname)
        }, 500)
        return () => clearTimeout(timer)
    }, [nickname])

    // Проверка уникальности nickname
    useEffect(() => {
        if (
            debouncedNickname &&
            nicknameValidationRegex.test(
                debouncedNickname,
            ) &&
            debouncedNickname !== lastCheckedNickname
        ) {
            const checkUnique = async () => {
                try {
                    const response = await fetch(
                        `/api/auth/unique_nickname_check/${encodeURIComponent(debouncedNickname)}`,
                    )
                    if (
                        response.ok ||
                        response.status === 400
                    ) {
                        const data = await response.json()
                        if (
                            data.nickname &&
                            Array.isArray(data.nickname) &&
                            data.nickname.length > 0
                        ) {
                            setNicknameUniqueError(
                                'Этот никнейм занят другим пользователем',
                            )
                        } else {
                            setNicknameUniqueError('') // Сбрасываем ошибку только если уникален
                        }
                        setLastCheckedNickname(
                            debouncedNickname,
                        ) // Обновляем последний проверенный
                    } else {
                        setNicknameUniqueError(
                            'Не удалось проверить уникальность никнейма',
                        )
                        setLastCheckedNickname(
                            debouncedNickname,
                        )
                    }
                } catch (error) {
                    console.error(
                        'Ошибка проверки уникальности:',
                        error,
                    )
                    setNicknameUniqueError(
                        'Не удалось проверить уникальность никнейма',
                    )
                    setLastCheckedNickname(
                        debouncedNickname,
                    )
                }
            }
            checkUnique()
        }
    }, [
        debouncedNickname,
        nicknameValidationRegex,
        lastCheckedNickname,
    ])

    const validateInput = (
        value: string,
        regex: RegExp,
        maxLength: number,
        errorMsg: string,
    ): string => {
        if (value.length > maxLength) return ''
        return regex.test(value) ? '' : errorMsg
    }

    const handleNameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value
        const error = validateInput(
            value,
            nameValidationRegex,
            30,
            'Используйте только буквы, пробел или тире',
        )
        setName(value)
        setNameError(error)
    }

    const handleNicknameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value
        const error = validateInput(
            value,
            nicknameValidationRegex,
            30,
            'Используйте только буквы, цифры, точку или подчеркивание',
        )
        setNickname(value)
        setNicknameError(error)
        setNicknameUniqueError('')

        if (isServerError) {
            setIsServerError(false)
        }
    }

    const handleSubmit = async () => {
        let hasErrors = false
        if (!name.trim()) {
            setNameError('Заполните поле')
            hasErrors = true
        } else if (!nameValidationRegex.test(name)) {
            setNameError(
                'Используйте только буквы, пробел или тире',
            )
            hasErrors = true
        }
        if (!nickname.trim()) {
            setNicknameError('Заполните поле')
            hasErrors = true
        } else if (
            !nicknameValidationRegex.test(nickname)
        ) {
            setNicknameError(
                'Используйте только буквы, цифры, точку или подчеркивание',
            )
            hasErrors = true
        }
        if (nicknameUniqueError) {
            hasErrors = true
        }
        if (!hasErrors) {
            try {
                await onSubmit({ name, nickname })
            } catch (error: unknown) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Неизвестная ошибка'
                // Устанавливаем ошибку от сервера
                setIsServerError(true)
                setNicknameUniqueError(errorMessage)
            }
        }
    }

    const handleNameBlur = () => {
        if (!name.trim()) {
            setNameError('Заполните поле')
        }
    }
    const handleNicknameBlur = () => {
        if (!nickname.trim()) {
            setNicknameError('Заполните поле')
        }
    }

    const handleDownload = () => {
        window.open('/contract.pdf', '_blank')
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div
                className={`
                  login-container relative flex h-screen w-(--app-login-width)
                  flex-col items-center justify-center bg-none
                  md:bg-app-login-background
                `}
            >
                <div
                    className={`
                      start-screen-inner flex flex-col items-center
                      justify-center gap-4 bg-white
                      md:absolute md:h-190 md:w-122 md:flex-col md:items-center
                      md:justify-center md:rounded-2xl md:bg-app-login-start
                      md:filter-app-start-screen-shadow
                    `}
                >
                    <div
                        className={`
                          absolute flex flex-col items-center justify-between
                          gap-4 md:justify-between md:gap-6
                        `}
                    >
                        <div
                            className={`
                           relative flex h-17 w-90 items-center justify-between
                           md:justify-center
                         `}
                        >
                            <Image
                                src="/images/login/back.svg"
                                alt="Back"
                                width={32}
                                height={32}
                                className={`
                                                          absolute top-0 left-0
                                                          cursor-pointer
                                                        `}
                                loading="eager"
                                onClick={onBack}
                            />

                            <Image
                                src="/images/login/Logo.svg"
                                alt="Logo"
                                width={78}
                                height={70}
                                className={`
                                absolute right-0 h-14 w-14
      md:absolute md:left-1/2 md:h-18 md:w-20 md:-translate-x-1/2 md:transform
                                `}
                                loading="eager"
                            />
                        </div>

                        <div
                            className={`
                              flex h-126 w-90 flex-col items-center
                              justify-between gap-4 md:justify-between
                              md:gap-6
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
                                <Input
                                    label={
                                        nameError ||
                                        'Введите имя'
                                    }
                                    placeholder=""
                                    value={name}
                                    onChange={
                                        handleNameChange
                                    }
                                    onFocus={() =>
                                        setIsNameFocused(
                                            true,
                                        )
                                    }
                                    onBlur={handleNameBlur}
                                    inputSize="lg"
                                    color={
                                        nameError
                                            ? 'red'
                                            : 'gray'
                                    }
                                    borderColor={
                                        nameError
                                            ? 'red'
                                            : isNameFocused
                                              ? 'violet'
                                              : 'gray'
                                    }
                                    labelColor={
                                        nameError
                                            ? 'red'
                                            : 'gray'
                                    }
                                    inputMode="tel" //  оптимизирует клавиатуру для телефонов (цифровая)
                                    autoComplete="tel"
                                />

                                <Input
                                    label={
                                        nicknameUniqueError ||
                                        nicknameError ||
                                        'Придумайте никнейм'
                                    }
                                    placeholder=""
                                    value={nickname}
                                    onChange={
                                        handleNicknameChange
                                    }
                                    onFocus={() =>
                                        setIsNicknameFocused(
                                            true,
                                        )
                                    }
                                    onBlur={
                                        handleNicknameBlur
                                    }
                                    inputSize="lg"
                                    color={
                                        nicknameUniqueError ||
                                        nicknameError
                                            ? 'red'
                                            : 'gray'
                                    }
                                    borderColor={
                                        nicknameUniqueError ||
                                        nicknameError
                                            ? 'red'
                                            : isNicknameFocused
                                              ? 'violet'
                                              : 'gray'
                                    }
                                    labelColor={
                                        nicknameUniqueError ||
                                        nicknameError
                                            ? 'red'
                                            : 'gray'
                                    }
                                    inputMode="tel" //  оптимизирует клавиатуру для телефонов (цифровая)
                                    autoComplete="tel"
                                />

                                <span
                                    className={`text-[14px]`}
                                >
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
                                <Button
                                    variant="solid"
                                    size="md"
                                    color={
                                        name.trim() &&
                                        nickname.trim() &&
                                        !nameError &&
                                        !nicknameError &&
                                        !nicknameUniqueError
                                            ? 'primary'
                                            : 'light-gray'
                                    }
                                    className={`
                                      mt-4 w-full
                                      md:mt-0
                                    `}
                                    onClick={handleSubmit}
                                    disabled={
                                        !name.trim() ||
                                        !nickname.trim() ||
                                        !!nameError ||
                                        !!nicknameError ||
                                        !!nicknameUniqueError
                                    }
                                >
                                    Зарегистрироваться
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
