export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name?: string;
  lastMessage?: string;
  updatedAt: string;
}
