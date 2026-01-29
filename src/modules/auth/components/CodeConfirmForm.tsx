/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useState, useEffect, useRef } from 'react'
import { Input } from '@shared/ui/Input'
import Image from 'next/image'
import Modal from '@shared/ui/modal/Modal'
import { Button } from '@shared/ui/button/Button'
import SupportRequestForm from './SupportRequestForm'

interface CodeConfirmFormProps {
    phoneNumber: string
    onVerify: (code: string) => void
    onBack: () => void
    onResendCode: () => void
    loading: boolean
    error: string
    attempts: number
    isBlocked: boolean
    blockTime: number
}

export default function CodeConfirmForm({
    phoneNumber,
    onVerify,
    onBack,
    onResendCode,
    error,
    isBlocked,
    blockTime,
}: CodeConfirmFormProps) {
    const [code, setCode] = useState<string[]>([
        '',
        '',
        '',
        '',
        '',
    ])
    const inputRefs = useRef<(HTMLInputElement | null)[]>([
        null,
        null,
        null,
        null,
        null,
    ])
    const [timeLeft, setTimeLeft] = useState(60) // Таймер 60 сек
    const [showTooltip, setShowTooltip] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMessage, setModalMessage] = useState(
        'Не приходит код?',
    )
    const [
        showSupportRequestForm,
        setShowSupportRequestForm,
    ] = useState(false)

    const canResend = timeLeft === 0
    const modalOpenedRef = useRef(false) // Флаг для предотвращения повторного открытия модального окна

    // Таймер для ввода кода
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [timeLeft])

    // Открываем модальное окно при isBlocked (только один раз)
    useEffect(() => {
        console.log(
            'useEffect isBlocked triggered, isBlocked:',
            isBlocked,
        )
        if (isBlocked && !modalOpenedRef.current) {
            modalOpenedRef.current = true
            setModalMessage('Лимит исчерпан')
            setIsModalOpen(true)
        }
    }, [isBlocked])

    // Эффект для автоматического открытия модального окна при истечении срока (только один раз)
    useEffect(() => {
        if (
            timeLeft === 0 &&
            code.some((digit) => digit === '') &&
            !canResend &&
            !modalOpenedRef.current
        ) {
            console.log('useEffect expired triggered')
            modalOpenedRef.current = true
            setModalMessage('Срок действия кода истек')
            setIsModalOpen(true)
        }
    }, [timeLeft, code, canResend])

    // Таймер блокировки
    useEffect(() => {
        if (blockTime > 0) {
            const timer = setInterval(() => {}, 1000)
            return () => clearInterval(timer)
        }
    }, [blockTime])

    const handleInputChange = (
        index: number,
        value: string,
    ) => {
        if (value.length > 1) return
        const newCode = [...code]
        newCode[index] = value.replace(/\D/g, '')
        setCode(newCode)

        // Переход к следующему окошку
        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus()
        }

        // Если все цифры введены, автоматически верифицировать
        if (newCode.every((digit) => digit !== '')) {
            onVerify(newCode.join(''))
        }
    }

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (
            e.key === 'Backspace' &&
            !code[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleResendCode = () => {
        setTimeLeft(60) // Сброс таймера
        setCode(['', '', '', '', '']) // Очистка кода
        onResendCode()
    }

    // Открытие модального окна (для "Не приходит код?")
    const handleOpenModal = () => {
        setModalMessage('Не приходит код?')
        setIsModalOpen(true)
    }

    // Закрытие модального окна
    const handleCloseModal = () => {
        setIsModalOpen(false)
        modalOpenedRef.current = false // Сбрасываем флаг при закрытии
    }

    if (showSupportRequestForm) {
        return (
            <SupportRequestForm
                phoneNumber={phoneNumber}
                onBack={handleCloseModal}
            />
        )
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
                                onClick={onBack}
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
                                    Подтвердите вход
                                </p>
                            </div>
                            <div
                                className={`
                                  flex h-112 w-90 flex-col items-center
                                  justify-between gap-6
                                `}
                            >
                                <span className="text-center text-lg">
                                    Код подтверждения
                                    отправлен на следующий
                                    номер:{' '}
                                </span>
                                <span className="text-center text-lg font-bold">
                                    {phoneNumber}
                                </span>
                                <div
                                    className={`
                                      flex flex-row items-center gap-1
                                    `}
                                >
                                    <span
                                        className={`
                                          text-center text-lg font-bold
                                        `}
                                    >
                                        Введите код
                                    </span>
                                    <Image
                                        src="/images/login/information.svg"
                                        alt="information"
                                        width={24}
                                        height={24}
                                        className="mx-auto cursor-pointer"
                                        onMouseEnter={() =>
                                            setShowTooltip(
                                                true,
                                            )
                                        }
                                        onMouseLeave={() =>
                                            setShowTooltip(
                                                false,
                                            )
                                        }
                                    />

                                    {showTooltip && (
                                        <>
                                            <div
                                                className={`
                                                  absolute top-35 left-1/2 z-10
                                                  h-34 w-83 -translate-x-1/2
                                                  transform rounded-2xl
                                                  bg-accent-violet-dark p-2
                                                  text-white
                                                `}
                                            >
                                                <p className="text-base">
                                                    Код
                                                    должен
                                                    содержать
                                                    только
                                                    цифры,
                                                    длина —
                                                    5
                                                    символов.
                                                </p>
                                                <p className="text-base">
                                                    Не более
                                                    10
                                                    запросов
                                                    кода в
                                                    час. При
                                                    превышении
                                                    —
                                                    блокировка
                                                    номера
                                                    на 60
                                                    минут.
                                                </p>
                                            </div>
                                            <div
                                                className="absolute z-10"
                                                style={{
                                                    top: '276px',
                                                    left: 'calc(50% - 52px)',
                                                    width: '48px',
                                                    height: '18px',
                                                    borderTop:
                                                        '18px solid var(--color-accent-violet-dark)',
                                                    borderLeft:
                                                        '24px solid transparent',
                                                    borderRight:
                                                        '24px solid transparent',
                                                }}
                                            ></div>
                                        </>
                                    )}
                                </div>
                                {error && (
                                    <span
                                        className={`
                                          text-center text-sm text-red-500
                                        `}
                                    >
                                        {error}
                                    </span>
                                )}

                                <div className="flex justify-center gap-2">
                                    {code.map(
                                        (digit, index) => (
                                            <Input
                                                key={index}
                                                ref={(
                                                    el,
                                                ) => {
                                                    inputRefs.current[
                                                        index
                                                    ] = el
                                                }}
                                                type="text"
                                                value={
                                                    digit
                                                }
                                                onChange={(
                                                    e,
                                                ) =>
                                                    handleInputChange(
                                                        index,
                                                        e
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                onKeyDown={(
                                                    e,
                                                ) =>
                                                    handleKeyDown(
                                                        index,
                                                        e,
                                                    )
                                                }
                                                className={`
                                                  h-15 w-15 rounded-lg border
                                                  border-accent-violet-primary
                                                  bg-transparent text-center
                                                  text-lg
                                                  focus:border-4
                                                  focus:border-accent-violet-primary
                                                  focus:outline-none
                                                `}
                                                maxLength={
                                                    1
                                                }
                                                disabled={
                                                    isBlocked
                                                }
                                            />
                                        ),
                                    )}
                                </div>

                                {!canResend && (
                                    <span className="text-center text-lg">
                                        Отправить новый код
                                        через:{' '}
                                        {Math.floor(
                                            timeLeft / 60,
                                        )}
                                        :
                                        {(timeLeft % 60)
                                            .toString()
                                            .padStart(
                                                2,
                                                '0',
                                            )}
                                    </span>
                                )}

                                {canResend && (
                                    <div
                                        className={`
                                          flex flex-col items-center gap-2
                                        `}
                                    >
                                        <span
                                            className={`
                                              cursor-pointer text-center text-lg
                                              font-bold
                                              text-(--color-system-red)
                                            `}
                                            onClick={
                                                handleResendCode
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
                                                    handleResendCode()
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                        >
                                            Отправить новый
                                            код
                                        </span>
                                    </div>
                                )}
                                <span
                                    className={`
                                      cursor-pointer text-center text-lg
                                      font-bold text-accent-violet-primary
                                      hover:underline
                                    `}
                                    onClick={
                                        handleOpenModal
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key ===
                                                'Enter' ||
                                            e.key === ' '
                                        ) {
                                            e.preventDefault()
                                            handleResendCode()
                                        }
                                    }}
                                    tabIndex={0}
                                    role="button"
                                >
                                    Не приходит код?
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title=""
                descriptionColor="muted"
                titleAlign="center"
            >
                <div className="text-center text-lg text-[24px] font-bold">
                    {modalMessage}
                </div>

                <Button
                    variant="solid"
                    size="lg"
                    color="primary"
                    className="w-full"
                    onClick={() => {
                        setShowSupportRequestForm(true)
                    }}
                >
                    Обратиться в поддержку
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    color="primary"
                    className="w-full"
                    onClick={handleCloseModal}
                >
                    Назад
                </Button>
            </Modal>
        </div>
    )
}
