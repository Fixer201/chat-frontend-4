// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const accessToken =
        request.cookies.get('access_token')?.value

    // Публичные маршруты (без защиты)
    const publicPaths = ['/auth', '/support']
    const isPublicPath = publicPaths.some((path) =>
        pathname.startsWith(path),
    )

    // Если маршрут приватный и нет токена → редирект на /auth/register
    if (!isPublicPath && !accessToken) {
        return NextResponse.redirect(
            new URL('/auth/register', request.url),
        )
    }

    // Если маршрут публичный и есть токен → редирект на /chats (чтобы не показывать логин повторно)
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

// Применить middleware ко всем маршрутам
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
