'use client';

import { forwardRef } from 'react';
import { Avatar, AvatarProps } from '@shared/ui/avatar/Avatar';
import { cn } from '@shared/lib/utils';

export interface ChatListItemProps extends Omit<AvatarProps, 'mode' | 'className'> {
  selected?: boolean;
}

export const ChatListItem = forwardRef<HTMLDivElement, ChatListItemProps>(
  ({ selected, onClick, ...avatarProps }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-2 py-1 transition-all duration-200', 
          // `hover:${selected?'bg-[#7769E1]':'bg-[#EFEEF7]'} hover:rounded-lg`, 
          // selected && 'bg-[#7769E1] rounded-lg', 
          'relative' 
        )}
        onClick={onClick}
      >
        
        <div 
          className="absolute bottom-0 left-[calc(60px+12px+8px)] right-4 h-px bg-gray-200"
        />
        
        <Avatar
          {...avatarProps}
          mode="chat"
          selected={selected}
          className={cn(
            'bg-transparent hover:bg-transparent', // Базовые стили
            selected 
              ? 'bg-[#7769E1] hover:bg-[#7769E1]' 
              : 'hover:bg-[#EFEEF7]', 'hover:rounded-lg', 
              selected && 'rounded-lg'
          )}
        />
      </div>
    );
  }
);

ChatListItem.displayName = 'ChatListItem';