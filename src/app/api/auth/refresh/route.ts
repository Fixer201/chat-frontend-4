import { NextRequest, NextResponse } from 'next/server'

// URL бэкенда из env (см. комментарий в send-code/route.ts)
const BACKEND_URL =
    process.env.BACKEND_URL ||
    'https://api.test.chat.ktsf.ru'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const response = await fetch(
            `${BACKEND_URL}/api/v1/auth/login/refresh/token/`,
            {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            },
        )

        const contentType =
            response.headers.get('content-type')
        let data

        if (
            contentType &&
            contentType.includes('application/json')
        ) {
            const text = await response.text()
            data = text ? JSON.parse(text) : {}
        } else {
            data = { status: response.status }
        }

        if (!response.ok) {
            console.error(
                `Refresh API error: ${response.status} ${response.statusText}`,
            )
            // Можно добавить логику для других статусов
        }

        return NextResponse.json(data, {
            status: response.status,
        })
    } catch (error) {
        console.error('Proxy error:', error)

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: String(error),
            },
            { status: 500 },
        )
    }
}
