// types/file.ts (создайте этот файл)
export interface BaseFile {
  id: number;
  name: string;
  url: string; 
  size: string; // форматированный размер, например "3.5 MB"
  date: string; // форматированная дата
  type: string;
  isLoading: boolean;
  progress: number;
  originalSize: number; // размер в МБ (для анимации)
}

// Интерфейс для файла с бэкенда
export interface BackendFile {
  id: number;
  uid: string;
  message_id: number;
  file_url: string;
  file_webp_url?: string;
  file_type?: string;
  size: number; // размер в байтах
  updated_at: number; // timestamp в миллисекундах
  created_at: number; // timestamp в миллисекундах
}

// Интерфейс для локального мокового файла
export interface MockFile {
  url: string;
  // опциональные поля, если нужно передать дополнительные данные
  size?: number; // в байтах
  created_at?: number; // timestamp
}
// Интерфейс для аудио сообщений
export interface AudioFile extends BaseFile {
  duration: string; // форматированная длительность "1:30"
  isPlaying: boolean;
  currentTime: number; // текущее время в секундах
  totalDuration: number; // общая длительность в секундах
}