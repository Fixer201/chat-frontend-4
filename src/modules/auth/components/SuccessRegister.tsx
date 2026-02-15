/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import '@app/globals.css'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

export default function SuccessRegister() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const refreshAccessToken = async () => {
        const refreshToken =
            // localStorage.getItem('refresh_token')
            Cookies.get('refresh_token')
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
                Cookies.set('access_token', data.access, {
                    expires: 7,
                })
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
        const accessToken = Cookies.get('access_token')
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
                Cookies.set(
                    'user_profile',
                    JSON.stringify(profileData),
                    { expires: 7 },
                )
                // Сохраняем профиль
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
    // Определение мобильного режима (ширина ≤768px)
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const checkMobile = () =>
            setIsMobile(window.innerWidth <= 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        console.log('isMobile:', isMobile)
        return () =>
            window.removeEventListener(
                'resize',
                checkMobile,
            )
    }, [isMobile])
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div
                className={`
                  relative flex h-screen w-(--app-login-width) flex-col
                  items-center justify-center bg-white
                  md:bg-app-login-background
                `}
            >
                <div
                    className={`
                      absolute flex h-190 w-122 flex-col items-center
                      justify-center rounded-2xl bg-white
                      md:bg-app-login-start md:filter-app-start-screen-shadow
                    `}
                >
                    <Image
                        src={
                            isMobile
                                ? '/images/login/CheckSuccess.svg'
                                : '/images/login/Logo.svg'
                        }
                        alt="Logo"
                        width={179}
                        height={161}
                        className="absolute top-18 left-41 z-10"
                        loading="eager"
                    />
                    <div
                        className={`
                          absolute top-74 left-16 flex h-95 w-90 flex-col
                          justify-start gap-4
                          md:justify-between
                        `}
                    >
                        <div className="flex flex-col items-center gap-6">
                            <span
                                className={`
                                  text-3xl font-bold text-text-black
                                  md:text-accent-violet-primary
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
