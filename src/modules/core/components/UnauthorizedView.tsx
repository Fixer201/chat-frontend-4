// src/modules/core/components/UnauthorizedView.tsx
'use client'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export function UnauthorizedView() {
    const router = useRouter()

    const handleLoginClick = () => {
        router.push('/auth/login')
    }

    return (
        <div
            className={`
              flex min-h-screen flex-col items-center justify-center
              bg-gray-main
            `}
        >
            <Image
                src="/images/home/404.svg" // Замените на подходящую иконку, если есть (или используйте 404.svg как fallback)
                alt="Unauthorized"
                width={486}
                height={368}
                loading="eager"
            />
            <div className="mt-8 flex flex-col items-center gap-6">
                <span className="text-center text-lg text-text-black">
                    <p>
                        Сессия истекла или токен
                        недействителен.
                    </p>
                    <p>
                        Пожалуйста, войдите в систему снова.
                    </p>
                </span>
                <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={handleLoginClick}
                >
                    Войти
                </Button>
            </div>
        </div>
    )
}
