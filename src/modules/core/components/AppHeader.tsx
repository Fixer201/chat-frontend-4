'use client'
import Image from 'next/image'
import { useState } from 'react'
import Modal from '@shared/ui/modal/Modal'

export function AppHeader() {
    const [isThanksModalOpen, setIsThanksModalOpen] =
        useState(false)

    // Обработчик открытия модального окна: Устанавливает isThanksModalOpen в true.
    // Вызывается при клике на ссылки App Store или Google Play.
    const handleOpenThanksModal = () => {
        setIsThanksModalOpen(true)
    }
    // Обработчик закрытия модального окна: Устанавливает isThanksModalOpen в false.
    // Вызывается при клике на кнопку закрытия (×) или overlay.
    const handleCloseThanksModal = () => {
        setIsThanksModalOpen(false)
    }

    return (
        <>
            {/* Контейнер заголовка: Фиксированная высота h-15 (60px), центрирован по ширине (max-w-300).
        rounded-br-lg rounded-bl-lg: Скругление нижних углов для визуального стиля.
        border-r border-b border-l border-app-divider: Границы со всех сторон, кроме верхней.
        bg-gray-main: Фон серого цвета (вероятно, для контраста с основным контентом).
        px-2 на мобильном, md:px-4 на десктопе: Горизонтальные отступы адаптируются.
        rotate-0: Явное указание угла поворота (возможно, для анимаций, но пока 0).
        opacity-100: Полная непрозрачность.
        mx-auto: Центрирование по горизонтали внутри родительского контейнера.
        flex flex-row items-center justify-between: Горизонтальное выравнивание с распределением пространства.
        */}
            <div
                className={`
                  mx-auto flex h-15 w-full max-w-300 rotate-0 flex-row
                  items-center justify-between rounded-br-lg rounded-bl-lg
                  border-r border-b border-l border-app-divider bg-gray-main
                  px-2 opacity-100
                  md:px-4
                `}
            >
                {/* Логотип приложения: Отображается слева в заголовке.
            width={49} height={44}: Фиксированные размеры для соответствия дизайну.
            loading="eager": Загрузка изображения сразу (не ленивая), так как это критичный элемент.
             */}
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
                        className={`
                          hidden cursor-pointer
                          lg:block
                        `}
                        onClick={handleOpenThanksModal}
                    />
                    <Image
                        src="/images/header/googlePlay.svg"
                        alt="googlePlay"
                        width={150}
                        height={44}
                        loading="eager"
                        className={`
                          hidden cursor-pointer
                          lg:block
                        `}
                        onClick={handleOpenThanksModal}
                    />
                </div>
            </div>
            {/* Модальное окно: Отображает QR-код для скачивания приложения.
        open: Управляется состоянием isThanksModalOpen.
        onClose: Закрывает модальное окно при клике на overlay или кнопку.
        title: Заголовок модального окна с инструкцией.
        blurBackground: Размытие фона при открытии модального окна (если поддерживается компонентом Modal).
        closeOnOverlayClick: Закрытие при клике вне модального окна.
        className: max-w-105 для ограничения ширины ( arbitrary value ~420px).
       */}
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
                    className={`
                      absolute top-4 right-4 mt-1 cursor-pointer text-3xl
                    `}
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
