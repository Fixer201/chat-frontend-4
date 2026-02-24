// 1. Импорт стилей всегда должен быть первым в файле (ESLint rule: import/order).
// Это помогает быстрее находить зависимости и избегать конфликтов.
import '@app/globals.css'

import { Roboto } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

// Инициализация шрифта Roboto.
// 'display: swap' предотвращает невидимый текст при загрузке шрифта (FOUT).
const roboto = Roboto({
    subsets: ['latin', 'latin-ext', 'cyrillic'],
    weight: ['400', '500', '700'],
    display: 'swap',
})
const bodyClassName = `${roboto.className} h-full`

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        // Рекомендуется указывать lang="ru", если приложение на русском, для читалок и SEO.
        <html lang="en" className="h-full">
            <body className={bodyClassName}>
                <main className="h-full overflow-hidden">
                    {children}
                    {/* Toaster из react-hot-toast рендеривается на клиенте, но может быть добавлен в RootLayout (Server Component) в Next.js 13/14 */}
                    <Toaster position="top-center" />
                </main>
            </body>
        </html>
    )
}
