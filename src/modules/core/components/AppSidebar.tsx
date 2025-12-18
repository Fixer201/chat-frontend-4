'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@shared/lib/utils';
import ContactsIcon from '@shared/ui/icons/app-sidebar/ContactsIcon';
import MessageIcon from '@shared/ui/icons/app-sidebar/MessageIcon';
import ServiceIcon from '@shared/ui/icons/app-sidebar/ServiceIcon';
import SettingsIcon from '@shared/ui/icons/app-sidebar/SettingsIcon';

const iconBaseClass = 'h-8 w-8 transition-colors';

const navItems = [
  { id: 'messages', label: 'Messages', Icon: MessageIcon, path: '/chats' },
  { id: 'service', label: 'Services', Icon: ServiceIcon, path: '/test-components' },
  { id: 'contacts', label: 'Contacts', Icon: ContactsIcon, path: '/contacts' },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
];

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<string | null>(navItems[0]?.id ?? null);

  useEffect(() => {
    const matchedItem = navItems.find(({ path }) => path && pathname.startsWith(path));
    if (matchedItem) {
      setActiveItem(matchedItem.id);
    }
  }, [pathname]);

  return (
    <nav className="flex h-[228px] w-12 flex-col items-center justify-between gap-3 p-2">
      {navItems.map(({ id, label, Icon, path }) => {
        const isActive = activeItem === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => {
              setActiveItem(id);
              if (path) {
                router.push(path);
              }
            }}
            aria-pressed={isActive}
            className={cn(
              'flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg border p-2 transition-colors',
              isActive
                ? 'border-[#EEEEEE] bg-[#F5F6F8]'
                : 'border-transparent hover:border-[#EEEEEE] hover:bg-[#F5F6F8]'
            )}
          >
            <Icon
              className={cn(iconBaseClass, isActive ? 'text-accent-violet-primary' : 'text-[#747474]')}
              aria-hidden
            />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

