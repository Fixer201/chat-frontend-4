import RegisterForm from "@modules/auth/components/RegisterForm";

export default function RegisterPage() {
  return (

 <div className="min-h-screen flex justify-center items-center">
      <div className="hidden md:flex w-300 h-256 bg-[url(/images/login/Background.svg)] loading=eager justify-center relative items-center flex-col">
        <RegisterForm />
      </div>
      
    </div>



  );
}