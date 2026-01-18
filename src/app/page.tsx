import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function Home() {
    const cookieStore = await cookies()
    const accessToken =
        cookieStore.get('access_token')?.value

    if (accessToken) {
        redirect('/chats')
    } else {
        redirect('/auth/login')
    }
}
