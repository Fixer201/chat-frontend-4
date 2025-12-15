'use client';
import { Badge } from '@shared/ui/badge/Badge'
import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'

export type AvatarMode =
    | 'contact'
    | 'select-contact'
    | 'chat'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  name: string;
  mode?: AvatarMode;
  statusText?: string;
  messagePreview?: string;
  timestamp?: string;
  unreadCount?: number;
  isOnline?: boolean;
  selected?: boolean;
  rightElement?: ReactNode;
  className?: string;
}

const rowBaseClasses = "flex gap-3 px-3 py-2 rounded-md transition-colors duration-200 select-none cursor-pointer";

const modeClasses: Record<AvatarMode, string> = {
  contact: "bg-gray-light hover:bg-[#EFEEF7] active:bg-(--color-accent-violet-dark)/60",
  "select-contact": "bg-white",
  chat: "bg-white hover:bg-[#EFEEF7]",
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      mode = "contact",
      statusText,
      messagePreview,
      timestamp,
      unreadCount,
      isOnline,
      selected,
      rightElement,
      className,
      ...props
    },
    ref
  ) => {
    const showUnread = mode === "chat" && typeof unreadCount === "number" && unreadCount > 0;
    const secondaryText = mode === "chat" ? messagePreview : statusText;
    const showChatMeta = mode === "chat" && (timestamp || showUnread);
    const showSelectIndicator = mode === "select-contact";
    const hasRightElement = Boolean(rightElement);
    const showRightSection = showChatMeta || showSelectIndicator || hasRightElement;
    return (
       <div
        ref={ref}
        className={cn(
          rowBaseClasses,
          modeClasses[mode],
          mode === "select-contact" && selected && "bg-(--color-accent-violet-dark)",
          mode === "chat" && "rounded-none",
          mode === "chat" && "relative",
          
          className
        )}
        {...props}
      >
       {mode === "chat" && (
          <div className="absolute bottom-0 left-[calc(60px+12px)] right-4 h-px bg-gray-200"></div>
        )}
        <div
          className={cn(
            "relative shrink-0 rounded-full overflow-hidden bg-gray-200 p-4",
            mode === "contact" ? "w-10 h-10" : "w-[60px] h-[60px]"
          )}
        >
          <Image
            src={src}
            alt={alt ?? name}
            fill
            sizes={mode === "contact" ? "40px" : "60px"}
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 border-b border-b-[#E4E4E4]">
          <div className="min-w-0 flex flex-col ">
            <p
              className={cn(
                "text-base font-medium truncate",
                mode === "select-contact" && selected ? "text-(--color-white-bg)" : "text-(--color-text-black)"
              )}
            >
              {name}
            </p>
           {secondaryText && (
              <p
                className={cn(
                  "text-sm truncate",
                  mode === "chat"
                    ? "text-(--color-text-gray)"
                    : mode === "select-contact" && selected
                      ? "text-white-bg/80"
                      : isOnline
                        ? "text-(--color-accent-violet-primary)"
                        : "text-(--color-text-gray)"
                )}
              >
                {secondaryText}
              </p>
            )}
          </div>
        </div>
        {showRightSection && (
          <div
            className={cn(
              "ml-3 flex gap-2",
              showChatMeta ? "items-start" : "items-center"
            )}
          >
          {showChatMeta && (
              <div className="flex flex-col items-center gap-1">
                {timestamp && (
                  <span className="text-xs text-(--color-text-gray) whitespace-nowrap">{timestamp}</span>
                )}
                {showUnread && (
                  <Badge variant="counter" color="primary" size="md">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            )}
            {showSelectIndicator && (
              <span
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  selected ? "bg-(--color-white-bg) border-(--color-white-bg)" : "border-(--color-accent-violet-primary)"
                )}
              >
                {selected && (
                  <Image
                    src="/images/Check.svg"
                    alt="selected"
                    width={20}
                    height={20}
                  />
                )}
              </span>
            )}
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

// Пример использования:
// <Avatar src="/images/user/image.svg" name="Влад Ляшев" mode="contact" statusText="в сети" />
// <Avatar src="/images/user/image.svg" name="Влад Ляшев" mode="select-contact" statusText="был(а) только что" selected />
// <Avatar src="/images/user/image.svg" name="Алексей Митрофанов" mode="chat" messagePreview="Мурка по утрам..." timestamp="ПН" unreadCount={56} />