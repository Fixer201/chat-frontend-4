'use client'
import { useState, useEffect } from 'react'
import { OfflineStub } from './OfflineStub'
import { AppHeader } from './AppHeader'
import AppSidebar from './AppSidebar'

export default function AppShell({
    children,
}: {
    children: React.ReactNode
}) {
    // Состояние isOnline отслеживает, подключен ли пользователь к интернету.
    // Используем lazy initialization (() => navigator.onLine), чтобы вычислить начальное значение только при первом рендере.
    // Это предотвращает синхронный вызов setState в useEffect, что может вызвать каскадные рендеры и ухудшить производительность.

    const [isOnline, setIsOnline] = useState(
        () => navigator.onLine,
    )
    // Состояние isMobile определяет, находится ли устройство в мобильном режиме на основе ширины окна (<= 768px).

    const [isMobile, setIsMobile] = useState(
        () => window.innerWidth <= 768,
    )

    useEffect(() => {
        // Функция-обработчик для события 'online': устанавливает isOnline в true.
        // Это асинхронное обновление, вызываемое браузером при восстановлении соединения.
        const goOnline = () => setIsOnline(true)

        // Функция-обработчик для события 'offline': устанавливает isOnline в false.
        // Аналогично, асинхронно реагирует на потерю соединения.
        const goOffline = () => setIsOnline(false)

        // Добавляем слушатели событий на window.
        // window - глобальный объект браузера, доступный только на клиенте.
        window.addEventListener('online', goOnline)
        window.addEventListener('offline', goOffline)

        // Функция очистки: удаляем слушатели при размонтировании компонента.
        // Это предотвращает утечки памяти и ненужные вызовы после уничтожения компонента.
        return () => {
            window.removeEventListener('online', goOnline)
            window.removeEventListener('offline', goOffline)
        }
    }, []) // Пустой массив зависимостей: эффект запускается только один раз при монтировании.

    // useEffect для определения мобильного режима и подписки на событие resize.
    // Этот эффект также запускается только при монтировании (пустой []).
    // Очистка: Удаляем слушатель для предотвращения утечек.

    useEffect(() => {
        // Функция checkMobile проверяет ширину окна и обновляет состояние isMobile.
        // Она вызывается сразу при монтировании (для начальной проверки) и при каждом resize.
        // Почему <= 768? Соответствует breakpoint'у md в Tailwind, обеспечивая консистентность с CSS.
        const checkMobile = () =>
            setIsMobile(window.innerWidth <= 768)
        // Вызываем checkMobile сразу, чтобы состояние было актуальным при первом рендере.
        // Это не вызывает проблем, поскольку useState уже инициализирован lazy.
        checkMobile()

        window.addEventListener('resize', checkMobile)

        // Функция очистки: удаляем слушатель при размонтировании.
        return () =>
            window.removeEventListener(
                'resize',
                checkMobile,
            )
    }, []) // Пустой массив: эффект монтируется один раз.

    // Условный рендер: если нет интернет-соединения, показываем OfflineStub вместо всего интерфейса.
    // Это улучшает UX, предоставляя пользователю четкую обратную связь.
    // Почему не показывать частично? Полный оффлайн-режим предотвращает ошибки при попытке загрузки данных.
    if (!isOnline) {
        return <OfflineStub /> // Показываем вместо всего интерфейса
    }

    return (
        // Классы: flex h-screen flex-col gap-2 p-1 - вертикальный флекс с отступами.
        // md:gap-4 md:p-2 - адаптивные отступы для больших экранов (Tailwind breakpoint md).
        // Это создает responsive макет, адаптирующийся к размеру экрана.
        <div
            className={`
              flex h-screen flex-col gap-2 p-1
              md:gap-4 md:p-2
            `}
        >
            {/* Условный рендер AppHeader: показываем только
            если не мобильный режим. // Это оптимизирует
            пространство на маленьких экранах, где заголовок
            может быть избыточным. */}
            {!isMobile && <AppHeader />}
            {/* Внутренний div: контейнер для сайдбара и
            основного контента. // Классы: mx-auto -
            центрирование, flex h-full w-full max-w-300 -
            ограничение ширины и флекс. // flex-col gap-2
            overflow-hidden - вертикальный флекс с
            прокруткой. // md:flex-row md:gap-4 -
            горизонтальный флекс на десктопе. // max-w-300 -
            кастомный класс, вероятно, для ограничения
            ширины (например, 1200px). */}
            <div
                className={`
                  mx-auto flex h-full w-full max-w-300 flex-col gap-2
                  overflow-hidden
                  md:flex-row md:gap-4
                `}
            >
                {/* AppSidebar: всегда видимый компонент
                навигации. // Он не зависит от состояния,
                обеспечивая постоянный доступ. */}
                <AppSidebar />
                {/* Контейнер для дочерних компонентов
                (children). // Классы: flex h-full flex-1
                overflow-hidden - занимает оставшееся
                пространство, с прокруткой. // md:w-auto -
                на десктопе ширина авто, чтобы
                адаптироваться к сайдбару. // Это позволяет
                children занимать всю доступную область. */}
                <div
                    className={`
                      flex h-full flex-1 overflow-hidden
                      md:w-auto
                    `}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}
