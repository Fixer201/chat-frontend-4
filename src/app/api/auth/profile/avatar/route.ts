import { NextRequest, NextResponse } from 'next/server'

// URL бэкенда из env (см. комментарий в send-code/route.ts)
const BACKEND_URL =
    process.env.BACKEND_URL ||
    'https://api.test.chat.ktsf.ru'

const UPSTREAM_URL = `${BACKEND_URL}/api/v1/auth/messenger/profile/avatar/download/`

export async function POST(request: NextRequest) {
    try {
        const authHeader =
            request.headers.get('authorization')
        const form = await request.formData()

        const response = await fetch(UPSTREAM_URL, {
            method: 'POST',
            headers: {
                ...(authHeader && {
                    Authorization: authHeader,
                }),
            },
            body: form,
        })

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

        return NextResponse.json(data, {
            status: response.status,
        })
    } catch (error) {
        console.error('Avatar upload proxy error:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: String(error),
            },
            { status: 500 },
        )
    }
}
