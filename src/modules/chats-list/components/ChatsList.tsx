
'use client';

import { error } from 'console';
import { useEffect, useState } from 'react';

interface Chat {
    uid: string,
    username: string,
    nickname: string,
    first_name: string,
    last_name: string,
    avatar: string,
    avatar_url: string,
    avatar_webp: string,
    avatar_webp_url: string,
    is_blocked: boolean,
    is_online: boolean
    was_online_at: number,
    is_in_contacts: boolean
}

export default function ChatsList() {
  
  
    return (
        <div>список чатов</div>
    );
 

  
}