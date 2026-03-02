// /api/auth/unique_nickname_check/[nickname]/route.ts
import { NextRequest, NextResponse } from 'next/server'

// URL бэкенда из env (см. комментарий в send-code/route.ts)
const BACKEND_URL =
    process.env.BACKEND_URL ||
    'https://api.test.chat.ktsf.ru'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nickname: string }> },
) {
    const { nickname } = await params

    if (!nickname || typeof nickname !== 'string') {
        return NextResponse.json(
            { error: 'Invalid nickname' },
            { status: 400 },
        )
    }

    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const url = apiKey
        ? `${BACKEND_URL}/api/v1/auth/messenger/profile/unique_nickname_check/${encodeURIComponent(nickname)}/?api_key=${apiKey}`
        : `${BACKEND_URL}/api/v1/auth/messenger/profile/unique_nickname_check/${encodeURIComponent(nickname)}/`

    try {
        const response = await fetch(url)
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error checking nickname:', error)
        return NextResponse.json(
            { error: 'Failed to check nickname' },
            { status: 500 },
        )
    }
}
