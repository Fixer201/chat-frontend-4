export interface BaseLink {
  id: number;
  title: string;
  url: string;
  sender: string;
  date: string;
  domain?: string;
  senderInitials?: string;
}

export interface BackendLink {
  url: string;
  title: string;
  from_user: {
    first_name: string;
    last_name: string;
  };
  message_id: number;
  forwarded_in: Array<{
    id: number;
    uid: string;
    from_user: string;
  }>;
  created_at: number;
  updated_at: number;
}

export interface MockLink {
  url: string;
  title?: string;
  sender?: string;
  date?: string;
  createdAt?: number;
}

export interface LinksPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BackendLink[];
}