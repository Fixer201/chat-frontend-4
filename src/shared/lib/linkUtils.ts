import { BaseLink, BackendLink, MockLink } from '../types/link';
import { formatFileDate } from './fileUtils';

// Функция получения заголовка из URL
export const getTitleFromUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      return decodeURIComponent(lastPart)
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/\.(html|php|asp|aspx)$/, '');
    }
    
    return parsedUrl.hostname.replace('www.', '');
  } catch {
    return 'Безымянная ссылка';
  }
};

// Функция извлечения домена из URL
export const getDomainFromUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.replace('www.', '');
  } catch {
    return url.split('/')[0] || 'unknown';
  }
};

// Функция генерации случайного отправителя
export const generateRandomSender = (index: number): string => {
  const firstNames = ['Алексей', 'Мария', 'Дмитрий', 'Екатерина', 'Иван', 'Анна', 'Сергей', 'Ольга'];
  const lastNames = ['Иванов', 'Петрова', 'Сидоров', 'Смирнова', 'Кузнецов', 'Васильева', 'Попов', 'Новикова'];
  
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[(index + 1) % lastNames.length];
  
  return `${firstName} ${lastName}`;
};

// Функция получения инициалов отправителя
export const getSenderInitials = (sender: string): string => {
  const names = sender.split(' ');
  if (names.length >= 2) {
    return `${names[0].charAt(0)}`.toUpperCase();
  }
  return sender.charAt(0).toUpperCase();
};

// Преопределенные заголовки для моков (чтобы сохранить оригинальные названия)
const PREDEFINED_TITLES = [
  'Дизайн система проекта',
  'Документация API',
  'Полезная статья по UI/UX',
  'Гитхаб репозиторий',
  'Google Диск с материалами',
  'Jira доска проекта',
  'Таблица с данными',
  'Онлайн встреча Zoom',
  'Мокапы проекта',
  'Чек-лист тестирования'
];

// Преопределенные отправители для моков
const PREDEFINED_SENDERS = [
  'Алексей Иванов',
  'Мария Петрова',
  'Дмитрий Сидоров',
  'Екатерина Смирнова',
  'Иван Кузнецов',
  'Алексей Иванов',
  'Мария Петрова',
  'Дмитрий Сидоров',
  'Екатерина Смирнова',
  'Иван Кузнецов'
];

// Преопределенные даты для моков
const PREDEFINED_DATES = [
  'Сегодня',
  'Вчера',
  '3 дня назад',
  'Неделю назад',
  '2 недели назад',
  'Месяц назад',
  'Месяц назад',
  '2 месяца назад',
  '2 месяца назад',
  '3 месяца назад'
];

// Функция преобразования бэкенд ссылки в BaseLink
export const backendLinkToBaseLink = (backendLink: BackendLink, id: number): BaseLink => {
  const sender = backendLink.from_user 
    ? `${backendLink.from_user.first_name} ${backendLink.from_user.last_name}`
    : 'Неизвестный отправитель';
    
  return {
    id,
    title: backendLink.title,
    url: backendLink.url,
    sender,
    date: formatFileDate(backendLink.created_at || backendLink.updated_at),
    domain: getDomainFromUrl(backendLink.url),
    senderInitials: getSenderInitials(sender),
  };
};

// Функция преобразования моковой ссылки в BaseLink
export const mockLinkToBaseLink = (mockLink: MockLink, index: number): BaseLink => {
  const id = index + 1;
  
  // Используем предопределенные данные для первых 10 элементов
  const usePredefined = index < 10;
  
  const title = mockLink.title || (usePredefined ? PREDEFINED_TITLES[index] : getTitleFromUrl(mockLink.url));
  const sender = mockLink.sender || (usePredefined ? PREDEFINED_SENDERS[index] : generateRandomSender(index));
  const date = mockLink.date || (usePredefined ? PREDEFINED_DATES[index] : formatFileDate(mockLink.createdAt || Date.now()));
  
  return {
    id,
    title,
    url: mockLink.url,
    sender,
    date,
    domain: getDomainFromUrl(mockLink.url),
    senderInitials: getSenderInitials(sender),
  };
};

// Основная функция для преобразования любых ссылок
export const transformLinks = (
  links: Array<BackendLink | MockLink>,
  source: 'backend' | 'mock' = 'mock'
): BaseLink[] => {
  return links.map((link, index) => {
    if (source === 'backend') {
      return backendLinkToBaseLink(link as BackendLink, index + 1);
    } else {
      return mockLinkToBaseLink(link as MockLink, index);
    }
  });
};