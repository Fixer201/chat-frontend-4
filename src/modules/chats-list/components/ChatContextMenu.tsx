'use client';

import { cn } from '@shared/lib/utils'
import Dropdown from '@shared/ui/dropdown/Dropdown';

interface ChatContextMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number };
  onDelete?: () => void;
  onPin?: () => void;
  onMute?: () => void;
  onArchive?: () => void;
  notificationsEnabled?: boolean;
}
export default function ChatContextMenu({
  open,
  onOpenChange,
  position,
  onDelete,
  onPin,
  onMute,
  onArchive,
  notificationsEnabled,
}: ChatContextMenuProps) {
  return (
     <Dropdown
      open={open}
      onOpenChange={onOpenChange}
      closeOnSelect={true}
    >
      <Dropdown.Content
        manualPosition={{ left: position.x, top: position.y }}
        className={cn("w-50")}
      >
        {onPin && (
          <Dropdown.Item onSelect={onPin}>
            Закрепить чат
          </Dropdown.Item>
        )}
        {onMute && (
          <Dropdown.Item onSelect={onMute}>
            {notificationsEnabled ? 'Отключить уведомления' : 'Включить уведомления'}
          </Dropdown.Item>
        )}
        {onArchive && (
          <Dropdown.Item onSelect={onArchive}>
            Архивировать
          </Dropdown.Item>
        )}
        {onDelete && (
          <Dropdown.Item 
            danger 
            onSelect={onDelete}
          >
            Удалить чат
          </Dropdown.Item>
        )}
      </Dropdown.Content>
    </Dropdown>
  )
}
