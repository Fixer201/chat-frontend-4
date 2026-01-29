import '@app/globals.css'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
    subsets: ['latin', 'latin-ext', 'cyrillic'],
    weight: ['400', '500', '700'],
    display: 'swap',
})

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full">
            <body
                className={`
                  ${roboto.className}
                  h-full
                `}
            >
                <main className={'h-full overflow-hidden'}>
                    {children}
                </main>
            </body>
        </html>
    )
}
