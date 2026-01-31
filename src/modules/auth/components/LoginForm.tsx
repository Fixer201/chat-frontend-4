/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import { Button } from '@shared/ui/button/Button'
import { Input } from '@shared/ui/Input'
import Modal from '@shared/ui/modal/Modal'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import CodeConfirmForm from './CodeConfirmForm'
import RegisterForm from './RegisterForm'
import SuccessRegister from './SuccessRegister'
import Cookies from 'js-cookie'

export default function LoginForm() {
    const router = useRouter()
    const [phoneNumber, setPhoneNumber] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const [attempts, setAttempts] = useState(0)
    const [isBlocked, setIsBlocked] = useState(false)
    const [blockTime, setBlockTime] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showCodeForm, setShowCodeForm] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showLoginForm, setShowLoginForm] =
        useState(false)
    const [showSuccessRegister, setShowSuccessRegister] =
        useState(false)

    const handleStartClick = () => {
        router.push('/auth/login')
    }

    //формат номера
    const handleInput = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const input = e.target.value.replace(/\D/g, '')
        const length = input.length
        if (length === 0) {
            setPhoneNumber('')
            return
        }
        // Форматирование: +7 (999) 999-99-99
        let formatted = '+7 '
        if (length > 1) {
            formatted += '(' + input.substring(1, 4)
        }
        if (length >= 5) {
            formatted += ') ' + input.substring(4, 7)
        }
        if (length >= 8) {
            formatted += ' ' + input.substring(7, 9)
        }
        if (length >= 10) {
            formatted += ' ' + input.substring(9, 11)
        }
        setPhoneNumber(formatted)
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(
                    formatted.length,
                    formatted.length,
                )
            }
        }, 0)
    }

    const handleFocus = () => {
        // устанавка курсора
        setTimeout(() => {
            if (inputRef.current) {
                const position =
                    phoneNumber.length > 2 ? 3 : 2
                inputRef.current.setSelectionRange(
                    position,
                    position,
                )
            }
        }, 0)
    }

    // проверка: введено ли +7 + 10 цифр (всего 11 цифр: 7 + 10)
    const isPhoneValid =
        phoneNumber.replace(/\D/g, '').length === 11
    const showError =
        phoneNumber.length > 2 && !isPhoneValid

    // открытие модального окна
    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    // закрытие модального окна
    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    // отправка кода на телефон
    const handleSendCode = async () => {
        setLoading(true)
        setError('')

        const requestBody = {
            phone_number: `+${phoneNumber.replace(/\D/g, '')}`,
        }
        console.log('Отправка запроса:', requestBody)

        try {
            const response = await fetch(
                '/api/auth/send-code',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                },
            )
            const data = await response.json()
            console.log('Ответ:', response.status, data)
            if (response.ok) {
                setIsModalOpen(false)
                setShowCodeForm(true)
            } else {
                setError(
                    'Ошибка отправки кода. Попробуйте позже.',
                )
            }
        } catch (err) {
            setError('Ошибка сети. Проверьте подключение.')
            console.error('Fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Функция для проверки профиля и навигации
    const checkProfileAndNavigate = async () => {
        const accessToken = Cookies.get('access_token')
        if (!accessToken) {
            console.error('Access token не найден')
            setShowLoginForm(true) // Если токена нет, показать регистрацию
            return
        }
        try {
            const response = await fetch(
                '/api/auth/profile',
                {
                    method: 'POST', // Измените на GET для получения профиля
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({}), // Пустое тело для проверки
                },
            )

            if (response.ok) {
                const profileData = await response.json()

                // Проверка на заполненность профиля (is_filled из API)
                if (profileData && profileData.is_filled) {
                    // Профиль заполнен — переход на контакты (вход)
                    Cookies.set(
                        'user_profile',
                        JSON.stringify(profileData),
                        { expires: 7 },
                    )
                    router.push('/contacts')
                } else {
                    // Профиль не заполнен — показать регистрацию
                    setShowLoginForm(true)
                }
            } else if (response.status === 404) {
                setShowLoginForm(true) // Профиль не найден (404)
            } else {
                console.error(
                    'Ошибка получения профиля:',
                    response.status,
                )
                setShowLoginForm(true) // В случае других ошибок — регистрация
            }
        } catch (err) {
            console.error('Ошибка проверки профиля:', err)
            setShowLoginForm(true) // Ошибка сети — регистрация
        }
    }

    // функция верификации кода и получения токенов
    const handleVerifyCode = async (code: string) => {
        if (isBlocked) return
        setLoading(true)
        setError('')
        const requestBody = {
            phone_number: `+${phoneNumber.replace(/\D/g, '')}`,
            code: code,
        }
        console.log(
            'Отправка запроса на верификацию:',
            requestBody,
        )
        try {
            const response = await fetch(
                '/api/auth/verify-code',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                },
            )

            const data = await response.json()
            console.log(
                'Ответ на верификацию:',
                response.status,
                data,
            )
            if (response.ok) {
                // Сохраняем токены в cookies (срок жизни 7 дней для access, 30 для refresh)
                Cookies.set('access_token', data.access, {
                    expires: 7,
                })
                Cookies.set('refresh_token', data.refresh, {
                    expires: 30,
                })
                // Проверяем профиль и навигируем
                await checkProfileAndNavigate()
            } else {
                setAttempts((prev) => prev + 1)
                if (attempts + 1 >= 5) {
                    setIsBlocked(true)
                    setBlockTime(
                        attempts + 1 >= 10 ? 3600 : 600,
                    )
                }
                setError(
                    data.message ||
                        'Неверный код. Попробуйте снова.',
                )
            }
        } catch (err) {
            setError('Ошибка сети. Проверьте подключение.')
            console.error('Verify error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Функция для повторной отправки кода
    const handleResendCode = async () => {
        // Повтор handleSendCode
        await handleSendCode()
    }

    // Функция для обработки данных из RegisterForm
    const handleLoginSubmit = async (data: {
        name: string
        nickname: string
    }) => {
        console.log('Личные данные:', data)
        setLoading(true)
        setError('')
        // const csrfToken = document.cookie
        //     .split('; ')
        //     .find((row) => row.startsWith('csrftoken='))
        //     ?.split('=')[1]
        const accessToken =
            // localStorage.getItem('access_token')
            Cookies.get('access_token')
        const apiKey = process.env.NEXT_PUBLIC_API_KEY
        const url = apiKey
            ? `https://api.test.chat.ktsf.ru/api/v1/auth/messenger/profile/?api_key=${apiKey}`
            : 'https://api.test.chat.ktsf.ru/api/v1/auth/messenger/profile/'
        try {
            const response = await fetch(
                '/api/auth/profile',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(accessToken && {
                            Authorization: `Bearer ${accessToken}`,
                        }),
                    },
                    body: JSON.stringify({
                        nickname: data.nickname,
                        first_name: data.name,
                    }),
                },
            )

            let responseData
            try {
                responseData = await response.json()
            } catch {
                responseData = {}
            }

            console.log(
                'Response:',
                response.status,
                responseData,
            )

            if (response.ok) {
                setShowSuccessRegister(true) // показать SuccessRegister
            } else {
                const errorMessage =
                    responseData.nickname?.[0] ||
                    'Ошибка регистрации. Попробуйте позже.'
                throw new Error(errorMessage)
            }
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Таймер блокировки
    useEffect(() => {
        if (blockTime > 0) {
            const timer = setInterval(() => {
                setBlockTime((prev) => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        } else {
            setIsBlocked(false)
        }
    }, [blockTime])

    const handleBackToForm = () => setShowCodeForm(false)

    if (showSuccessRegister) {
        return <SuccessRegister />
    }

    if (showLoginForm) {
        return (
            <RegisterForm
                phoneNumber={phoneNumber}
                onSubmit={handleLoginSubmit}
                onBack={() => setShowLoginForm(false)}
            />
        )
    }

    if (showCodeForm) {
        return (
            <CodeConfirmForm
                phoneNumber={phoneNumber}
                onVerify={handleVerifyCode}
                onBack={handleBackToForm}
                onResendCode={handleResendCode}
                loading={loading}
                error={error}
                attempts={attempts}
                isBlocked={isBlocked}
                blockTime={blockTime}
            />
        )
    }

    return (
        <>
            <div className="flex min-h-screen items-center justify-center">
                <div
                    className={`
            relative hidden h-screen w-(--app-login-width)
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
              absolute flex flex-col items-center justify-between
              gap-6
            `}
                        >
                            <div className="relative flex h-17 w-90 items-center">
                                <Image
                                    src="/images/login/back.svg"
                                    alt="Back"
                                    width={32}
                                    height={32}
                                    className="absolute top-0 left-0 cursor-pointer"
                                    loading="eager"
                                    onClick={
                                        handleStartClick
                                    }
                                />
                                <Image
                                    src="/images/login/Logo.svg"
                                    alt="Logo"
                                    width={78}
                                    height={70}
                                    className="mx-auto"
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
                                        Вход/регистрация
                                    </p>
                                </div>
                                <div
                                    className={`
                  flex h-112 w-90 flex-col items-center justify-between
                `}
                                >
                                    <div className="flex w-full flex-col gap-1">
                                        <Input
                                            ref={inputRef}
                                            label={
                                                showError
                                                    ? 'Некорректный номер'
                                                    : isPhoneValid
                                                      ? 'Измените номер'
                                                      : 'Введите номер телефона'
                                            }
                                            labelColor={
                                                showError
                                                    ? 'red'
                                                    : 'gray'
                                            }
                                            placeholder="+7 900 000 00 00"
                                            borderColor={
                                                showError
                                                    ? 'red'
                                                    : 'gray'
                                            }
                                            textColor="gray"
                                            inputSize="lg"
                                            value={
                                                phoneNumber
                                            }
                                            onChange={
                                                handleInput
                                            }
                                            onFocus={
                                                handleFocus
                                            }
                                        />
                                    </div>
                                    <Button
                                        variant="solid"
                                        size="md"
                                        color={
                                            isPhoneValid
                                                ? 'primary'
                                                : 'light-gray'
                                        }
                                        className={`w-full`}
                                        onClick={
                                            handleOpenModal
                                        }
                                        disabled={
                                            !!showError ||
                                            phoneNumber ===
                                                ''
                                        }
                                    >
                                        Далее
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title={`${phoneNumber}`}
                description="Номер телефона указан верно? "
                descriptionColor="muted"
                titleAlign="left"
                buttons={[
                    {
                        label: 'Изменить',
                        variant: 'ghost',
                        color: 'primary',
                        onClick: handleCloseModal,
                    },
                    {
                        label: 'Верно',
                        variant: 'primary',
                        color: 'primary',
                        onClick: handleSendCode,
                        disabled: loading,
                    },
                ]}
            />
        </>
    )
}
