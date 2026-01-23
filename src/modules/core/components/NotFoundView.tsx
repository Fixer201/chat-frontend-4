/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import '@app/globals.css'

export function NotFoundView() {
    const router = useRouter()

    const handleStartClick = () => {
        router.push('/auth/login')
    }
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-main">
            <Image
                src="/images/home/404.svg"
                alt="Logo"
                width={486}
                height={368}
                loading="eager"
                objectFit="contain"
            />
            <div className="mt-8 flex flex-col items-center gap-6">
                <span className="text-center text-lg text-text-black">
                    <p>Проверьте правильность адреса или</p>
                    <p>вернитесь на главную страницу</p>
                </span>
                <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={handleStartClick}
                >
                    Вернуться на главную
                </Button>
            </div>
        </div>
    )
}
