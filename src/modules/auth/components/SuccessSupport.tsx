'use client'
// Этот компонент представляет собой экран успеха отправки обращения в службу поддержки (SuccessSupport).
// Он отображает подтверждение отправки, иконку успеха и кнопку для возврата на главную.
// Основные функции:
// - Адаптивный дизайн: Полноэкранный на мобильных, модальное окно на десктопе.
// - Навигация: Кнопка "На главную" для перехода к логину.
// - Условный рендер: Логотип и кнопка назад только на десктопе.

import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useIsMobile from '@shared/hooks/useIsMobile'

// Интерфейс пропсов: Определяет тип для onBack (функция возврата).

interface SuccessSupportProps {
    onBack: () => void
}

// Основная функция компонента SuccessSupport.
// Принимает пропс onBack.

export default function SuccessSupport({
    onBack,
}: SuccessSupportProps) {
    // Хук useRouter: Получаем экземпляр роутера для программной навигации.
    // Используется для перехода на '/auth/login'.

    const router = useRouter()

    // Обработчик клика по "На главную": Переходит на '/auth/login'.
    // Используется для кнопки возврата.
    const handleStartClick = () => {
        router.push('/auth/login')
    }

    // Хук useIsMobile: Определяет мобильный режим (ширина <= 768px).
    // Используется для условного рендера (логотип и кнопка назад только на десктопе).
    const isMobile = useIsMobile()

    // Возврат JSX: Рендер экрана успеха.
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
                      items-center justify-center bg-white
                      md:bg-app-login-background
                    `}
                >
                    {/* Контейнер модального окна: Абсолютное позиционирование на десктопе для центрирования.
                    h-190 w-122: Фиксированные размеры для модального окна. */}
                    <div
                        className={`
                          absolute flex h-190 w-122 flex-col items-center
                          justify-center rounded-2xl bg-white
                          md:bg-app-login-start
                          md:filter-app-start-screen-shadow
                        `}
                    >
                        <div
                            className={`
                              absolute flex flex-col items-center
                              justify-between gap-6
                            `}
                        >
                            {/* Условный рендер заголовка: Только на десктопе (логотип и кнопка назад).
                            На мобильке скрыт для экономии пространства. */}
                            {!isMobile && (
                                <div
                                    className={`
                                      relative flex h-17 w-90 items-center
                                    `}
                                >
                                    {/* Кнопка назад: Изображение с onClick для возврата. */}
                                    <Image
                                        src="/images/login/back.svg"
                                        alt="Back"
                                        width={32}
                                        height={32}
                                        className={`
                                          absolute top-0 left-0 cursor-pointer
                                        `}
                                        loading="eager"
                                        onClick={onBack}
                                    />
                                    {/* Логотип: Центрирован в заголовке. */}
                                    <Image
                                        src="/images/login/Logo.svg"
                                        alt="Logo"
                                        width={78}
                                        height={70}
                                        className="mx-auto"
                                        loading="eager"
                                    />
                                </div>
                            )}

                            {/* Основной контент: Заголовок, иконка, текст и кнопка. */}
                            <div
                                className={`
                                  flex h-126 w-90 flex-col items-center
                                  justify-start gap-4
                                  md:justify-between md:gap-6
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

                                {/* Контент с иконкой и текстом. */}
                                <div
                                    className={`
                                      flex h-112 w-90 flex-col items-center
                                      justify-start
                                      md:justify-between
                                    `}
                                >
                                    <div
                                        className={`
                                          flex h-112 w-90 flex-col items-center
                                          justify-start gap-4
                                          md:justify-start
                                        `}
                                    >
                                        {/* Иконка успеха: Центрирована. */}
                                        <Image
                                            src="/images/Check.svg"
                                            alt="Check"
                                            width={80}
                                            height={80}
                                            className="mx-auto"
                                            loading="eager"
                                        />

                                        {/* Текст успеха: Центрирован, с переносами строк. */}
                                        <div
                                            className={`
                                              flex flex-col gap-2 text-center
                                            `}
                                        >
                                            <span
                                                className={`
                                                  text-center text-[24px]
                                                  font-bold
                                                `}
                                            >
                                                {' '}
                                                Обращение
                                                отправлено!
                                            </span>
                                            <span
                                                className={`text-center text-lg`}
                                            >
                                                <p className="text-center">
                                                    В
                                                    ближайшее
                                                    время вы
                                                    получите
                                                    ответ{' '}
                                                    <br />
                                                    на
                                                    электронную
                                                    почту,
                                                    указанную{' '}
                                                    <br />в
                                                    обращении
                                                </p>
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="primary"
                                        size="md"
                                        className={`
                                          mt-4 w-full
                                          md:mt-0
                                        `}
                                        onClick={
                                            handleStartClick
                                        }
                                    >
                                        На главную
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
