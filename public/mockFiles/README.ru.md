# A-Chat

Полнофункциональное веб-приложение мессенджера, демонстрирующее профессиональный подход к разработке.
Построено на Next.js 16, TypeScript и Redux Toolkit с использованием архитектуры Feature-Sliced Design.
Идеально для изучения enterprise-level организации кода, современных паттернов React и командной разработки.
---

## Доступные переводы README

[![RU](https://flagcdn.com/w20/ru.png) Russian](./README.ru.md)

[![EN](https://flagcdn.com/w20/us.png) English](../../README.md)

## Быстрый старт

### Установка

```bash
npm install
```

### Запуск среды разработки

```bash
npm run dev
```

**перейдите на `localhost:3000` и вы готовы**

### Сборка для продакшена

```bash
npm run build
npm start
```

### Если возникают проблемы, попробуйте очистить кеш next

```bash
rm -rf .next
npm run dev
```

---

## Используемые технологии

- **Фреймворк:** Next.js 16 (App Router)
- **Язык разработки:** TypeScript
- **Стилизация:** Tailwind CSS
- **Управление состоянием:** Redux Toolkit
- **UI компоненты:** shadcn/ui
- **API:** tRPC

---

## Структура проекта

```
chat-frontend-4/
├── src/                          # Исходный код
│   ├── app/                      # Next.js App Router (страницы)
│   │   ├── (public)/             # Публичные страницы (БЕЗ Header/Sidebar)
│   │   │   ├── auth/
│   │   │   │   ├── login/        # Страница входа
│   │   │   │   ├── register/     # Страница регистрации
│   │   │   │   └── restore/      # Восстановление пароля
│   │   │   └── support/          # Публичная страница поддержки
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
│   │   ├── chats-list/           # Модуль списка чатов
│   │   │   └── components/
│   │   │       ├── ChatsList.tsx
│   │   │       ├── ChatListItem.tsx
│   │   │       ├── ChatListSearch.tsx
│   │   │       ├── ChatContextMenu.tsx
│   │   │       ├── EmptyChatsState.tsx
│   │   │       ├── ChatDeleteModal.tsx
│   │   │       └── ChatSuccessToast.tsx
│   │   │
│   │   ├── chat-room/            # Модуль комнаты чата
│   │   │   └── components/
│   │   │       ├── MessagesList.tsx
│   │   │       ├── MessageItem.tsx
│   │   │       ├── DateDivider.tsx
│   │   │       ├── TypingIndicator.tsx
│   │   │       └── BlockedChatBanner.tsx
│   │   │
│   │   ├── message-composer/     # Модуль ввода сообщений
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
│   │   │   └── ... (ещё 11 компонентов)
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
│   │       └── mapApiError.ts    # Обработка ошибок API
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

## Маршрутизация приложения

### Публичные страницы (без авторизации)

- `/auth/login` - Страница входа для пользователей, у которых уже есть аккаунт.
- `/auth/register` - Страница регистрации для создания нового аккаунта.
- `/auth/restore` - Страница восстановления пароля, если учётные данные утеряны.
- `/support` - Страница поддержки для связи с командой поддержки.

### Приватные страницы (требуется авторизация)

- `/` → Редирект на `/chats`
- `/chats` - Главная страница (список чатов)
- `/chats/[chatId]` - Отдельный чат
- `/chats/create/group` - Создание группы
- `/chats/create/channel` - Создание канала

- `/contacts` - Контакты пользователя

- `/settings` - Настройки пользователя
- `/settings/profile` - Настройки профиля
- `/settings/blacklist` - Чёрный список
- `/settings/support` - Страница поддержки

- `/search` - Глобальный поиск (пользователи по номеру телефона, @тегу, никнейму; сообщения)

---

## Архитектура

### Feature-Sliced Design (модульная архитектура)

Проект разделён по срезам:

1. **app/** - Маршрутизация (Next.js App Router)
2. **modules/** - Логика по функциональным модулям
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

## Основные файлы

### `src/app/(private)/layout.tsx`

Главный layout для приватных страниц. Оборачивает все страницы в:

- Redux Provider (доступ к store)
- tRPC Provider (API клиент)
- AppShell (Header + Sidebar)

### `src/modules/core/components/AppShell.tsx`

Основная обёртка приложения. Содержит header, sidebar и контент.

### `src/redux/store.ts`

Конфигурация Redux store со всеми слайсами.

### `src/shared/config/routes.ts`

Централизованное управление маршрутами приложения.

---

## Работа с проектом

### Добавление новой страницы

1. Создайте файл в `src/app/(private)/` или `src/app/(public)/`
2. Экспортируйте React-компонент
3. Страница автоматически будет доступна по URL

Пример:

```tsx
// src/app/(private)/profile/page.tsx
export default function ProfilePage() {
    return <div>Profile</div>;
}
// Доступно на /profile
```

### Добавление нового модуля

1. Создайте папку в `src/modules/`
2. Добавьте папку `components/`
3. Создайте компоненты модуля

### Добавление UI компонента

1. Создайте файл в `src/shared/ui/`
2. Экспортируйте компонент
3. Используйте через `@shared/ui/ComponentName`

### Добавление хука

1. Создайте файл в `src/shared/hooks/`
2. Экспортируйте хук
3. Используйте через `@shared/hooks/useHookName`

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

## Полезные команды

```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка production окружения
npm run start        # Запуск production окружения
npm run lint         # Проверка кода
```

---

## Вклад в проект

1. Прочитать [docs/GIT-FLOW.md](../GIT-FLOW.md)
2. Создать форк репозиторий
3. Внести изменения
4. Создать коммит в соответствии с примером в [docs/COMMIT-STRUCTURE.md](../COMMIT-STRUCTURE.md)
5. Создать pull request или issue
   5.1 Pull https://github.com/akatosphere/chat-frontend-4/pulls
   5.2 Issue https://github.com/akatosphere/chat-frontend-4/issues
6. Помочь в продвижении репозитория и поставить звездочку (опционально)

---
