'use client'
import { Button } from '@shared/ui/button/Button'
import { Input } from '@shared/ui/Input'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function RegisterForm() {
    const router = useRouter()
    const handleStartClick = () => {
        router.push('/auth/login')
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
            <div
                className={`
                  absolute flex h-152 w-90 flex-col items-center justify-between
                  gap-6
                `}
            >
                <div className="relative flex h-17 w-90 items-center">
                    <Image
                        src="/images/login/back.svg"
                        alt="Back"
                        width={32}
                        height={32}
                        className="absolute top-0 left-0 cursor-pointer"
                        loading="eager"
                        onClick={handleStartClick}
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
                      flex h-126 w-90 flex-col items-center justify-between
                      gap-6
                    `}
                >
                    <div className="flex w-90 items-center justify-center">
                        <p className="text-center text-[32px] font-bold">
                            Вход/регистрация
                        </p>
                    </div>
                    <div
                        className={`
                      flex h-112 w-90 flex-col items-center justify-between
                    `}
                    >
                        <Input
                            label="Введите номер телефона"
                            placeholder="+7 900 000 00 00"
                            borderColor="gray"
                            textColor="gray"
                            inputSize="lg"
                        />
                        <Button
                            variant="solid"
                            size="md"
                            className="w-full"
                        >
                            Далее
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
