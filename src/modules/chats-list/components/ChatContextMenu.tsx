'use client';

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
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 1000,
        }}
        width={200}
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
