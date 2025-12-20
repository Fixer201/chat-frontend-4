'use client'
import Image from 'next/image'

export function AppHeader() {
    return (
        <>
            <div
                className="w-300 h-15 flex items-center flex-row justify-between pr-4 pl-4 rotate-0 opacity-100 rounded-br-lg rounded-bl-lg border-r 
  border-b border-l border-gray-200 bg-gray-main mx-auto"
            >
                <Image
                    src="/images/header/Logo.svg"
                    alt="Logo"
                    width={49}
                    height={44}
                    loading="eager"
                />
                <div className="gap-2 flex flex-row items-center ">
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
