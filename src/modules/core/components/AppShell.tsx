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
        <div className="flex flex-col items-center justify-center gap-4 p-1">
            <AppHeader />
            <div className="mx-auto flex w-300 flex-row gap-4">
                <AppSidebar />
                <div className="flex-1">{children}</div>
            </div>
        </div>
    )
}
