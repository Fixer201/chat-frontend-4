// WebSocket URL для клиентского кода.
// WebSocket-соединения нельзя проксировать через Next.js API routes,
// т.к. они требуют persistent connection (HTTP Upgrade → ws://),
// а route handlers обрабатывают только обычные HTTP request/response.
// Поэтому клиент подключается к бэкенду напрямую.
export const WS_URL =
    process.env.NEXT_PUBLIC_WS_URL ||
    'wss://api.test.chat.ktsf.ru'
