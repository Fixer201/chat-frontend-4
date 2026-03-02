import { NextRequest, NextResponse } from 'next/server'

// URL бэкенда из env (см. комментарий в send-code/route.ts)
const BACKEND_URL =
    process.env.BACKEND_URL ||
    'https://api.test.chat.ktsf.ru'

// Прокси для мягкого удаления профиля по UID через бэкенд.
// Задача: принять DELETE с фронта, пробросить на API и вернуть ответ как есть.
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ uid: string }> },
) {
    // params в App Router — промис, поэтому дожидаемся
    const { uid } = await context.params

    if (!uid) {
        return NextResponse.json(
            { error: 'UID is required' },
            { status: 400 },
        )
    }

    try {
        // Проксируем Authorization, чтобы бэк мог идентифицировать пользователя
        const authHeader =
            request.headers.get('authorization')

        const response = await fetch(
            `${BACKEND_URL}/api/v1/auth/messenger/profile/${uid}/`,
            {
                method: 'DELETE',
                headers: {
                    accept: 'application/json',
                    ...(authHeader && {
                        Authorization: authHeader,
                    }),
                },
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

        // Возвращаем те же статус-коды и тело, что пришли с бэка, чтобы фронт получал реальный результат
        return NextResponse.json(data, {
            status: response.status,
        })
    } catch (error) {
        console.error('Delete profile proxy error:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: String(error),
            },
            { status: 500 },
        )
    }
}
