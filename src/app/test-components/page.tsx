'use client'

import { useState } from 'react';

import { Badge } from '@shared/ui/badge/Badge';
import { Button } from '@shared/ui/button/Button';
import { Avatar } from '@shared/ui/avatar/Avatar';


export default function TestComponentsPage() {
  const [deleteSelected, setDeleteSelected] = useState(false);

  return (
    <div className="max-w-xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Test Components</h1>
      <div>
        <h2 className="font-semibold mb-2">Button</h2>
       <Button variant="primary" size="md">Отправить</Button>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Badge</h2>
        <Badge variant="counter" color="primary" size="md">5</Badge>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Avatar: Contact</h2>
        <Avatar src="/images/chatHeader/userAvatar.svg" name="Влад Ляшев" mode="contact" statusText="в сети" isOnline />
      </div>
      <div>
        <h2 className="font-semibold mb-2">Avatar: Select Contact</h2>
        <p className="text-sm text-gray-500 mb-2">Нажмите на строку, чтобы переключить состояние</p>
        <Avatar
          src="/images/chatHeader/userAvatar.svg"
          name="Влад Ляшев"
          mode="select-contact"
          statusText="был(а) только что"
          isOnline={false}
          selected={deleteSelected}
          onClick={() => setDeleteSelected((prev) => !prev)}
          className="cursor-pointer"
        />
      </div>
      <div>
        <h2 className="font-semibold mb-2">Avatar: Chat</h2>
        <Avatar
          src="/images/chatHeader/userAvatar.svg"
          name="Алексей Митрофанов"
          mode="chat"
          messagePreview="Мурка по утрам на балкон рвётся."
          timestamp="ПН"
          unreadCount={5}
        />
      </div>
    </div>
  );
}