/**
 * Proxy (middleware) — перехватывает все запросы до обработки маршрутов.
 *
 * В Next.js 16 proxy.ts заменяет middleware.ts.
 * Здесь реализована только защита маршрутов (auth guard).
 *
 * Проксирование API-запросов на бэкенд НЕ делается через NextResponse.rewrite,
 * т.к. Turbopack в Next.js 16 не поддерживает rewrite на внешние URL
 * (proxy-функция не вызывается для /api/v1/* путей).
 * Вместо этого используется catch-all route handler:
 * src/app/api/v1/[...path]/route.ts
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Пропускаем все /api/* — они обрабатываются route handlers:
    // - /api/v1/* → catch-all прокси к Django-бэкенду
    // - /api/auth/* → отдельные route handlers для авторизации
    if (pathname.startsWith('/api/')) {
        return NextResponse.next()
    }

    // === Защита приватных маршрутов ===

    const accessToken =
        request.cookies.get('access_token')?.value

    // Маршруты, доступные без авторизации
    const publicPaths = ['/auth', '/support']
    const isPublicPath = publicPaths.some((path) =>
        pathname.startsWith(path),
    )

    // Неавторизованный пользователь на приватном маршруте → страница регистрации
    if (!isPublicPath && !accessToken) {
        return NextResponse.redirect(
            new URL('/auth/register', request.url),
        )
    }

    // Авторизованный пользователь на публичном маршруте → главная страница чатов
    // (исключение: /auth/login — для повторного входа в другой аккаунт)
    if (
        isPublicPath &&
        accessToken &&
        pathname !== '/auth/login'
    ) {
        return NextResponse.redirect(
            new URL('/chats', request.url),
        )
    }

    return NextResponse.next()
}

export const config = {
    // Исключаем статические ресурсы Next.js из обработки proxy —
    // они не требуют авторизации и не нуждаются в проксировании.
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
