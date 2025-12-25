import RegisterForm from "@modules/auth/components/RegisterForm";

export default function RegisterPage() {
  return (

 <div className="min-h-screen flex justify-center items-center">
      <div className="hidden md:flex w-(--app-login-width) h-(--app-login-height) bg-(--app-login-background) justify-center relative items-center flex-col">
        <RegisterForm />
      </div>
      
    </div>



  );
}