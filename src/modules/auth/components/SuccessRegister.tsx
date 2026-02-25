'use client'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Cookies from 'js-cookie'
import useIsMobile from '@shared/hooks/useIsMobile'
import toast from 'react-hot-toast'

export default function SuccessRegister() {
    const router = useRouter()
    // Состояние загрузки.
    // По умолчанию false. Блокирует повторные нажатия на кнопку во время выполнения запросов.
    const [loading, setLoading] = useState(false)
    // Функция обновления (refresh) access токена.
    // PATTERN: Refresh Token Rotation.
    // Если access токен истекает, мы отправляем refresh токен на сервер, чтобы получить новую пару.
    const refreshAccessToken = async () => {
        const refreshToken = Cookies.get('refresh_token')
        // 1. Пробуем получить refresh token из cookies.
        // Если его нет — значит пользователь не авторизован или куки очищены. Выход.
        if (!refreshToken) {
            console.error('Refresh token не найден')
            return null
        }

        try {
            // 2. Делаем запрос к эндпоинту обновления.
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
                // 3. Проверяем статус ответа.
                // Важно: even if 200 OK, нужно проверить response.ok (для fetch).
                // Сохраняем новый access token в cookies.
                // { expires: 7 }: Токен будет храниться 7 дней.
                // ВНИМАНИЕ: Это может быть небезопасно для access token.
                // Обычно access token хранят в памяти или с коротким сроком жизни (15 мин), а refresh — долго.
                // Но здесь разработчик решил хранить его в cookies 7 дней.
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
    // Функция получения профиля пользователя.
    // Содержит логику обработки истечения токена (401 Unauthorized).
    const fetchProfile = async () => {
        const accessToken = Cookies.get('access_token')
        if (!accessToken) {
            console.error('Access token не найден')
            return false
        }
        try {
            // Делаем запрос к профилю.
            // ВНИМАНИЕ: Используется метод POST для получения профиля (что необычно, обычно GET).
            // Если бэкенд требует POST с пустым телом — приходится подстраиваться.
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
            // ЛОГИКА ОБРАБОТКИ ОШИБОК АВТОРИЗАЦИИ
            // Если получили 401 — токен протух или невалиден.
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
                // Сохраняем данные профиля в cookies в виде строки.
                // JSON.stringify здесь обязателен, так как cookies хранят только строки.
                // ВНИМАНИЕ: Хранение больших JSON данных в cookies — плохая практика.
                // Лимит cookies ~4kb. Лучше хранить ID пользователя, а данные тянуть по API,
                // или хранить в localStorage.
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
            // Обработка других ошибок (500, 403 и т.д.)
            console.error('ошибка создания профиля', err)
            return false
        }
    }
    // Обработчик клика по кнопке "Далее".
    const handleSubmit = async () => {
        setLoading(true)
        const success = await fetchProfile()
        setLoading(false)
        if (success) {
            router.push('/contacts')
        } else {
            toast.error(
                'Ошибка загрузки профиля. Попробуйте позже.',
            )
        }
    }
    // Определение мобильного режима (ширина ≤768px)
    const isMobile = useIsMobile()

    return (
        // Основной контейнер: центрирование контента на весь экран.
        <div className="flex min-h-screen items-center justify-center">
            {/* 
                Обертка с адаптивным фоном.
                Mobile-First: По умолчанию белый фон, на десктопе — картинка bg-app-login-background.
            */}
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
