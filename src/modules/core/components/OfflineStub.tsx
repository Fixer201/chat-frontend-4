'use client'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import '@app/globals.css'

export function OfflineStub() {
    const handleReloadClick = () => {
        window.location.reload() // Перезагружает страницу, чтобы проверить соединение
    }

    return (
        <div className="flex flex-col items-center justify-center bg-gray-main">
            <Image
                src="/images/home/NoInternet.svg"
                alt="Logo"
                width={486}
                height={368}
                loading="eager"
            />
            <div className="mt-8 flex flex-col items-center gap-6">
                <span className="text-center text-lg text-text-black">
                    <p>Нет доступа к интеренету</p>
                    <p>
                        проверьте подключение к сети и
                        повторите запрос
                    </p>
                </span>
                <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={handleReloadClick}
                >
                    Перезагрузить страницу
                </Button>
            </div>
        </div>
    )
}
