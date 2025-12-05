
'use client';

import Image from 'next/image';

export function AppHeader() {
  return <>
    <div className="flex justify-center items-center m-1">
      <div className="w-[1200px] h-[60px] left-[120px] flex items-center flex-row justify-between pr-4 pl-4 rotate-0 opacity-100 rounded-br-lg rounded-bl-lg border-r 
  border-b border-l border-[#EEEEEE] bg-[#F5F6F8] ">

        <Image src="/images/header/Logo.svg" alt="Logo" width={49} height={44} />
        <div className="w-[308px] h-11 gap-2 flex flex-row items-center">

          <Image src="/images/header/appStore.svg" alt="appStore" width={150} height={44} />
          <Image src="/images/header/googleplay.svg" alt="googleplay" width={150} height={44} />

        </div>

      </div>
    </div>
  </>;
}