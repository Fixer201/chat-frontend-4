export function getUserIdFromToken(
    token?: string | null,
): string | null {
    if (!token) return null

    try {
        const [, payload] = token.split('.')
        if (!payload) return null

        const base64 = payload
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            '=',
        )
        const decoded = atob(padded)
        const data = JSON.parse(decoded) as {
            user_id?: string
            userId?: string
        }

        return data.user_id ?? data.userId ?? null
    } catch {
        return null
    }
}
