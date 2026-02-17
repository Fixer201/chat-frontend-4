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
                        {/* Логотип: responsive размеры (масштабируется на мобильных), абсолютное на десктопе */}
                        <Image
                            src="/images/login/Logo.svg"
                            alt="Logo"
                            width={179}
                            height={161}
                            className={`
                              h-[30vh] max-h-46 w-[60vw] max-w-53
                              md:absolute md:top-18 md:left-41 md:z-10 md:h-40
                              md:w-45
                            `}
                            loading="eager"
                        />

                        {/* Контент: flexbox на мобильных, абсолютное на десктопе */}
                        <div
                            className={`
                              flex flex-col items-center justify-between gap-4
                              md:absolute md:top-74 md:left-16 md:h-95 md:w-90
                            `}
                        >
                            <div className="flex flex-col items-center gap-6">
                                <span
                                    className={`
                                      text-2xl font-bold text-text-black
                                      md:text-3xl
                                    `}
                                >
                                    А-Чат
                                </span>
                                <span
                                    className={`
                                      text-center text-base
                                      text-accent-violet-dark
                                      md:text-lg
                                    `}
                                >
                                    {' '}
                                    <p>Привет! </p>{' '}
                                    <p>
                                        Давай знакомиться!
                                    </p>{' '}
                                </span>
                            </div>
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
