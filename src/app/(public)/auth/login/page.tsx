import StartScreen from '@modules/auth/components/StartScreen'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div
                className={`
                  relative hidden h-(--app-login-height) w-(--app-login-width)
                  flex-col items-center justify-center
                  bg-(--app-login-background)
                  md:flex
                `}
            >
                <StartScreen />
            </div>
        </div>
    )
}
