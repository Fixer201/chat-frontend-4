'use client'
import { Button } from '@shared/ui/button/Button'
import '@app/globals.css'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SuccessSupportProps {
    onBack: () => void
}

export default function SuccessSupport({
    onBack,
}: SuccessSupportProps) {
    const router = useRouter()

    const handleStartClick = () => {
        router.push('/auth/login')
    }
    // Определение мобильного режима (ширина ≤768px)
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const checkMobile = () =>
            setIsMobile(window.innerWidth <= 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        console.log('isMobile:', isMobile)
        return () =>
            window.removeEventListener(
                'resize',
                checkMobile,
            )
    }, [isMobile])
    return (
        <>
            <div className="flex min-h-screen items-center justify-center">
                <div
                    className={`
                      relative flex h-screen w-(--app-login-width) flex-col
                      items-center justify-center bg-white
                      md:bg-app-login-background
                    `}
                >
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
                            {!isMobile && (
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
                            )}

                            <div
                                className={`
                                  flex h-126 w-90 flex-col items-center
                                  justify-start gap-4
                                  md:justify-between md:gap-6
                                `}
                            >
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
                                      md:justify-between
                                    `}
                                    >
                                        <Image
                                            src="/images/Check.svg"
                                            alt="Check"
                                            width={80}
                                            height={80}
                                            className="mx-auto"
                                            loading="eager"
                                        />

                                        <div
                                            className={`
                                          flex flex-col gap-2 text-center
                                        `}
                                        >
                                            <span
                                                className={`
                                              text-center text-[24px] font-bold
                                            `}
                                            >
                                                {' '}
                                                Обращение
                                                отправлено!
                                            </span>
                                            <span
                                                className={`
                                              text-center text-lg
                                            `}
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
                                        // disabled={loading}
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
