# A-Chat

Веб-приложение мессенджера на Next.js с модульной архитектурой.

---

## Available README translations

[![RU](https://flagcdn.com/w20/ru.png) Russian](docs/readmeTranslations/README.ru.md)

[![EN](https://flagcdn.com/w20/us.png) English](./README.md)

## Quick Start

### Installation

```bash
npm install
```

### Run development environment

```bash
npm run dev
```

**navigate to `localhost:3000` and you ready**

### Build for production

```bash
npm run build
npm start
```

### If you have troubleshoot try to clear next cache

```bash
rm -rf .next
npm run dev
```

---

## Using Tech

- **Framework:** Next.js 16 (App Router)
- **Development language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit
- **UI Components:** shadcn/ui
- **API:** tRPC

---

## Project Structure

```
chat-frontend-4/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router (pages)
│   │   ├── (public)/             # Public pages (WITHOUT Header/Sidebar)
│   │   │   ├── auth/
│   │   │   │   ├── login/        # Login page
│   │   │   │   ├── register/     # Registration page
│   │   │   │   └── restore/      # Password recovery
│   │   │   └── support/          # Public support page
│   │   │
│   │   ├── (private)/            # Private pages (WITH Header/Sidebar)
│   │   │   ├── layout.tsx        # Layout with Redux + tRPC + AppShell
│   │   │   ├── chats/            # Chats list (main page)
│   │   │   │   ├── [chatId]/     # Individual chat
│   │   │   │   └── create/
│   │   │   │       ├── group/    # Create group
│   │   │   │       └── channel/  # Create channel
│   │   │   ├── contacts/         # Contacts
│   │   │   ├── settings/         # Settings
│   │   │   │   ├── profile/      # Profile settings
│   │   │   │   ├── blacklist/    # Blacklist
│   │   │   │   └── support/      # Support
│   │   │   └── search/           # Global search
│   │   │
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Redirect to /chats
│   │   └── globals.css           # Global styles
│   │
│   ├── modules/                  # Feature modules
│   │   ├── core/                 # Application core
│   │   │   └── components/
│   │   │       ├── AppShell.tsx       # App wrapper with Header + Sidebar
│   │   │       ├── AppHeader.tsx      # Application header
│   │   │       └── AppSidebar.tsx     # Sidebar menu
│   │   │
│   │   ├── auth/                 # Authentication module
│   │   │   └── components/
│   │   │       ├── StartScreen.tsx
│   │   │       ├── LoginForm.tsx
│   │   │       ├── RegisterForm.tsx
│   │   │       └── CodeConfirmForm.tsx
│   │   │
│   │   ├── chats-list/           # Chats list module
│   │   │   └── components/
│   │   │       ├── ChatsList.tsx
│   │   │       ├── ChatListItem.tsx
│   │   │       ├── ChatListSearch.tsx
│   │   │       ├── ChatContextMenu.tsx
│   │   │       ├── EmptyChatsState.tsx
│   │   │       ├── ChatDeleteModal.tsx
│   │   │       └── ChatSuccessToast.tsx
│   │   │
│   │   ├── chat-room/            # Chat room module
│   │   │   └── components/
│   │   │       ├── MessagesList.tsx
│   │   │       ├── MessageItem.tsx
│   │   │       ├── DateDivider.tsx
│   │   │       ├── TypingIndicator.tsx
│   │   │       └── BlockedChatBanner.tsx
│   │   │
│   │   ├── message-composer/     # Message input module
│   │   │   └── components/
│   │   │       ├── MessageComposer.tsx
│   │   │       ├── AttachmentsPreview.tsx
│   │   │       ├── ReplyPreview.tsx
│   │   │       └── EditModeBar.tsx
│   │   │
│   │   ├── contacts/             # Contacts
│   │   ├── groups/               # Groups
│   │   ├── channels/             # Channels
│   │   ├── user-profile/         # User profile
│   │   ├── settings/             # Settings
│   │   ├── search/               # Search
│   │   ├── notifications/        # Notifications
│   │   └── support/              # Support
│   │
│   ├── shared/                   # Shared resources
│   │   ├── ui/                   # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── ... (11 more components)
│   │   │
│   │   ├── api/                  # API clients
│   │   │   ├── client.ts         # HTTP client
│   │   │   └── trpc/
│   │   │       ├── client.ts     # tRPC client
│   │   │       └── provider.tsx  # tRPC Provider
│   │   │
│   │   ├── hooks/                # React hooks
│   │   │   ├── useAuth.ts        # Authentication
│   │   │   ├── useDebounce.ts    # Debounce (search)
│   │   │   ├── useDisclosure.ts  # Open/close state
│   │   │   ├── useMediaQuery.ts  # Responsiveness
│   │   │   └── usePagination.ts  # Pagination
│   │   │
│   │   ├── types/                # TypeScript types
│   │   │   ├── user.ts
│   │   │   ├── chat.ts
│   │   │   ├── message.ts
│   │   │   ├── group.ts
│   │   │   └── channel.ts
│   │   │
│   │   ├── config/               # Configuration
│   │   │   ├── routes.ts         # Application routes
│   │   │   ├── env.ts            # Environment variables
│   │   │   └── constants.ts      # Constants
│   │   │
│   │   └── lib/                  # Utilities
│   │       ├── formatDate.ts     # Date formatting
│   │       ├── formatFileSize.ts # File size formatting
│   │       └── mapApiError.ts    # API error handling
│   │
│   ├── redux/                    # Redux store
│   │   ├── store.ts              # Store configuration
│   │   ├── ReduxProvider.tsx     # App provider
│   │   └── slices/               # State slices
│   │       ├── userSlice.ts      # User
│   │       ├── chatsSlice.ts     # Chats
│   │       ├── contactsSlice.ts  # Contacts
│   │       └── uiSlice.ts        # UI state
│   │
│   └── lib/                      # Additional utilities
│       └── utils.ts              # cn() for Tailwind
│
├── public/                       # Static files
├── .next/                        # Next.js build output (DO NOT commit)
├── node_modules/                 # Dependencies (DO NOT commit)
│
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── components.json               # shadcn/ui config
└── README.md                     # Documentation
```

---

## App routing

### Public (no authentication require)

- `/auth/login` - Sign-in page for users who already have an account.
- `/auth/register` - Registration page for creating a new account.
- `/auth/restore` - Password recovery page for restoring access if credentials are lost.
- `/support` - Support page for contact with the support team.

### Private (authentication required)

- `/` → Redirect to `/chats`
- `/chats` - Main page (chat list)
- `/chats/[chatId]` - Individual chat
- `/chats/create/group` - Create a group
- `/chats/create/channel` - Create a channel

- `/contacts` - User contacts

- `/settings` - User settings
- `/settings/profile` - Profile settings
- `/settings/blacklist` - Blacklist
- `/settings/support` - Support page

- `/search` - Global search (users by phone number, @tag, nickname; messages)

---

## Architecture

### Feature-Sliced Design (module architecture)

Project divided by slices

1. **app/** - Routing (Next.js App Router)
2. **modules/** - Business logic by features
3. **shared/** - Reusable resources
4. **redux/** - Global state

### Imports from alias

```typescript
import AppShell from '@modules/core/components/AppShell'
import Button from '@shared/ui/Button'
import { useAuth } from '@shared/hooks/useAuth'
import { store } from '@redux/store'
```

Alias configured in `tsconfig.json`:

- `@app/*` → `src/app/*`
- `@modules/*` → `src/modules/*`
- `@shared/*` → `src/shared/*`
- `@redux/*` → `src/redux/*`
- `@lib/*` → `src/lib/*`

---

## Main Files

### `src/app/(private)/layout.tsx`

Главный layout для приватных страниц. Оборачивает все страницы в:
General layout for private page. Wraps all pages in:

- Redux Provider (acces to store)
- tRPC Provider (API client)
- AppShell (Header + Sidebar)

### `src/modules/core/components/AppShell.tsx`

The main wrapper for the application. Contains the header, sidebar, and content.

### `src/redux/store.ts`

Redux store configuration with all slices.

### `src/shared/config/routes.ts`

Centralized management of application routes.

---

## How to work with the project

### Добавить новую страницу

1. Create a file in `src/app/(private)/` or `src/app/(public)/`
2. Export the React component
3. The page will automatically become available at the URL

Example:

```tsx
// src/app/(private)/profile/page.tsx
export default function ProfilePage() {
    return <div>Profile</div>
}
// Доступно на /profile
```

### Add a new module

1. Create a folder in `src/modules/`
2. Add `components/` inside
3. Create module components

### Add a UI component

1. Create a file in `src/shared/ui/`
2. Export the component
3. Use via `@shared/ui/ComponentName`

### Add a hook

1. Create a file in `src/shared/hooks/`
2. Export the hook
3. Use via `@shared/hooks/useHookName`

### Working with Redux

```tsx
// Использование в компоненте
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '@redux/slices/userSlice'

const user = useSelector((state) => state.user.currentUser)
const dispatch = useDispatch()
dispatch(setUser(userData))
```

---

## Useful commands

```bash
npm run dev          # Run in development mode
npm run build        # Production build
npm run start        # Run production version
npm run lint         # Code check
```

---

## Contribution

1. Read [docs/GIT-FLOW.md](docs/GIT-FLOW.md)
2. Fork the repository
3. Make your changes
4. Create a commit following the example in [docs/COMMIT-STRUCTURE.md](docs/COMMIT-STRUCTURE.md)
5. Create a pull or issue request
   5.1 Pull https://github.com/akatosphere/chat-frontend-4/pulls
   5.2 Issue https://github.com/akatosphere/chat-frontend-4/issues
6. Help promote the repository and give it a star (optional)

---
