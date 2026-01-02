import StartScreen from '@modules/auth/components/StartScreen'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="hidden md:flex w-(--app-login-width) h-(--app-login-height) bg-(--app-login-background) justify-center relative items-center flex-col">
                <StartScreen />
            </div>
        </div>
    )
}
