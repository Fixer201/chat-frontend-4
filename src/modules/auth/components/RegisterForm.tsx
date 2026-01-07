/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import { Button } from '@shared/ui/button/Button'
import { Input } from '@shared/ui/Input'
import Image from 'next/image'
import { useState } from 'react'

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
    const validationRegex = /^[а-яА-Яa-zA-Z\s\-]*$/

    const handleNameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value
        if (value.length > 30) return
        if (validationRegex.test(value)) {
            setName(value)
            setNameError('') // ввели корректно - очистка ошибки
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
        if (validationRegex.test(value)) {
            setNickname(value)
            setNicknameError('') // ввели корректно - очистка ошибки
        } else {
            setNicknameError(
                'используйте только буквы, пробел или тире',
            )
        }
    }

    const handleSubmit = () => {
        if (name && nickname) {
            onSubmit({ name, nickname })
            // отправить на бэкенд
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
        relative hidden h-(--app-login-height) w-(--app-login-width) flex-col
        items-center justify-center
        md:flex
      `}
                style={{
                    backgroundImage:
                        'var(--app-login-background)',
                }}
            >
                <div
                    className={`
          absolute flex h-190 w-122 flex-col items-center justify-center
          rounded-2xl
        `}
                    style={{
                        filter: 'var(--app-start-screen-shadow)',
                        backgroundImage:
                            'var(--app-login-start)',
                    }}
                >
                    <div
                        className={`
            absolute flex w-full flex-col items-center justify-between gap-6
          `}
                    >
                        <div className="relative flex w-full items-center">
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
                                className={`
                mx-auto
              `}
                                loading="eager"
                            />
                        </div>
                        <div
                            className={`
              flex h-126 w-90 flex-col items-center justify-between gap-6
            `}
                        >
                            <div className="flex w-90 items-center justify-center">
                                <p className="text-center text-[32px] font-bold">
                                    Личная информация
                                </p>
                            </div>
                            <div
                                className={`
                flex h-112 w-90 flex-col items-center justify-between
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
                                />
                                <Input
                                    label={
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
                                    color="neutral"
                                    className="w-full"
                                    onClick={handleSubmit}
                                    disabled={
                                        !name.trim() ||
                                        !nickname.trim()
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
