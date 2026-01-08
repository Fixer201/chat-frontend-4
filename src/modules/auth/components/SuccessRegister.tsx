'use client'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import '@app/globals.css'
import { useState } from 'react'

export default function SuccessRegister() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const refreshAccessToken = async () => {
        const refreshToken =
            localStorage.getItem('refresh_token')
        if (!refreshToken) {
            console.error('Refresh token не найден')
            return null
        }

        try {
            const response = await fetch(
                '/api/auth/refresh',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refresh: refreshToken,
                    }),
                },
            )
            if (response.ok) {
                const data = await response.json()
                localStorage.setItem(
                    'access_token',
                    data.access,
                )
                return data.access
            } else {
                console.error(
                    'Ошибка refresh token:',
                    response.status,
                )
                return null
            }
        } catch (err) {
            console.error('Ошибка refreshing token:', err)
            return null
        }
    }
    const fetchProfile = async () => {
        const accessToken =
            localStorage.getItem('access_token')
        if (!accessToken) {
            console.error('Access token не найден')
            return false
        }
        try {
            let response = await fetch(
                '/api/auth/profile',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({}),
                },
            )
            if (response.status === 401) {
                // Токен истек, пытаемся обновить
                console.log('Token истек, обновление')
                const newAccessToken =
                    await refreshAccessToken()
                if (newAccessToken) {
                    // Повторяем запрос с новым токеном
                    response = await fetch(
                        '/api/auth/profile',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type':
                                    'application/json',
                                Authorization: `Bearer ${newAccessToken}`,
                            },
                            body: JSON.stringify({}),
                        },
                    )
                } else {
                    return false
                }
            }
            if (response.ok) {
                const profileData = await response.json()
                localStorage.setItem(
                    'user_profile',
                    JSON.stringify(profileData),
                ) // Сохраняем профиль
                console.log('профиль сохранен', profileData)
                return true
            } else {
                console.error(
                    'ошибка профиля',
                    response.status,
                )
                return false
            }
        } catch (err) {
            console.error('ошибка создания профиля', err)
            return false
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        const success = await fetchProfile()
        setLoading(false)
        if (success) {
            router.push('/contacts')
        } else {
            alert(
                'Ошибка загрузки профиля. Попробуйте позже.',
            )
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div
                className={`
                  relative hidden h-(--app-login-height) w-(--app-login-width)
                  flex-col items-center justify-center
                  md:flex
                `}
                style={{
                    backgroundImage:
                        'var(--app-login-background)',
                }}
            >
                <div
                    className={`
                      absolute flex h-190 w-122 flex-col items-center
                      justify-center rounded-2xl
                    `}
                    style={{
                        filter: 'var(--app-start-screen-shadow)',
                        backgroundImage:
                            'var(--app-login-start)',
                    }}
                >
                    <Image
                        src="/images/login/Logo.svg"
                        alt="Logo"
                        width={179}
                        height={161}
                        className="absolute top-18 left-41 z-10"
                        loading="eager"
                    />
                    <div
                        className={`
                          absolute top-74 left-16 flex h-95 w-90 flex-col
                          justify-between gap-4
                        `}
                    >
                        <div className="flex flex-col items-center gap-6">
                            <span
                                className={`
                                  text-3xl font-bold text-accent-violet-primary
                                `}
                            >
                                Поздравляем!
                            </span>
                            <span className="text-center text-lg">
                                {' '}
                                <p>
                                    Регистрация прошла
                                    успешно!{' '}
                                </p>{' '}
                            </span>
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {' '}
                            {loading
                                ? 'Загрузка...'
                                : 'Далее'}{' '}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
