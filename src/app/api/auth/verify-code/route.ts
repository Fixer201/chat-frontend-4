import { NextRequest, NextResponse } from 'next/server'

// URL бэкенда из env (см. комментарий в send-code/route.ts)
const BACKEND_URL =
    process.env.BACKEND_URL ||
    'https://api.test.chat.ktsf.ru'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const response = await fetch(
            `${BACKEND_URL}/api/v1/auth/messenger/login/get/token/`,
            {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            },
        )
        const data = await response.json()
        return NextResponse.json(data, {
            status: response.status,
        })
    } catch (error) {
        console.error('Proxy error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        )
    }
}
