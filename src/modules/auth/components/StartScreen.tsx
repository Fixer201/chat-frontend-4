'use client';
import { Button } from "@shared/ui/button/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function StartScreen() {
  const router = useRouter();  

  const handleStartClick = () => {
    router.push('/auth/register');  
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center w-122 h-190 rounded-2xl bg-[url(/images/login/StartPage.svg)] loading=eager absolute drop-shadow-[-24px_-24px_80px_#695C7A26]">
        <Image
          src="/images/login/Logo.svg"
          alt="Logo"
          width={179}
          height={161}
          className="absolute top-18 left-41 z-10"
          loading="eager"
        />
           
        <div className="flex flex-col justify-between w-90 h-95 absolute top-74 left-16 gap-4">
   
          <div className="flex flex-col items-center gap-6">
            <span className="text-text-primary bold">А-Чат</span>
            <span className="text-app-accent-violet-primary inline text-center"> <p>Привет! </p> <p>Давай знакомиться!</p> </span>
          </div>   
          <Button variant="primary" size="md" className="w-full" onClick={handleStartClick}>Начать</Button>
        </div>
      </div>
    </>
  );
}