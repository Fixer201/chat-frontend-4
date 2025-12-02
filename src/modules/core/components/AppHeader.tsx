
'use client';

import Image from 'next/image';
export function AppHeader() {
  return <>
   <div className="flex justify-center items-center">
  <div className="w-[1200px] h-[60px] left-[120px] flex flex-row justify-between pr-4 pl-4 rotate-0 opacity-100 rounded-br-lg rounded-bl-lg border-r 
  border-b border-l border-[#EEEEEE] bg-[#F5F6F8] ">
 
 <Image src="/images/Logo.svg" alt="Logo" width={49} height={44} />  

</div>
</div>
  </>;
}