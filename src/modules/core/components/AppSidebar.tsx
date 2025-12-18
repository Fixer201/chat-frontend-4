'use client';
import Image from 'next/image';

export default function AppSidebar() {
  return <>
<div className="w-12 h-[228px] left-[120px] top-[84px] gap-3 flex flex-col p-[8px] justify-between content-center md:flex">
      <Image src="/images/appSidebar/Message.svg" alt="Message" width={32} height={32} loading="eager"/>
      <Image src="/images/appSidebar/aService.svg" alt="a-service" width={32} height={32} loading="eager"/>
      <Image src="/images/appSidebar/personSearch.svg" alt="personSearch" width={32} height={32} loading="eager"/>
      <Image src="/images/appSidebar/MainIconsWeb.svg" alt="MainIconsWeb" width={32} height={32} loading="eager"/>
    </div>
  </>;
}

