import StartScreen from "@modules/auth/components/StartScreen";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="hidden md:flex w-360 h-256 bg-[url(/images/login/Background.svg)] loading=eager justify-center relative items-center flex-col">
        <StartScreen />
      </div>
      
    </div>
  );
}