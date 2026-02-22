'use client'
import { Button } from '@shared/ui/button/Button'
import { Input } from '@shared/ui/Input'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import Textarea from '@shared/ui/textarea/Textarea'
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
    const [loading, setLoading] = useState(false)
    const [emailError, setEmailError] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const [showSuccessSupport, setShowSuccessSupport] =
        useState(false)

    // Валидация email: Регулярное выражение проверяет формат email.
    // isEmailValid: true, если email соответствует формату.
    // showEmailError: true, если email введен, но невалиден.
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
    )
    const showEmailError = email.length > 0 && !isEmailValid

    // Обработчик изменения email: Обновляет состояние и валидирует в реальном времени.
    // Устанавливает emailError, если email невалиден.
    const handleEmailChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value
        setEmail(value)
        // Обновляем ошибку в реальном времени для лучшего UX.
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

    // Обработчик возврата: Переходит на '/auth/login'.
    // Используется для кнопки "назад".
    const handleBackToForm = () => {
        router.push('/auth/login')
    }

    // Обработчик потери фокуса email: Устанавливает ошибку, если email невалиден.
    // Вызывается при onBlur для финальной проверки.
    const handleEmailBlur = () => {
        if (showEmailError) {
            setEmailError('Некорректный email')
        }
    }

    // Обработчик скачивания PDF: Открывает файл в новой вкладке.
    // Используется для ссылки на "список известных проблем".
    const handleDownload = () => {
        window.open('/listSolutions.pdf', '_blank')
    }

    // Обработчик отправки формы: Отправляет данные на API.
    // Устанавливает loading, обрабатывает ответ, показывает успех или ошибку.
    // В finally всегда показывает успех (как указано в комментарии, поскольку бэкенд не реализован).
    const handleSubmit = async () => {
        setLoading(true)
        try {
            const response = await fetch(
                '/api/support/request',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phoneNumber,
                        email,
                        message,
                    }),
                },
            )
            if (response.ok) {
                alert(
                    'Запрос отправлен. Мы свяжемся с вами.',
                )
                router.push('/auth/login') // Или onBack()
            } else {
                setEmailError(
                    'Ошибка отправки. Попробуйте позже.',
                )
            }
        } catch (error) {
            setEmailError('Ошибка сети.')
        } finally {
            setLoading(false)
            // В любом случае появляется успех отправки, так как не реализовано на бэкенде.
            setShowSuccessSupport(true)
        }
    }

    // Условный рендер: Если showSuccessSupport true, показываем SuccessSupport.
    // Иначе рендерим форму.
    if (showSuccessSupport) {
        return <SuccessSupport onBack={onBack} />
    }

    // Возврат JSX: Рендер формы.
    // Используем Tailwind CSS для адаптивного дизайна.
    return (
        <>
            {/* Внешний контейнер: Центрирует контент по экрану.
            min-h-screen: Минимальная высота экрана для центрирования. */}
            <div className="flex min-h-screen items-center justify-center">
                {/* Внутренний контейнер: Полноэкранный на мобильке, с фоном на десктопе.
                w-(--app-login-width): Кастомная ширина из CSS-переменных. */}
                <div
                    className={`
                      relative flex h-screen w-(--app-login-width) flex-col
                      items-center justify-center bg-none
                      md:bg-app-login-background
                    `}
                >
                    {/* Контейнер формы: Белый фон на мобильке, модальное окно на десктопе.
                    Изменение: justify-start заменено на justify-center для мобильки, чтобы центрировать контент вертикально и предотвратить "съезжание вниз".
                    На десктопе md:justify-center уже есть, так что не трогаем. */}
                    <div
                        className={`
                          flex flex-col items-center justify-center gap-4
                          bg-white
                          md:absolute md:h-190 md:w-122 md:flex-col
                          md:items-center md:justify-center md:rounded-2xl
                          md:bg-app-login-start
                          md:filter-app-start-screen-shadow
                        `}
                    >
                        {/* Абсолютный контейнер для элементов: Распределяет заголовок, форму и кнопку.
                        gap-4 на мобильке, md:gap-6 на десктопе. */}
                        <div
                            className={`
                              absolute flex flex-col items-center
                              justify-between gap-4
                              md:justify-between md:gap-6
                            `}
                        >
                            {/* Заголовок с кнопкой назад и логотипом.
                            justify-between на мобильке, md:justify-center на десктопе. */}
                            <div
                                className={`
                                  relative flex h-17 w-90 items-center
                                  justify-between
                                  md:justify-center
                                `}
                            >
                                {/* Кнопка назад: Изображение с onClick для навигации. */}
                                <Image
                                    src="/images/login/back.svg"
                                    alt="Back"
                                    width={32}
                                    height={32}
                                    className={`
                                      absolute top-0 left-0 cursor-pointer
                                    `}
                                    loading="eager"
                                    onClick={
                                        handleBackToForm
                                    }
                                />
                                {/* Логотип: Центрирован на десктопе, справа на мобильке. */}
                                <Image
                                    src="/images/login/Logo.svg"
                                    alt="Logo"
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
                            {/* Основной контент: Заголовок и форма. */}
                            <div
                                className={`
                                  flex h-126 w-90 flex-col items-center
                                  justify-between gap-6
                                `}
                            >
                                {/* Заголовок формы. */}
                                <div
                                    className={`
                                      flex w-90 items-center justify-center
                                    `}
                                >
                                    <p
                                        className={`
                                          text-center text-[32px] font-bold
                                        `}
                                    >
                                        Служба поддержки
                                    </p>
                                </div>
                                {/* Форма: Поля ввода, ссылка и кнопка. */}
                                <div
                                    className={`
                                      flex h-112 w-90 flex-col items-center
                                      justify-between
                                    `}
                                >
                                    {/* Поле email: С валидацией и ошибками. */}
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

                                    {/* Поле сообщения: Textarea для описания проблемы. */}
                                    <div className="flex w-full flex-col gap-1">
                                        <Textarea
                                            label="Опишите Вашу проблему"
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

                                    {/* Ссылка на скачивание PDF: Интерактивная, с клавиатурной поддержкой. */}
                                    <span>
                                        Ознакомьтесь со{' '}
                                        <span
                                            className={`
                                              cursor-pointer
                                              text-(--color-accent-violet-primary)
                                              hover:underline
                                            `}
                                            onClick={
                                                handleDownload
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

                                    {/* Кнопка отправки: Активна только при валидном email. */}
                                    <Button
                                        variant="solid"
                                        size="lg"
                                        color={
                                            isEmailValid
                                                ? 'primary'
                                                : 'light-gray'
                                        }
                                        className="w-full"
                                        onClick={
                                            handleSubmit
                                        }
                                        disabled={
                                            !!emailError ||
                                            email === ''
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
