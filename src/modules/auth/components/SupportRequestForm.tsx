/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import { Button } from '@shared/ui/button/Button'
import { Input } from '@shared/ui/Input'
import Modal from '@shared/ui/modal/Modal'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Cookies from 'js-cookie'
import Textarea from '@shared/ui/textarea/Textarea'
import CodeConfirmForm from './CodeConfirmForm'
import SuccessSupport from './SuccessSupport'

interface SupportRequestFormProps {
    phoneNumber: string
    onBack: () => void
}

export default function SupportRequestForm({
    phoneNumber,
    onBack,
}: SupportRequestFormProps) {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [emailError, setEmailError] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const [showSuccessSupport, setShowSuccessSupport] =
        useState(false)

    // проверка: email
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
    )
    const showEmailError = email.length > 0 && !isEmailValid

    const handleEmailChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value
        setEmail(value)
        // обновлять ошибку в реальном времени
        if (
            value &&
            value.length > 0 &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
            setEmailError('Некорректный email')
        } else {
            setEmailError('')
        }
    }

    const handleBackToForm = () => {
        router.push('/auth/login')
    }

    const handleEmailBlur = () => {
        if (showEmailError) {
            setEmailError('Некорректный email')
        }
    }
    const handleDownload = () => {
        window.open('/listSolutions.pdf', '_blank')
    }
    const handleSubmit = () => {
        setShowSuccessSupport(true)
    }

    // const handleSubmit = async () => {

    //     setLoading(true)
    //     try {
    //         const response = await fetch('/api/support/request', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ phoneNumber, email, message }),
    //         })
    //         if (response.ok) {
    //             alert('Запрос отправлен. Мы свяжемся с вами.')
    //             router.push('/auth/login') // Или onBack()
    //         } else {
    //             setEmailError('Ошибка отправки. Попробуйте позже.')
    //         }
    //     } catch (err) {
    //         setEmailError('Ошибка сети.')
    //     } finally {
    //         setLoading(false)
    //     }
    // }
    if (showSuccessSupport) {
        return <SuccessSupport onBack={onBack} />
    }

    return (
        <>
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
                                        handleBackToForm
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
                                        Служба поддержки
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
                                                emailError
                                                    ? 'Некорректный e-mail'
                                                    : 'Укажите ваш e-mail'
                                            }
                                            labelColor={
                                                emailError
                                                    ? 'red'
                                                    : 'gray'
                                            }
                                            placeholder="@mail.ru"
                                            borderColor={
                                                emailError
                                                    ? 'red'
                                                    : 'gray'
                                            }
                                            color={
                                                emailError
                                                    ? 'red'
                                                    : 'gray'
                                            }
                                            inputSize="lg"
                                            value={email}
                                            onChange={
                                                handleEmailChange
                                            }
                                            onBlur={
                                                handleEmailBlur
                                            }
                                        />
                                    </div>

                                    <div className="flex w-full flex-col gap-1">
                                        <Textarea
                                            // resize-none
                                            label={
                                                'Опишите Вашу проблему'
                                            }
                                            placeholder=""
                                            borderColor="gray"
                                            textColor="gray"
                                            value={message}
                                            onChange={(e) =>
                                                setMessage(
                                                    e.target
                                                        .value,
                                                )
                                            }
                                        />
                                    </div>

                                    <span
                                    // className={`text-[14px]`}
                                    >
                                        Ознакомьтесь со{' '}
                                        <span
                                            className={`
                                          cursor-pointer
                                          text-(--color-accent-violet-primary)
                                          hover:underline
                                        `}
                                            onClick={() =>
                                                handleDownload()
                                            }
                                            onKeyDown={(
                                                e,
                                            ) => {
                                                if (
                                                    e.key ===
                                                        'Enter' ||
                                                    e.key ===
                                                        ' '
                                                ) {
                                                    e.preventDefault()
                                                    handleDownload()
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                        >
                                            списком
                                            известных
                                            проблем <br />и
                                            их решениями
                                        </span>
                                    </span>

                                    <Button
                                        variant="solid"
                                        size="lg"
                                        color={
                                            isEmailValid
                                                ? 'primary'
                                                : 'light-gray'
                                        }
                                        className={`w-full`}
                                        onClick={
                                            handleSubmit
                                        }
                                        disabled={
                                            !!emailError
                                        }
                                    >
                                        Отправить
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
