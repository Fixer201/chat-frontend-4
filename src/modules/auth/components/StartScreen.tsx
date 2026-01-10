/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
/* eslint-disable better-tailwindcss/no-unregistered-classes */
'use client'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import '@app/globals.css'
import { useEffect, useState } from 'react'

export default function StartScreen() {
    const router = useRouter()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () =>
            setIsMobile(window.innerWidth < 768)
        handleResize()
        window.addEventListener('resize', handleResize)
        return () =>
            window.removeEventListener(
                'resize',
                handleResize,
            )
    }, [])

    const handleStartClick = () => {
        router.push('/auth/register')
    }
    return (
        <>
            <div className="flex min-h-screen items-center justify-center">
                <div
                    className={`
          relative flex flex-col
          items-center justify-center
        `}
                    style={
                        isMobile
                            ? {
                                  height: '100vh',
                                  width: '100vw',
                                  backgroundImage: 'none',
                              }
                            : {
                                  backgroundImage:
                                      'var(--app-login-background)',
                                  height: 'var(--app-login-height)',
                                  width: 'var(--app-login-width)',
                              }
                    }
                >
                    <div
                        className={`
            absolute flex flex-col items-center justify-center
            rounded-2xl
            ${isMobile ? 'h-full w-full' : 'h-190 w-122'}
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
                            className={`absolute z-10 ${isMobile ? 'top-1/4 left-1/2 -translate-x-1/2 transform' : 'top-18 left-41'}`}
                            loading="eager"
                        />

                        <div
                            className={`
              absolute flex flex-col justify-between
              gap-4
              ${isMobile ? 'top-1/2 left-1/2 h-auto w-full -translate-x-1/2 -translate-y-1/2 transform px-4' : 'top-74 left-16 h-95 w-90'}
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
