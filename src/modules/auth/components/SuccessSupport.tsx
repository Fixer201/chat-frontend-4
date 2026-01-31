/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */

'use client'
import { Button } from '@shared/ui/button/Button'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

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

    return (
        <>
            <div className="flex min-h-screen items-center justify-center">
                <div
                    className={`
                      relative hidden h-screen
                      w-(--app-login-width) flex-col items-center justify-center
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
                              absolute flex flex-col items-center
                              justify-between gap-6
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
                                    <div className="flex flex-col items-center gap-6">
                                        <Image
                                            src="/images/Check.svg"
                                            alt="Check"
                                            width={80}
                                            height={80}
                                            className="mx-auto"
                                            loading="eager"
                                        />

                                        <div className="flex flex-col gap-2 text-center">
                                            <span className="text-center text-[24px] font-bold">
                                                {' '}
                                                Обращение
                                                отправлено!
                                            </span>
                                            <span className="text-center text-lg">
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
                                        className="w-full"
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
