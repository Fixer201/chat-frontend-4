import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const authHeader =
            request.headers.get('authorization')

        const response = await fetch(
            'https://api.test.chat.ktsf.ru/api/v1/auth/messenger/profile/',
            {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(authHeader && {
                        Authorization: authHeader,
                    }),
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

export async function GET(request: NextRequest) {
    try {
        const authHeader =
            request.headers.get('authorization')

        const response = await fetch(
            'https://api.test.chat.ktsf.ru/api/v1/auth/messenger/profile/',
            {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(authHeader && {
                        Authorization: authHeader,
                    }),
                },
                body: JSON.stringify({}),
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
