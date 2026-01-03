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
        <div
            className={`
              absolute flex h-190 w-122 flex-col items-center justify-center
              rounded-2xl bg-[url(/images/login/StartPage.svg)]
            `}
            style={{
                filter: 'var(--app-start-screen-shadow)',
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
                  absolute top-74 left-16 flex h-95 w-90 flex-col
                  justify-between gap-4
                `}
            >
                <div className="flex flex-col items-center gap-6">
                    <h1
                        className={`
                          custom-text-gradient-black text-3xl font-bold
                        `}
                    >
                        А-Чат
                    </h1>
                    <h2
                        className={`text-center text-lg text-accent-violet-dark`}
                    >
                        <span className="block">
                            Привет!{' '}
                        </span>
                        <span className="block">
                            Давай знакомиться!
                        </span>
                    </h2>
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
    )
}
