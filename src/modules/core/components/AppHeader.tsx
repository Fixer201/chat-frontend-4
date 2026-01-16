/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export function AppHeader() {
    const router = useRouter()

    const handleLogout = () => {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        router.push('/auth/register')
    }

    return (
        <>
            <div
                className={`
                  mx-auto flex h-15 w-300 rotate-0 flex-row items-center
                  justify-between rounded-br-lg rounded-bl-lg border-r border-b
                  border-l border-app-divider bg-gray-main pr-4 pl-4 opacity-100
                `}
            >
                <Image
                    src="/images/header/Logo.svg"
                    alt="Logo"
                    width={49}
                    height={44}
                    loading="eager"
                />
                <div className="flex flex-row items-center gap-2">
                    <Image
                        src="/images/header/appStore.svg"
                        alt="appStore"
                        width={150}
                        height={44}
                        loading="eager"
                    />
                    <Image
                        src="/images/header/googlePlay.svg"
                        alt="googlePlay"
                        width={150}
                        height={44}
                        loading="eager"
                    />
                    {/* Кнопка выхода — подумать куда воткнуть ее */}
                    <button
                        onClick={handleLogout}
                        className={`
                          cursor-pointer text-sm text-accent-violet-primary
                          transition-colors
                          hover:text-accent-violet-primary
                        `}
                        title="Выйти"
                    >
                        Выйти
                    </button>
                </div>
            </div>
        </>
    )
}
