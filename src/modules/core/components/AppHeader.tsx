/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import Modal from '@shared/ui/modal/Modal'

export function AppHeader() {
    const router = useRouter()
    const [isThanksModalOpen, setIsThanksModalOpen] =
        useState(false)

    const handleOpenThanksModal = () => {
        setIsThanksModalOpen(true)
    }

    const handleCloseThanksModal = () => {
        setIsThanksModalOpen(false)
    }

    const handleLogout = () => {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        router.push('/auth/register')
    }

    return (
        <>
            <div
                className={`
                  mx-auto flex h-15 w-full max-w-300 rotate-0 flex-row
                  items-center justify-between rounded-br-lg rounded-bl-lg
                  border-r border-b border-l border-app-divider bg-gray-main
                  px-2 opacity-100
                  md:px-4
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
                        className="hidden cursor-pointer lg:block"
                        onClick={handleOpenThanksModal}
                    />
                    <Image
                        src="/images/header/googlePlay.svg"
                        alt="googlePlay"
                        width={150}
                        height={44}
                        loading="eager"
                        className="hidden cursor-pointer lg:block"
                        onClick={handleOpenThanksModal}
                    />
                </div>
            </div>
            <Modal
                open={isThanksModalOpen}
                onClose={handleCloseThanksModal}
                title="Отсканируйте QR-код с телефона, чтобы скачать приложение"
                titleClassName="text-xl font-semibold leading-7"
                blurBackground
                closeOnOverlayClick
                className="relative max-w-105"
            >
                <button
                    type="button"
                    aria-label="Закрыть"
                    onClick={handleCloseThanksModal}
                    className="absolute top-4 right-4 mt-1 cursor-pointer text-3xl"
                >
                    ×
                </button>
                <div className="flex w-full flex-col items-center gap-5 py-4">
                    <Image
                        src="/dawnloadApp/QRCode.png"
                        alt="Скачать приложение"
                        width={280}
                        height={280}
                        className="h-auto w-80"
                        priority
                    />
                </div>
            </Modal>
        </>
    )
}
