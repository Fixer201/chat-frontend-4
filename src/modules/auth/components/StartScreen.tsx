/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
/* eslint-disable better-tailwindcss/no-unregistered-classes */
'use client'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import '@app/globals.css'

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
          relative hidden h-(--app-login-height) w-(--app-login-width) flex-col
          items-center justify-center
          md:flex
        `}
                    style={{
                        backgroundImage:
                            'var(--app-login-background)',
                    }}
                >
                    <div
                        className={`
            absolute flex h-190 w-122 flex-col items-center justify-center
            rounded-2xl
          `}
                        style={{
                            filter: 'var(--app-start-screen-shadow)',
                            backgroundImage:
                                'var(--app-login-start)',
                        }}
                    >
                        <Image
                            src="/images/login/Logo.svg"
                            alt="Logo"
                            width={179}
                            height={161}
                            className="absolute top-18 left-41 z-10"
                            loading="eager"
                        />

                        <div
                            className={`
              absolute top-74 left-16 flex h-95 w-90 flex-col justify-between
              gap-4
            `}
                        >
                            <div className="flex flex-col items-center gap-6">
                                <span className="text-text-primary text-3xl font-bold">
                                    А-Чат
                                </span>
                                <span className="text-center text-lg text-accent-violet-dark">
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
                                className="w-full"
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
