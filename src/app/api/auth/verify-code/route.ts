import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const response = await fetch(
            'https://api.test.chat.ktsf.ru/api/v1/auth/messenger/login/get/token/',
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
