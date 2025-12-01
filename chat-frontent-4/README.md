# Chat Frontend 4

Веб-приложение мессенджера на Next.js с модульной архитектурой.

---

## 🚀 Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```
Приложение будет доступно на http://localhost:3000

### Сборка для production
```bash
npm run build
npm start
```

### Очистка кэша при проблемах
```bash
rm -rf .next
npm run dev
```

---

## 📦 Технологии

- **Framework:** Next.js 16 (App Router)
- **Язык:** TypeScript
- **Стили:** Tailwind CSS
- **State Management:** Redux Toolkit
- **UI Components:** shadcn/ui
- **API:** tRPC (готов к подключению)

---

## 📁 Структура проекта

```
chat-frontend-4/
├── src/                          # Исходный код
│   ├── app/                      # Next.js App Router (страницы)
│   │   ├── (public)/             # Публичные страницы (БЕЗ Header/Sidebar)
│   │   │   ├── auth/
│   │   │   │   ├── login/        # Страница входа
│   │   │   │   ├── register/     # Страница регистрации
│   │   │   │   └── restore/      # Восстановление пароля
│   │   │   └── support/          # Публичная поддержка
│   │   │
│   │   ├── (private)/            # Приватные страницы (С Header/Sidebar)
│   │   │   ├── layout.tsx        # Layout с Redux + tRPC + AppShell
│   │   │   ├── chats/            # Список чатов (главная страница)
│   │   │   │   ├── [chatId]/     # Отдельный чат
│   │   │   │   └── create/
│   │   │   │       ├── group/    # Создание группы
│   │   │   │       └── channel/  # Создание канала
│   │   │   ├── contacts/         # Контакты
│   │   │   ├── settings/         # Настройки
│   │   │   │   ├── profile/      # Настройки профиля
│   │   │   │   ├── blacklist/    # Чёрный список
│   │   │   │   └── support/      # Поддержка
│   │   │   └── search/           # Глобальный поиск
│   │   │
│   │   ├── layout.tsx            # Корневой layout
│   │   ├── page.tsx              # Редирект на /chats
│   │   └── globals.css           # Глобальные стили
│   │
│   ├── modules/                  # Модули функциональности
│   │   ├── core/                 # Ядро приложения
│   │   │   └── components/
│   │   │       ├── AppShell.tsx       # Обёртка с Header + Sidebar
│   │   │       ├── AppHeader.tsx      # Шапка приложения
│   │   │       └── AppSidebar.tsx     # Боковое меню
│   │   │
│   │   ├── auth/                 # Модуль авторизации
│   │   │   └── components/
│   │   │       ├── StartScreen.tsx
│   │   │       ├── LoginForm.tsx
│   │   │       ├── RegisterForm.tsx
│   │   │       └── CodeConfirmForm.tsx
│   │   │
│   │   ├── chats-list/           # Список чатов
│   │   │   └── components/
│   │   │       ├── ChatsList.tsx
│   │   │       ├── ChatListItem.tsx
│   │   │       ├── ChatListSearch.tsx
│   │   │       ├── ChatContextMenu.tsx
│   │   │       ├── EmptyChatsState.tsx
│   │   │       ├── ChatDeleteModal.tsx
│   │   │       └── ChatSuccessToast.tsx
│   │   │
│   │   ├── chat-room/            # Комната чата
│   │   │   └── components/
│   │   │       ├── MessagesList.tsx
│   │   │       ├── MessageItem.tsx
│   │   │       ├── DateDivider.tsx
│   │   │       ├── TypingIndicator.tsx
│   │   │       └── BlockedChatBanner.tsx
│   │   │
│   │   ├── message-composer/     # Ввод сообщений
│   │   │   └── components/
│   │   │       ├── MessageComposer.tsx
│   │   │       ├── AttachmentsPreview.tsx
│   │   │       ├── ReplyPreview.tsx
│   │   │       └── EditModeBar.tsx
│   │   │
│   │   ├── contacts/             # Контакты
│   │   ├── groups/               # Группы
│   │   ├── channels/             # Каналы
│   │   ├── user-profile/         # Профиль пользователя
│   │   ├── settings/             # Настройки
│   │   ├── search/               # Поиск
│   │   ├── notifications/        # Уведомления
│   │   └── support/              # Поддержка
│   │
│   ├── shared/                   # Общие ресурсы
│   │   ├── ui/                   # UI компоненты
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── ... (11 компонентов)
│   │   │
│   │   ├── api/                  # API клиенты
│   │   │   ├── client.ts         # HTTP клиент
│   │   │   └── trpc/
│   │   │       ├── client.ts     # tRPC клиент
│   │   │       └── provider.tsx  # tRPC Provider
│   │   │
│   │   ├── hooks/                # React хуки
│   │   │   ├── useAuth.ts        # Авторизация
│   │   │   ├── useDebounce.ts    # Задержка (поиск)
│   │   │   ├── useDisclosure.ts  # Открытие/закрытие
│   │   │   ├── useMediaQuery.ts  # Адаптивность
│   │   │   └── usePagination.ts  # Пагинация
│   │   │
│   │   ├── types/                # TypeScript типы
│   │   │   ├── user.ts
│   │   │   ├── chat.ts
│   │   │   ├── message.ts
│   │   │   ├── group.ts
│   │   │   └── channel.ts
│   │   │
│   │   ├── config/               # Конфигурация
│   │   │   ├── routes.ts         # Маршруты приложения
│   │   │   ├── env.ts            # Переменные окружения
│   │   │   └── constants.ts      # Константы
│   │   │
│   │   └── lib/                  # Утилиты
│   │       ├── formatDate.ts     # Форматирование дат
│   │       ├── formatFileSize.ts # Размер файлов
│   │       └── mapApiError.ts    # Обработка ошибок
│   │
│   ├── redux/                    # Redux store
│   │   ├── store.ts              # Конфигурация store
│   │   ├── ReduxProvider.tsx     # Provider для приложения
│   │   └── slices/               # Слайсы состояния
│   │       ├── userSlice.ts      # Пользователь
│   │       ├── chatsSlice.ts     # Чаты
│   │       ├── contactsSlice.ts  # Контакты
│   │       └── uiSlice.ts        # UI состояние
│   │
│   └── lib/                      # Дополнительные утилиты
│       └── utils.ts              # cn() для Tailwind
│
├── public/                       # Статические файлы
├── .next/                        # Сборка Next.js (НЕ коммитить)
├── node_modules/                 # Зависимости (НЕ коммитить)
│
├── package.json                  # Зависимости проекта
├── tsconfig.json                 # Конфиг TypeScript
├── next.config.ts                # Конфиг Next.js
├── tailwind.config.ts            # Конфиг Tailwind
├── components.json               # Конфиг shadcn/ui
└── README.md                     # Документация
```

---

## 🎯 Маршруты приложения

### Публичные (без Header/Sidebar)
- `/auth/login` - Вход
- `/auth/register` - Регистрация
- `/auth/restore` - Восстановление пароля
- `/support` - Поддержка

### Приватные (с Header/Sidebar)
- `/` → редирект на `/chats`
- `/chats` - **Главная страница** (список чатов)
- `/chats/[chatId]` - Отдельный чат
- `/chats/create/group` - Создать группу
- `/chats/create/channel` - Создать канал
- `/contacts` - Контакты
- `/settings` - Настройки
- `/settings/profile` - Профиль
- `/settings/blacklist` - Чёрный список
- `/settings/support` - Поддержка
- `/search` - Глобальный поиск

---

## 🏗 Архитектура

### Feature-Sliced Design (модульная архитектура)

Проект разделён на слои:

1. **app/** - Роутинг (Next.js App Router)
2. **modules/** - Бизнес-логика по фичам
3. **shared/** - Переиспользуемые ресурсы
4. **redux/** - Глобальное состояние

### Импорты через алиасы
```typescript
import AppShell from '@modules/core/components/AppShell';
import Button from '@shared/ui/Button';
import { useAuth } from '@shared/hooks/useAuth';
import { store } from '@redux/store';
```

Алиасы настроены в `tsconfig.json`:
- `@app/*` → `src/app/*`
- `@modules/*` → `src/modules/*`
- `@shared/*` → `src/shared/*`
- `@redux/*` → `src/redux/*`
- `@lib/*` → `src/lib/*`

---

## 🔧 Основные файлы

### `src/app/(private)/layout.tsx`
Главный layout для приватных страниц. Оборачивает все страницы в:
- Redux Provider (доступ к store)
- tRPC Provider (API клиент)
- AppShell (Header + Sidebar)

### `src/modules/core/components/AppShell.tsx`
Основная обёртка приложения. Содержит Header, Sidebar и контент.

### `src/redux/store.ts`
Конфигурация Redux store со всеми слайсами.

### `src/shared/config/routes.ts`
Централизованное управление маршрутами приложения.

---

## 📝 Как работать с проектом

### Добавить новую страницу
1. Создай файл в `src/app/(private)/` или `src/app/(public)/`
2. Экспортируй React компонент
3. Страница автоматически станет доступна по URL

Пример:
```tsx
// src/app/(private)/profile/page.tsx
export default function ProfilePage() {
  return <div>Profile</div>;
}
// Доступно на /profile
```

### Добавить новый модуль
1. Создай папку в `src/modules/`
2. Добавь `components/` внутри
3. Создай компоненты модуля

### Добавить UI компонент
1. Создай файл в `src/shared/ui/`
2. Экспортируй компонент
3. Используй через `@shared/ui/ComponentName`

### Добавить хук
1. Создай файл в `src/shared/hooks/`
2. Экспортируй хук
3. Используй через `@shared/hooks/useHookName`

### Работа с Redux
```tsx
// Использование в компоненте
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '@redux/slices/userSlice';

const user = useSelector((state) => state.user.currentUser);
const dispatch = useDispatch();
dispatch(setUser(userData));
```

---

## 🐛 Решение проблем

### Проект не запускается
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Ошибки компиляции
```bash
rm -rf .next
npm run dev
```

### TypeScript ошибки
```bash
# Проверь tsconfig.json
# Убедись что baseUrl: "src"
```

---

## 📚 Полезные команды

```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Production сборка
npm run start        # Запуск production версии
npm run lint         # Проверка кода
```

---

## 🤝 Разработка

1. Создай новую ветку: `git checkout -b feature/название`
2. Внеси изменения
3. Коммит: `git commit -m "описание"`
4. Push: `git push origin feature/название`
5. Создай Pull Request

---


