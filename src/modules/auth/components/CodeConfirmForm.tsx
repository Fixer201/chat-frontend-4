'use client'

import {
    useState,
    useEffect,
    useRef,
    useLayoutEffect,
    useReducer,
} from 'react'
import { Input } from '@shared/ui/Input'
import Image from 'next/image'
import Modal from '@shared/ui/modal/Modal'
import { Button } from '@shared/ui/button/Button'
import SupportRequestForm from './SupportRequestForm'
import { useCountdown } from '@shared/hooks/useCountdown'
import { useCodeInput } from '@shared/hooks/useCodeInput'

interface CodeConfirmFormProps {
    phoneNumber: string // Номер, на который отправлен код
    onVerify: (code: string) => void // Колбэк при успешном вводе всех 5 цифр
    onBack: () => void // Возврат на предыдущий шаг
    onResendCode: () => void // Запрос нового кода
    loading: boolean // Флаг загрузки (передан, но не используется в компоненте)
    error: string // Текст ошибки (например, "Неверный код")
    attempts: number // Количество попыток (не используется)
    isBlocked: boolean // Заблокирован ли номер (после 10 попыток)
    blockTime: number // Время блокировки (не используется)
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
    // Хук для обратного отсчёта (начальное значение 60 секунд)
    // Возвращает текущее оставшееся время, функцию сброса и флаг активности
    const { timeLeft, reset: resetTimer } = useCountdown(60)

    // Хук для управления 5-значным кодом подтверждения
    // Возвращает массив кода, refs для инпутов, обработчики и функцию очистки
    const {
        code,
        inputRefs,
        handleChange: handleCodeChange,
        handleKeyDown: handleCodeKeyDown,
        clear: clearCode,
        isComplete,
    } = useCodeInput(5)

    const [showTooltip, setShowTooltip] = useState(false)

    const [modalState, dispatchModal] = useReducer(
        (state, action) => {
            switch (action.type) {
                case 'OPEN':
                    return {
                        open: true,
                        message: action.message,
                    }
                case 'CLOSE':
                    return { open: false, message: '' }
                default:
                    return state
            }
        },
        { open: false, message: '' },
    )

    const [
        showSupportRequestForm,
        setShowSupportRequestForm,
    ] = useState(false)

    // Флаг для предотвращения повторного открытия модального окна (например, при блокировке)
    const modalOpenedRef = useRef(false)

    const canResend = timeLeft === 0

    useEffect(() => {
        if (modalOpenedRef.current) return

        if (isBlocked) {
            modalOpenedRef.current = true
            dispatchModal({
                type: 'OPEN',
                message: 'Лимит исчерпан',
            })
        } else if (timeLeft === 0 && !isComplete) {
            modalOpenedRef.current = true
            dispatchModal({
                type: 'OPEN',
                message: 'Срок действия кода истек',
            })
        }
    }, [isBlocked, timeLeft, isComplete])

    /**
     * useLayoutEffect для обработки ошибки (неверный код).
     * При получении ошибки от родителя очищаем поля и ставим фокус на первый инпут.
     */
    useLayoutEffect(() => {
        if (error) {
            clearCode()
            inputRefs.current[0]?.focus()
        }
    }, [error, clearCode, inputRefs])

    /**
     * Обработчик изменения полей ввода кода.
     * Использует метод из хука useCodeInput, а после проверяет, не заполнен ли код полностью.
     * Если все цифры введены, вызывает onVerify.
     */
    const handleInputChange = (
        index: number,
        value: string,
    ) => {
        console.log(
            `[CodeConfirmForm] handleInputChange: index=${index}, value='${value}'`,
        )
        handleCodeChange(index, value, (fullCode) => {
            console.log(
                `[CodeConfirmForm] Code completed! Full code: "${fullCode}"`,
            )
            onVerify(fullCode)
        })
    }

    /**
     * Повторная отправка кода.
     * Сбрасывает таймер, очищает поля и вызывает колбэк onResendCode.
     */
    const handleResendCode = () => {
        resetTimer()
        clearCode()
        onResendCode()
    }

    /**
     * Открытие модального окна "Не приходит код?".
     */
    const handleOpenModal = () => {
        dispatchModal({
            type: 'OPEN',
            message: 'Не приходит код?',
        })
    }
    /**
     * Закрытие модального окна и сброс флага открытия.
     */
    const handleCloseModal = () => {
        dispatchModal({ type: 'CLOSE' })
        modalOpenedRef.current = false
    }

    // Если пользователь перешёл в форму поддержки, рендерим её
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
            {/* Внешний контейнер с фоновым изображением */}
            <div
                className={`
                  relative flex h-screen w-(--app-login-width) flex-col
                  items-center justify-center bg-none
                  md:bg-app-login-background
                `}
            >
                {/* Карточка формы */}
                <div
                    className={`
                      flex flex-col items-center justify-center gap-4 bg-white
                      md:absolute md:h-190 md:w-122 md:flex-col md:items-center
                      md:justify-center md:rounded-2xl md:bg-app-login-start
                      md:filter-app-start-screen-shadow
                    `}
                >
                    <div
                        className={`
                          absolute flex flex-col items-center justify-between
                          gap-6
                          md:justify-between
                        `}
                    >
                        {/* Шапка: кнопка назад и логотип */}
                        <div className="relative flex h-17 w-90 items-center">
                            <Image
                                src="/images/login/back.svg"
                                alt="Назад"
                                width={32}
                                height={32}
                                className="absolute top-0 left-0 cursor-pointer"
                                loading="eager"
                                onClick={onBack}
                            />
                            <Image
                                src="/images/login/Logo.svg"
                                alt="Логотип"
                                width={78}
                                height={70}
                                className={`
                                  mx-auto h-14 w-14
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

                        {/* Основной контент */}
                        <div
                            className={`
                              flex h-126 w-90 flex-col items-center
                              justify-between gap-6
                              md:justify-between
                            `}
                        >
                            {/* Заголовок */}
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
                                    Подтвердите вход
                                </p>
                            </div>

                            {/* Блок с номером телефона и полями ввода */}
                            <div
                                className={`
                                  flex h-112 w-90 flex-col items-center
                                  justify-between gap-2
                                  md:gap-4
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

                                {/* Подпись "Введите код" с иконкой подсказки */}
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
                                        alt="Информация"
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

                                    {/* Тултип с пояснениями */}
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
                                            {/* Треугольник-хвостик тултипа */}
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

                                {/* Отображение ошибки (например, неверный код) */}
                                {error && (
                                    <span
                                        className={`
                                          text-center text-sm text-red-500
                                        `}
                                    >
                                        {error}
                                    </span>
                                )}

                                {/* Пять полей для ввода цифр */}
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
                                                    handleCodeKeyDown(
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

                                {/* Отображение таймера до повторной отправки */}
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

                                {/* Кнопка повторной отправки (активна, когда canResend = true) */}
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

                                {/* Ссылка "Не приходит код?" - открывает модальное окно */}
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
                                            handleOpenModal()
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

            {/* Модальное окно (для сообщений "Не приходит код?", "Лимит исчерпан", "Срок истек") */}
            <Modal
                open={modalState.open}
                onClose={handleCloseModal}
                title=""
                descriptionColor="muted"
                titleAlign="center"
            >
                <div className="text-center text-lg text-[24px] font-bold">
                    {modalState.message}
                </div>

                <Button
                    variant="solid"
                    size="lg"
                    color="primary"
                    className="w-full"
                    onClick={() =>
                        setShowSupportRequestForm(true)
                    }
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
