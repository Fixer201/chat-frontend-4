import RegisterForm from '@modules/auth/components/RegisterForm'

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div
                className={`
        relative hidden h-(--app-login-height) w-(--app-login-width) flex-col
        items-center justify-center bg-(--app-login-background)
        md:flex
      `}
            >
                <RegisterForm />
            </div>
        </div>
    )
}
