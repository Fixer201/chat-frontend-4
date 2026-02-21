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
import useIsMobile from '@shared/hooks/useIsMobile'
// Компонент формы входа/регистрации
// Основной компонент, управляющий состоянием всего процесса аутентификации.
// Состояние меняется от ввода телефона -> подтверждения кода -> заполнения профиля -> успеха.
export default function LoginForm() {
    const router = useRouter()

    // Состояние: номер телефона (отформатированная строка)
    // Храним отформатированную строку, чтобы не форматировать при каждом рендере,
    // хотя для value в инпуте можно использовать и сырые данные, форматируя при выводе.
    const [phoneNumber, setPhoneNumber] = useState('')

    // Ссылка на DOM-элемент инпута
    // Нужен для программной установки курсора (каретки) в нужную позицию
    const inputRef = useRef<HTMLInputElement>(null)

    // Логика блокировки (Rate Limiting)
    // attempts: количество неудачных попыток ввода кода.
    const [attempts, setAttempts] = useState(0)

    // isBlocked: флаг, указывающий, заблокирован ли пользователь из-за частых ошибок.
    const [isBlocked, setIsBlocked] = useState(false)

    // blockTime: оставшееся время блокировки в секундах.
    const [blockTime, setBlockTime] = useState(0)

    // Состояния загрузки и ошибок
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // showCodeForm: показать форму ввода SMS-кода.
    const [showCodeForm, setShowCodeForm] = useState(false)

    // isModalOpen: показать модальное окно подтверждения номера.
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showLoginForm, setShowLoginForm] =
        useState(false)

    // showSuccessRegister: финальный экран после успешного заполнения профиля.
    const [showSuccessRegister, setShowSuccessRegister] =
        useState(false)

    // Определение мобильного режима (ширина ≤768px)
    // Передается в стили для скрытия тяжелых фоновых изображений на телефонах.
    const isMobile = useIsMobile()

    // Обработчик кнопки "Назад" (на главном экране ввода телефона)
    // Перенаправляет пользователя на страницу выбора способа входа
    const handleStartClick = () => {
        router.push('/auth/login')
    }

    // Форматирование номера телефона
    // Логика: Мы принимаем только цифры, отбрасывая весь мусор (\D),
    // а затем собираем строку в формате +7 (999) 999-99-99.
    // ВАЖНО: Этот код жестко заточен под российские номера (+7).
    const handleInput = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        // 1. Удаляем все нечисловые символы
        const input = e.target.value.replace(/\D/g, '')

        // Получаем длину "чистых" цифр
        const length = input.length

        // Если пользователь стер все цифры - сбрасываем состояние
        if (length === 0) {
            setPhoneNumber('')
            return
        }

        // Формируем строку: всегда начинаем с +7

        let formatted = '+7 '

        // Добавляем код оператора (3 цифры после +7)
        // input.substring(1, 4) берет цифры со 2-й по 4-ю (пропускаем '7' в начале)
        if (length > 1) {
            formatted += '(' + input.substring(1, 4)
        }

        // Добавляем первые 3 цифры номера
        if (length >= 5) {
            formatted += ') ' + input.substring(4, 7)
        }

        // Добавляем следующие 2 цифры
        if (length >= 8) {
            formatted += ' ' + input.substring(7, 9)
        }

        // Добавляем последние 2 цифры
        if (length >= 10) {
            formatted += ' ' + input.substring(9, 11)
        }

        setPhoneNumber(formatted)
        // КОСТЫЛЬ (Workaround): setSelectionRange требует, чтобы DOM обновился.
        // React обновляет состояние асинхронно. Поэтому мы используем setTimeout(0),
        // чтобы переместить курсор ПОСЛЕ того, как React применит изменения к инпуту.
        // Без этого курсор будет прыгать в начало или конец при вводе.
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(
                    formatted.length,
                    formatted.length,
                )
            }
        }, 0)
    }
    // Управление фокусом (позиция курсора)
    // При клике на инпут нам нужно, чтобы курсор стоял после кода страны +7,
    // чтобы пользователь мог сразу вводить номер, а не стирать +7.
    const handleFocus = () => {
        setTimeout(() => {
            if (inputRef.current) {
                // Если номер уже введен (>2 символов), ставим курсор на позицию 3 (после "+7 ").
                // Иначе на позицию 2 (после "+7").
                const position =
                    phoneNumber.length > 2 ? 3 : 2
                inputRef.current.setSelectionRange(
                    position,
                    position,
                )
            }
        }, 0)
    }

    // Валидация номера
    // Проверяем, что в номере ровно 11 цифр (7 - код страны + 10 цифр номера).
    const isPhoneValid =
        phoneNumber.replace(/\D/g, '').length === 11

    // Показываем ошибку только если пользователь уже начал вводить (длина > 2)
    // и номер при этом валидным не является.
    const showError =
        phoneNumber.length > 2 && !isPhoneValid

    // Открытие модального окна подтверждения
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
                    method: 'POST',
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
        console.log(
            '[Parent] onVerify called with code:',
            code,
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
    // Вызывается после того, как пользователь ввел имя и никнейм.
    // По сути это финальный шаг регистрации.
    const handleLoginSubmit = async (data: {
        name: string
        nickname: string
    }) => {
        console.log('Личные данные:', data)
        setLoading(true)
        setError('')
        // Берем токен, который могли сохранить ранее.
        const accessToken = Cookies.get('access_token')
        try {
            const response = await fetch(
                '/api/auth/profile',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Если токен есть (пользователь уже верифицировал телефон ранее),
                        // передаем его для авторизации запроса.
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
                // Данные сохранены успешно.
                // Показываем экран "Успешной регистрации".
                setShowSuccessRegister(true) // показать SuccessRegister
                // Обработка ошибок валидации.
                // Бэкенд часто возвращает ошибки в специфичном формате.
                // Здесь предполагается, что если никнейм занят, он вернет:
                // { nickname: ["Этот никнейм уже занят"] }
                // Проверяем именно это поле.
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
            // Запускаем интервал, который уменьшает blockTime каждую секунду.
            // setInterval работает независимо от рендеров компонента.
            const timer = setInterval(() => {
                // Используем функциональную форму обновления state,
                // чтобы не зависеть от внешней переменной blockTime (замыкание).
                setBlockTime((prev) => prev - 1)
            }, 1000)
            // ВАЖНО: Возвращаем функцию очистки.
            // Если компонент размонтируется (пользователь уйдет со страницы),
            // таймер остановится, чтобы не утекала память.
            // Также таймер перезапустится, когда blockTime изменится (зависимость массива).
            return () => clearInterval(timer)
        } else {
            // Если таймер дошел до 0, снимаем флаг блокировки.
            // Теоретически, этот else можно убрать, если проверять isBlocked внутри рендера,
            // но так мы явно сбрасываем состояние блока.
            setIsBlocked(false)
        }
    }, [blockTime])

    const handleBackToForm = () => setShowCodeForm(false)
    // Экран 4: Успешная форма регистрации
    if (showSuccessRegister) {
        return <SuccessRegister />
    }

    // Экран 3: Заполнение профиля (Имя, Никнейм).
    // Показывается, если пользователь новый или нужно обновить данные.
    if (showLoginForm) {
        return (
            <RegisterForm
                phoneNumber={phoneNumber}
                onSubmit={handleLoginSubmit}
                onBack={() => setShowLoginForm(false)}
            />
        )
    }
    // Экран 2: Подтверждение кода (SMS).
    // Показывается после успешной отправки номера.
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
    // Экран 1: Ввод номера телефона (По умолчанию).
    return (
        <>
            <div className="flex min-h-screen items-center justify-center">
                <div
                    className={`
                      relative flex h-screen w-(--app-login-width) flex-col
                      items-center justify-center bg-transparent
                    `}
                    // Условный фон. Если мобильное устройство - фон отключаем (isMobile).

                    style={{
                        backgroundImage: isMobile
                            ? 'none'
                            : 'var(--app-login-background)',
                    }}
                >
                    <div
                        className={`
                          flex flex-col items-center justify-center gap-4
                          bg-app-login-start filter-app-start-screen-shadow
                          md:absolute md:h-190 md:w-122 md:flex-col
                          md:items-center md:justify-center md:rounded-2xl
                        `}
                        style={{
                            backgroundImage: isMobile
                                ? 'none'
                                : 'var(--app-login-start)',
                            filter: isMobile
                                ? 'none'
                                : 'var(--app-start-screen-shadow)',
                        }}
                    >
                        <div
                            className={`
                              absolute flex flex-col items-center
                              justify-between gap-6
                              md:justify-between
                            `}
                        >
                            <div
                                className={`
                                  relative flex h-17 w-90 items-center
                                `}
                            >
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
                                        handleStartClick
                                    }
                                />
                                <Image
                                    src="/images/login/Logo.svg"
                                    alt="Logo"
                                    width={78}
                                    height={70}
                                    className={`
                                      absolute left-1/2 h-14 w-14
                                      -translate-x-1/2 transform
                                      md:h-18 md:w-20
                                    `}
                                    loading="eager"
                                />
                            </div>
                            {/* Блок с "А-чат" только на мобильных */}
                            <div
                                className={`
                                  block text-center text-[32px] font-bold
                                  md:hidden
                                `}
                            >
                                А-чат
                            </div>

                            <div
                                className={`
                                  flex h-126 w-90 flex-col items-center
                                  justify-between gap-6
                                  md:justify-between
                                `}
                            >
                                <div
                                    className={`
                                      flex w-90 items-center justify-center
                                    `}
                                >
                                    <p
                                        className={`
                                          text-center text-[25px] font-bold
                                          md:text-[32px]
                                        `}
                                    >
                                        Вход/регистрация
                                    </p>
                                </div>
                                <div
                                    className={`
                                      flex h-112 w-90 flex-col items-center
                                      justify-start gap-4
                                      md:justify-between
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
                                            inputMode="tel" //  оптимизирует клавиатуру для телефонов (цифровая)
                                            autoComplete="tel"
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
                titleAlign={isMobile ? 'center' : 'left'}
                buttons={[
                    {
                        label: 'Изменить',
                        variant: 'ghost',
                        color: 'primary',
                        onClick: handleCloseModal,
                        className:
                            'border-accent-violet-primary md:border-0',
                    },
                    {
                        label: 'Верно',
                        variant: 'solid',
                        color: 'primary',
                        onClick: handleSendCode,
                        disabled: loading,
                    },
                ]}
            />
        </>
    )
}
