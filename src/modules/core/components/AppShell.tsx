'use client'
import { useState, useEffect } from 'react'
import { OfflineStub } from './OfflineStub'
import { AppHeader } from './AppHeader'
import AppSidebar from './AppSidebar'
import '@app/globals.css'

export default function AppShell({
    children,
}: {
    children: React.ReactNode
}) {
    const [isOnline, setIsOnline] = useState(true)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOnline(navigator.onLine)
        const goOnline = () => setIsOnline(true)
        const goOffline = () => setIsOnline(false)

        window.addEventListener('online', goOnline)
        window.addEventListener('offline', goOffline)

        return () => {
            window.removeEventListener('online', goOnline)
            window.removeEventListener('offline', goOffline)
        }
    }, [])
    if (!isOnline) {
        return <OfflineStub /> // Показываем вместо всего интерфейса
    }
    return (
        <div
            className={`
          flex h-screen flex-col gap-2 p-1
          md:gap-4 md:p-2
        `}
        >
            <AppHeader />
            <div
                className={`
              mx-auto flex h-full w-full max-w-[1200px] flex-row gap-2
              overflow-hidden
              md:gap-4
            `}
            >
                <AppSidebar />
                <div className="flex h-full flex-1 overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    )
}
