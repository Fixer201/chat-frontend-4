'use client';
import { Button } from "@shared/ui/button/Button";
import { Input } from "@shared/ui/Input";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const handleStartClick = () => {
    router.push('/login');
  };

  return <>
    <div className="flex flex-col items-center justify-center w-122 h-[760px] rounded-2xl bg-[url(/images/login/StartPage.svg)] absolute drop-shadow-[-24px_-24px_80px_#695C7A26]">
      <div className="flex flex-col items-center w-90 h-[608px] absolute gap-6 justify-between">
        <div className="relative flex items-center w-90 h-[70px]">
          <Image
            src="/images/login/back.svg"
            alt="Back"
            width={32}
            height={32}
            className="absolute top-0 left-0 cursor-pointer"
            loading="eager"
            onClick={handleStartClick}
          />
          <Image
            src="/images/login/Logo.svg"
            alt="Logo"
            width={78}
            height={70}
            className="mx-auto"
            loading="eager"
          />
        </div>

        <div className="flex flex-col items-center w-90 h-[506px] gap-6 justify-between">
          <div className="flex items-center justify-center w-90">
            <p className="font-bold text-[32px] text-center">Вход/регистрация</p>
          </div>
          <div className="flex flex-col items-center w-90 h-[450px] justify-between">
            <Input label="Введите номер телефона" placeholder="+7 900 000 00 00" borderColor="gray" textColor="gray" inputSize="lg" />
            <Button variant="solid" size="md" className="w-full">Далее</Button>
          </div>
        </div>
      </div>
    </div>
  </>


}
