'use client'
import Image from 'next/image'

export function AppHeader() {
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
                </div>
            </div>
        </>
    )
}
