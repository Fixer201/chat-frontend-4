'use client'

import { FormEvent, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import Input from '@shared/ui/Input'
import Textarea from '@shared/ui/Textarea'
import { Button } from '@shared/ui/button/Button'

const INVALID_EMAIL_MESSAGE = 'Некорректный e-mail'

export default function SupportForm() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [touchedEmail, setTouchedEmail] = useState(false)

    const isEmailValid = useMemo(() => {
        if (!email.trim()) return false
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email.trim())
    }, [email])

    const isSubmitDisabled =
        !isEmailValid || message.trim() === ''

    const showEmailError = touchedEmail && !isEmailValid

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()
        if (isSubmitDisabled) return
        setIsSubmitted(true)
        setEmail('')
        setMessage('')
        setTouchedEmail(false)
    }

    const handleEmailBlur = () => {
        if (!touchedEmail) {
            setTouchedEmail(true)
        }
    }

    return (
        <div
            className={`
              flex h-full flex-col overflow-y-auto rounded-md bg-gray-main
            `}
        >
            <header
                className={`
                  flex items-center justify-start gap-3 rounded-t-md border-b
                  border-gray-200 bg-gray-main px-6 py-4
                `}
            >
                <button
                    type="button"
                    onClick={() => router.push('/settings')}
                    className={`
                      flex items-center justify-center rounded-full
                      text-text-black transition-colors
                    `}
                    aria-label="Вернуться к настройкам"
                >
                    <BackIcon className="mx-1 cursor-pointer" />
                </button>
                <h2
                    className={`
                  text-lg font-medium tracking-[0.01em] text-text-black
                `}
                >
                    Обращение в поддержку
                </h2>
            </header>

            <div className="flex flex-1 flex-col gap-5 px-4 pt-4 pb-6">
                {isSubmitted ? (
                    <div
                        className={`
                          flex flex-1 flex-col items-center justify-center gap-2
                          text-center
                        `}
                    >
                        <span
                            className={`
                              flex h-24 w-24 items-center justify-center
                              rounded-full
                            `}
                        >
                            <Image
                                src="/images/Check.svg"
                                alt="Обращение отправлено"
                                width={66}
                                height={66}
                            />
                        </span>
                        <div className="flex flex-col gap-6">
                            <h1
                                className={`
                              text-[24px] font-medium text-text-black
                            `}
                            >
                                Обращение отправлено!
                            </h1>
                            <p className="px-4 text-lg text-text-black">
                                В ближайшее время вы
                                получите ответ на
                                электронную почту, указанную
                                в обращении
                            </p>
                        </div>
                    </div>
                ) : (
                    <form
                        className="flex flex-1 flex-col gap-4"
                        onSubmit={handleSubmit}
                    >
                        <label
                            htmlFor="support-email"
                            className={`
                              flex flex-col gap-1 text-sm text-text-gray
                            `}
                        >
                            <span
                                className={
                                    showEmailError
                                        ? 'text-(--color-system-red)'
                                        : undefined
                                }
                            >
                                {showEmailError
                                    ? INVALID_EMAIL_MESSAGE
                                    : 'Укажите Ваш e-mail'}
                            </span>
                            <Input
                                id="support-email"
                                type="email"
                                placeholder="e-mail"
                                isInvalid={showEmailError}
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value,
                                    )
                                }
                                onBlur={handleEmailBlur}
                            />
                        </label>

                        <label
                            htmlFor="support-message"
                            className={`
                              flex flex-col gap-1 text-sm text-text-gray
                            `}
                        >
                            <span>
                                Опишите Вашу проблему
                            </span>
                            <Textarea
                                id="support-message"
                                placeholder=""
                                rows={10}
                                value={message}
                                onChange={(event) =>
                                    setMessage(
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <p className="text-sm text-text-gray">
                            Ознакомьтесь со{' '}
                            <Link
                                href="#"
                                className={`
                                  text-accent-violet-primary
                                  hover:text-accent-violet-dark
                                `}
                            >
                                списком известных проблем и
                                их решениями.
                            </Link>
                        </p>

                        <div className="mt-auto flex">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isSubmitDisabled}
                                className={`w-full text-lg font-medium`}
                            >
                                Отправить
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
