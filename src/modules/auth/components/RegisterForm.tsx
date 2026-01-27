'use client'
import { Button } from '@shared/ui/button/Button'
import { Input } from '@shared/ui/Input'
import Image from 'next/image'
import { useState, useEffect, memo } from 'react'

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

    // const handleDownload = () => {
    //     window.open('/contract.docx', '_blank');
    // };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div
                className={`
                  relative hidden h-(--app-login-height) w-(--app-login-width)
                  flex-col items-center justify-center
                  md:flex
                `}
                style={{
                    backgroundImage:
                        'var(--app-login-background)',
                }}
            >
                <div
                    className={`
                      absolute flex h-190 w-122 flex-col items-center
                      justify-center rounded-2xl
                    `}
                    style={{
                        filter: 'var(--app-start-screen-shadow)',
                        backgroundImage:
                            'var(--app-login-start)',
                    }}
                >
                    <div
                        className={`
                          absolute flex h-152 w-90 flex-col items-center
                          justify-between gap-6
                        `}
                    >
                        <div className="relative flex h-17 w-90 items-center">
                            <button
                                onClick={onBack}
                                className={`
                                  absolute top-0 left-0 cursor-pointer
                                `}
                            >
                                <Image
                                    src="/images/login/back.svg"
                                    alt="Back"
                                    width={32}
                                    height={32}
                                    loading="eager"
                                />
                            </button>
                            <Image
                                src="/images/login/Logo.svg"
                                alt="Logo"
                                width={78}
                                height={70}
                                className={`mx-auto`}
                                loading="eager"
                            />
                        </div>
                        <div
                            className={`
                              flex h-126 w-90 flex-col items-center
                              justify-between gap-6
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
                                            : 'gray'
                                    }
                                    labelColor={
                                        nameError
                                            ? 'red'
                                            : 'gray'
                                    }
                                />

                                <Input
                                    label={
                                        nicknameUniqueError ||
                                        nicknameError ||
                                        'Введите никнейм'
                                    }
                                    placeholder=""
                                    value={nickname}
                                    onChange={
                                        handleNicknameChange
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
                                            : 'gray'
                                    }
                                    labelColor={
                                        nicknameUniqueError ||
                                        nicknameError
                                            ? 'red'
                                            : 'gray'
                                    }
                                />

                                <span className="text-[14px]">
                                    Нажимая на
                                    &quot;Зарегистрироваться&quot;,
                                    вы соглашаетесь с{' '}
                                    <span
                                        className={`
                                          text-(--color-accent-violet-primary)
                                        `}
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
                                    className="w-full"
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
