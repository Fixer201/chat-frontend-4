import { NextRequest, NextResponse } from 'next/server'

// URL бэкенда из env (см. комментарий в send-code/route.ts)
const BACKEND_URL =
    process.env.BACKEND_URL ||
    'https://api.test.chat.ktsf.ru'

export async function POST(request: NextRequest) {
    try {
        const authHeader =
            request.headers.get('authorization')

        const incomingContentType =
            request.headers.get('content-type') || ''

        const isMultipart = incomingContentType.includes(
            'multipart/form-data',
        )

        let outboundBody: BodyInit
        let outboundHeaders: Record<string, string> = {
            accept: 'application/json',
            ...(authHeader && {
                Authorization: authHeader,
            }),
        }

        if (isMultipart) {
            const form = await request.formData()
            outboundBody = form
            // Let fetch set correct multipart boundary
        } else {
            const body = await request.json()
            outboundBody = JSON.stringify(body)
            outboundHeaders = {
                ...outboundHeaders,
                'Content-Type': 'application/json',
            }
        }

        const response = await fetch(
            `${BACKEND_URL}/api/v1/auth/messenger/profile/`,
            {
                method: 'POST',
                headers: outboundHeaders,
                body: outboundBody,
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
            `${BACKEND_URL}/api/v1/auth/messenger/profile/`,
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
