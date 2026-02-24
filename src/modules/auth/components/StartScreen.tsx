'use client'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function StartScreen() {
    const router = useRouter()

    const handleStartClick = () => {
        router.push('/auth/register')
    }

    return (
        <>
            {/* 
               Внешний контейнер: 
               Flex-расположение по центру. 
               min-h-screen: гарантирует, что блок займет минимум весь экран по высоте (актуально для мобильных с маленьким контентом).
            */}
            <div className="flex min-h-screen items-center justify-center">
                <div
                    className={`
                      relative flex h-screen w-(--app-login-width) flex-col
                      items-center justify-center bg-none
                      md:bg-app-login-background
                    `}
                >
                    <div
                        className={`
                          flex h-screen w-full flex-col items-center
                          justify-center gap-4 bg-white bg-app-login-start
                          md:absolute md:h-190 md:w-122 md:flex-col
                          md:items-center md:justify-center md:rounded-2xl
                          md:filter-app-start-screen-shadow
                        `}
                    >
                        <Image
                            src="/images/login/Logo.svg"
                            alt="A-Chat"
                            width={179}
                            height={161}
                            className={`
                              h-[30vh] max-h-46 w-[60vw] max-w-53
                              md:absolute md:top-18 md:left-41 md:z-10 md:h-40
                              md:w-45
                            `}
                            loading="eager"
                        />

                        {/* 
                            Блок с текстом и кнопкой.
                           на мобильном — в потоке (flex), на десктопе — абсолютное позиционирование.
                                                    
                            md:h-95 md:w-90: Фиксированные размеры блока на десктопе. 
                            Это может сломать верстку, если текста станет больше (например, при переводе на другой язык).
                        */}
                        <div
                            className={`
                              flex flex-col items-center justify-between gap-4
                              md:absolute md:top-74 md:left-16 md:h-95 md:w-90
                            `}
                        >
                            {/* Обертка для текста */}
                            <div className="flex flex-col items-center gap-6">
                                <span
                                    className={`
                                      text-2xl font-bold text-text-black
                                      md:text-3xl
                                    `}
                                >
                                    А-Чат
                                </span>

                                <div
                                    className={`
                                      flex flex-col gap-1 text-center text-base
                                      text-accent-violet-dark
                                      md:text-lg
                                    `}
                                >
                                    <span>Привет!</span>
                                    <span>
                                        Давай знакомиться!
                                    </span>
                                </div>
                            </div>

                            {/* 
                                Кнопка действия.
                                variant="primary": Стиль кнопки (зависит от дизайн-системы).
                                onClick: Привязка к функции handleStartClick.
                                w-full max-w-75: На мобильных кнопка почти на всю ширину (flex родитель), 
                                но ограничена max-w-75 (около 300px), чтобы не быть слишком огромной на десктопе внутри карточки.
                            */}
                            <Button
                                variant="primary"
                                size="md"
                                className="w-full max-w-75"
                                onClick={handleStartClick}
                            >
                                Начать
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
