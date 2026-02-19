// utils/fileUtils.ts
import { BaseFile, BackendFile, MockFile, AudioFile } from '../types/file';

// Функция определения типа файла по расширению
export const getFileTypeFromExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'doc';
    case 'ppt':
    case 'pptx':
      return 'ppt';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return 'image';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return 'archive';
    case 'xls':
    case 'xlsx':
      return 'excel';
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'mkv':
      return 'video';
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
      return 'audio';
    case 'txt':
    case 'md':
      return 'text';
    case 'sketch':
      return 'sketch';
    default:
      return 'unknown';
  }
};

// Функция форматирования размера из байтов в строку с единицами
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Функция форматирования времени последнего подключения (из задания)
export const formatLastSeen = (lastSeenMs: number): string => {
  const lastSeen = new Date(lastSeenMs);
  const now = new Date();

  // Проверяем сегодняшний день
  if (
    lastSeen.getDate() === now.getDate() &&
    lastSeen.getMonth() === now.getMonth() &&
    lastSeen.getFullYear() === now.getFullYear()
  ) {
    const hours = lastSeen
      .getHours()
      .toString()
      .padStart(2, '0');
    const minutes = lastSeen
      .getMinutes()
      .toString()
      .padStart(2, '0');
    return `Сегодня, ${hours}:${minutes}`;
  }

  // Проверяем эту неделю
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (lastSeen > weekAgo) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[lastSeen.getDay()];
  }

  // Более старые даты
  const day = lastSeen
    .getDate()
    .toString()
    .padStart(2, '0');
  const month = (lastSeen.getMonth() + 1)
    .toString()
    .padStart(2, '0');
  const year = lastSeen.getFullYear();
  return `${day}.${month}.${year}`;
};

// Улучшенная функция форматирования даты для файлов
export const formatFileDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `Сегодня, ${hours}:${minutes}`;
  } else if (diffDays === 1) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `Вчера, ${hours}:${minutes}`;
  } else if (diffDays < 7) {
    return `${diffDays} дня назад`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'неделю' : 'недели'} назад`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'месяц' : 'месяца'} назад`;
  }
  
  // Если больше года, используем formatLastSeen
  return formatLastSeen(timestamp);
};

// Функция извлечения имени файла из URL
export const getFileNameFromUrl = (url: string): string => {
  return url.split('/').pop() || 'Безымянный файл';
};

// Функция преобразования бэкенд файла в BaseFile
export const backendFileToBaseFile = (backendFile: BackendFile): BaseFile => {
  const name = getFileNameFromUrl(backendFile.file_url);
  const sizeInMB = backendFile.size / (1024 * 1024); // байты в МБ
  const type = backendFile.file_type || getFileTypeFromExtension(name);
  
  return {
    id: backendFile.id,
    name,
    url: backendFile.file_url, // добавляем url
    size: formatFileSize(backendFile.size),
    date: formatFileDate(backendFile.updated_at),
    type,
    isLoading: false,
    progress: 0,
    originalSize: parseFloat(sizeInMB.toFixed(2))
  };
};

// Функция преобразования мокового файла в BaseFile
export const mockFileToBaseFile = (mockFile: MockFile, id: number): BaseFile => {
  const name = getFileNameFromUrl(mockFile.url);
  const type = getFileTypeFromExtension(name);
  
  // Генерируем случайный размер (в будущем можно заменить реальными данными)
  const randomSize = mockFile.size || Math.random() * 100 * 1024 * 1024; // до 100 МБ
  const sizeInMB = randomSize / (1024 * 1024);
  
  // Генерируем случайную дату за последние 3 месяца
  const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  const randomDate = mockFile.created_at || 
    Math.floor(Math.random() * (Date.now() - threeMonthsAgo)) + threeMonthsAgo;
  
  return {
    id,
    name,
    url: mockFile.url, // добавляем url
    size: formatFileSize(randomSize),
    date: formatFileDate(randomDate),
    type,
    isLoading: false,
    progress: 0,
    originalSize: parseFloat(sizeInMB.toFixed(2))
  };
};

// Основная функция для преобразования любых файлов
export const transformFiles = (
  files: Array<BackendFile | MockFile>,
  source: 'backend' | 'mock' = 'mock'
): BaseFile[] => {
  return files.map((file, index) => {
    if (source === 'backend') {
      return backendFileToBaseFile(file as BackendFile);
    } else {
      return mockFileToBaseFile(file as MockFile, index + 1);
    }
  });
};

// Функция форматирования времени в формат MM:SS
export const formatAudioDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Функция преобразования файла в AudioFile
export const fileToAudioFile = (file: BaseFile): AudioFile => {
  // Генерируем случайную длительность от 30 сек до 4 минут
  const totalDuration = Math.floor(Math.random() * (240 - 30) + 30);
  
  return {
    ...file,
    duration: formatAudioDuration(totalDuration),
    isPlaying: false,
    currentTime: 0,
    totalDuration
  };
};