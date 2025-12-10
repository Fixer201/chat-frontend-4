
'use client';

import Image from 'next/image';

export default function AppSidebar() {
  return <>
{/* <div className="flex justify-between p-[8px] content-center m-1"> */}
    <div className="w-12 h-[228px] left-[120px] top-[84px] gap-3 flex flex-col p-2 justify-between content-center md:flex">
      <Image src="/images/AppSidebar/Message.svg" alt="Message" width={32} height={32} />
      <Image src="/images/AppSidebar/aService.svg" alt="a-service" width={32} height={32} />
      <Image src="/images/AppSidebar/personSearch.svg" alt="personSearch" width={32} height={32} />
      <Image src="/images/AppSidebar/MainIconsWeb.svg" alt="MainIconsWeb" width={32} height={32} />
    </div>
{/* </div> */}
  </>;
}

