'use client'
import { Button } from '@shared/ui/button/Button'
import { Input } from '@shared/ui/Input'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface RegisterFormProps {
    phoneNumber: string
    onSubmit: (data: {
        name: string
        nickname: string
    }) => void
    onBack: () => void
}

export default function RegisterForm({
    onSubmit,
    onBack,
}: RegisterFormProps) {
    const [name, setName] = useState('')
    const [nickname, setNickname] = useState('')
    const [nameError, setNameError] = useState('')
    const [nicknameError, setNicknameError] = useState('')
    const [nicknameUniqueError, setNicknameUniqueError] =
        useState('')
    const [debouncedNickname, setDebouncedNickname] =
        useState('')
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
            nicknameValidationRegex.test(debouncedNickname)
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
                        // Обрабатываем 200 OK и 400 Bad Request одинаково: парсим тело на ошибки
                        const data = await response.json()
                        if (
                            data.nickname &&
                            Array.isArray(data.nickname) &&
                            data.nickname.length > 0
                        ) {
                            // Устанавливаем ошибку на основе ответа бэка (первое сообщение из массива)
                            // Или жестко задаём ваше сообщение, если хотите унифицировать
                            setNicknameUniqueError(
                                'данный никнейм занят другим пользователем',
                            )
                        } else {
                            // Если ошибок нет, сбрасываем
                            setNicknameUniqueError('')
                        }
                    } else {
                        // Для других не-OK статусов (например, 500)
                        setNicknameUniqueError(
                            'Не удалось проверить уникальность никнейма',
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
                }
            }
            checkUnique()
        } else {
            setNicknameUniqueError('')
        }
    }, [debouncedNickname, nicknameValidationRegex])

    const handleNameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value
        if (value.length > 30) return
        if (nameValidationRegex.test(value)) {
            setName(value)
            setNameError('')
        } else {
            setNameError(
                'используйте только буквы, пробел или тире',
            )
        }
    }

    const handleNicknameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value
        if (value.length > 30) return
        if (nicknameValidationRegex.test(value)) {
            setNickname(value)
            setNicknameError('')
        } else {
            setNicknameError(
                'используйте только буквы, цифры, точку или подчеркивание',
            )
        }
    }

    const handleSubmit = () => {
        if (
            name &&
            nickname &&
            !nameError &&
            !nicknameError &&
            !nicknameUniqueError
        ) {
            onSubmit({ name, nickname })
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
                                        // Новый проп: красный если ошибка
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
                                        // Новый проп: красный если ошибка
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
                                    color="light-gray"
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
}
