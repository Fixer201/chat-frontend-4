/**
 * Catch-all прокси для API-запросов к Django-бэкенду.
 *
 * Почему не proxy.ts (NextResponse.rewrite):
 *   Turbopack в Next.js 16 не поддерживает rewrite на внешние URL —
 *   proxy-функция не вызывается для /api/v1/* путей (известный баг,
 *   см. github.com/vercel/next.js/discussions/78481, issues/87680).
 *
 * Почему catch-all route handler:
 *   API routes работают стабильно (auth routes уже проксируют запросы).
 *   Route handler даёт полный контроль над headers, body и method,
 *   а также позволяет корректно проксировать multipart/form-data (аватары).
 */
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL =
    process.env.BACKEND_URL ||
    'https://api.test.chat.ktsf.ru'

/**
 * Hop-by-hop заголовки — не должны пересылаться между прокси.
 * Согласно RFC 2616 §13.5.1, эти заголовки относятся к конкретному
 * TCP-соединению и теряют смысл при пересылке на другой сервер.
 * `host` заменяется автоматически на хост бэкенда,
 * `content-length` пересчитывается fetch при отправке body.
 */
const HOP_BY_HOP_HEADERS = new Set([
    'connection',
    'keep-alive',
    'transfer-encoding',
    'te',
    'trailer',
    'upgrade',
    'host',
    'content-length',
])

async function proxyRequest(request: NextRequest) {
    // Используем оригинальный pathname из запроса, а не path-параметры из [..path],
    // чтобы сохранить trailing slash — Django возвращает 404 без него.
    // Работает в связке с skipTrailingSlashRedirect в next.config.ts.
    const url = new URL(
        request.nextUrl.pathname + request.nextUrl.search,
        BACKEND_URL,
    )

    // Пересылаем все заголовки клиента, кроме hop-by-hop.
    // Это сохраняет Authorization, Content-Type, X-CSRFTOKEN и другие
    // заголовки, которые клиент отправляет через useApiFetcher.
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
        if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
            headers[key] = value
        }
    })

    // Определяем тело запроса: GET/HEAD не имеют body.
    // Для multipart/form-data (загрузка файлов) удаляем Content-Type,
    // чтобы fetch сам установил boundary — иначе бэкенд не распарсит файлы.
    // Для остальных запросов передаём тело как ArrayBuffer (бинарно-безопасно).
    let body: BodyInit | null = null
    if (
        request.method !== 'GET' &&
        request.method !== 'HEAD'
    ) {
        const contentType =
            request.headers.get('content-type') || ''
        if (contentType.includes('multipart/form-data')) {
            body = await request.formData()
            delete headers['content-type']
        } else {
            body = await request.arrayBuffer()
        }
    }

    try {
        const response = await fetch(url.toString(), {
            method: request.method,
            headers,
            body,
        })

        // Пересылаем заголовки ответа бэкенда клиенту (кроме hop-by-hop).
        // Это сохраняет Set-Cookie, Content-Type и другие заголовки бэкенда.
        const responseHeaders = new Headers()
        response.headers.forEach((value, key) => {
            if (
                !HOP_BY_HOP_HEADERS.has(key.toLowerCase())
            ) {
                responseHeaders.set(key, value)
            }
        })

        // ArrayBuffer — универсальный формат для любого типа ответа (JSON, binary, etc.)
        const responseBody = await response.arrayBuffer()

        return new NextResponse(responseBody, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        })
    } catch (error) {
        // 502 Bad Gateway — стандартный код для недоступного upstream-сервера
        console.error('[api proxy] error:', error)
        return NextResponse.json(
            { error: 'Backend unavailable' },
            { status: 502 },
        )
    }
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
