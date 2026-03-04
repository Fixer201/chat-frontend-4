'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import ReduxProvider from '@redux/ReduxProvider'
import TrpcProvider from '@shared/api/trpc/provider'
import AppShell from '@modules/core/components/AppShell'
import { Spinner } from '@shared/ui/Spinner'
import { NotFoundView } from '@modules/core/components/NotFoundView'
import '@app/globals.css'
import { WebSocketProvider } from '@shared/context/websocketContext'
import { Toaster } from 'react-hot-toast'

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isAuthenticated, setIsAuthenticated] =
        useState(false)
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        const accessToken = Cookies.get('access_token')
        if (!accessToken) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsAuthenticated(false)
        } else {
            setIsAuthenticated(true)
        }
        setIsLoading(false)
    }, [])
    if (isLoading) {
        // Пока проверяем, показываем загрузку
        return <Spinner />
    }

    if (!isAuthenticated) return <NotFoundView />

    return (
        <ReduxProvider>
            <TrpcProvider>
                <WebSocketProvider>
                    <AppShell>{children}</AppShell>
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                        }}
                    />
                </WebSocketProvider>
            </TrpcProvider>
        </ReduxProvider>
    )
}
