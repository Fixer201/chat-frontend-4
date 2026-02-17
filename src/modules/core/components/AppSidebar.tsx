'use client'

// Этот компонент представляет собой боковую панель приложения (AppSidebar), которая служит навигационным элементом.
// Он отображает список пунктов меню с иконками и подписями, позволяя пользователю переходить между разделами приложения.
// Основные функции:
// - Адаптивный дизайн: На мобильных устройствах - нижняя панель навигации (fixed), на десктопе - вертикальная боковая панель (static).
// - Активное состояние: Выделение текущего пункта на основе текущего пути (pathname).
// - Навигация: Использование Next.js роутера для программного перехода по путям.
//
// Принципы Clean Code, примененные здесь:
// - Единая ответственность: Компонент фокусируется только на рендере навигации, без бизнес-логики.
// - Читаемость: Код структурирован с понятными именами, разделен на константы и JSX.
// - DRY (Don't Repeat Yourself): navItems как конфигурационный массив, iconBaseClass для повторяющихся стилей.
// - Избегание жесткого кодирования: Пути и метки вынесены в массив для легкого изменения.
// - Доступность: Использование aria-pressed для скрин-ридеров, aria-hidden для декоративных элементов.
// - Адаптивность: Tailwind CSS классы обеспечивают responsive поведение без JavaScript-логики.
//
// Почему 'use client'? В Next.js это указывает на клиентский компонент, необходимый для использования хуков навигации (useRouter, usePathname),
// которые работают только на клиенте. Серверный рендер не поддерживает эти API.
// Ссылка на документацию: https://nextjs.org/docs/app/building-your-application/rendering/client-components

import { usePathname, useRouter } from 'next/navigation'
// Импорт хуков из Next.js для навигации.
// - useRouter: Предоставляет объект router для программного перехода (push).
// - usePathname: Возвращает текущий путь (pathname) для определения активного пункта.
// Эти хуки специфичны для Next.js App Router и позволяют управлять навигацией без перезагрузки страницы.
// Ссылка на документацию: https://nextjs.org/docs/app/api-reference/functions/use-router, https://nextjs.org/docs/app/api-reference/functions/use-pathname

import { cn } from '@shared/lib/utils'
// Импорт утилиты cn (вероятно, clsx или аналог) для условного объединения CSS-классов.
// Это позволяет динамически применять классы на основе состояния (например, активный/неактивный пункт).
// Принцип Clean Code: Упрощает условную стилизацию, избегая строковых конкатенаций.
// Ссылка на документацию clsx: https://github.com/lukeed/clsx

import ContactsIcon from '@public/icons/app-sidebar/contacts.svg'
// Импорт SVG-иконки для пункта "Контакты".
// Использование SVG обеспечивает масштабируемость и низкий размер файла.
// Принцип Clean Code: Иконки как компоненты позволяют легко менять дизайн.

import MessageIcon from '@public/icons/app-sidebar/message.svg'
// Импорт SVG-иконки для пункта "Чаты".
// Аналогично предыдущему: масштабируемость и переиспользуемость.

import ServiceIcon from '@public/icons/app-sidebar/service.svg'
// Импорт SVG-иконки для пункта "Сервисы".
// Следует тому же принципу для консистентности.

import SettingsIcon from '@public/icons/app-sidebar/settings.svg'
// Импорт SVG-иконки для пункта "Настройки".
// Завершает набор иконок для всех пунктов меню.

// Базовый CSS-класс для иконок: устанавливает размер (h-8 w-8) и плавные переходы цветов (transition-colors).
// Это константа для повторного использования, чтобы избежать дублирования в JSX.
// Принцип Clean Code: Вынос общих стилей в переменную для поддерживаемости.
// Почему h-8 w-8? Стандартный размер для иконок в интерфейсе, обеспечивающий баланс между видимостью и компактностью.
// transition-colors: Добавляет плавность при изменении состояния (активный/неактивный).
const iconBaseClass = 'h-8 w-8 transition-colors'

// Массив navItems: конфигурация пунктов навигации.
// Каждый объект содержит id (уникальный идентификатор), label (текст подписи), Icon (компонент иконки) и path (маршрут для перехода).
// Это позволяет легко добавлять/удалять пункты без изменения JSX-логики.
// Принцип Clean Code: Конфигурация отделена от представления, что улучшает переиспользуемость и тестируемость.
// Почему массив объектов? Структурированный подход для итерации в map, с явными ключами для React.
// Пути соответствуют маршрутам Next.js, что обеспечивает консистентность с роутингом.
const navItems = [
    {
        id: 'messages', // Уникальный id для ключа React и идентификации.
        label: 'Чаты', // Текст подписи, отображаемый на мобильных устройствах.
        Icon: MessageIcon, // Компонент иконки для визуального представления.
        path: '/chats', // Путь для навигации, соответствующий странице чатов.
    },
    {
        id: 'service', // Аналогично: id для сервисов.
        label: 'Сервисы', // Подпись для сервисов.
        Icon: ServiceIcon, // Иконка сервисов.
        path: '/test-components', // Путь к тест-компонентам (возможно, временный или для разработки).
    },
    {
        id: 'contacts', // id для контактов.
        label: 'Контакты', // Подпись.
        Icon: ContactsIcon, // Иконка.
        path: '/contacts', // Путь к контактам.
    },
    {
        id: 'settings', // id для настроек.
        label: 'Настройки', // Подпись.
        Icon: SettingsIcon, // Иконка.
        path: '/settings', // Путь к настройкам.
    },
]
// Основная функция компонента AppSidebar.
// Она не принимает пропсов, так как навигация статична и основана на глобальном состоянии (pathname).
// Возвращает JSX для рендера навигационной панели.
export default function AppSidebar() {
    // Хук useRouter: Получаем экземпляр роутера для программной навигации.
    // Это позволяет вызывать router.push(path) для перехода без перезагрузки.
    const router = useRouter()
    // Хук usePathname: Получаем текущий путь из URL.
    // Используется для определения активного пункта меню (сравнение с path в navItems).
    // Это реактивно: при изменении пути компонент перерендерится.
    const pathname = usePathname()
    // Возврат JSX: Рендер навигационной панели.

    return (
        // Элемент nav: Семантический контейнер для навигации, улучшает доступность для скрин-ридеров.
        // Классы: fixed right-0 bottom-0 left-0 - фиксированная позиция снизу на всю ширину (мобильная панель).
        // flex h-16 w-full flex-row items-center justify-around gap-3 - горизонтальный флекс с равным распределением.
        // border-t border-app-divider bg-white p-2 - верхняя граница, белый фон, отступы.
        // md:static md:h-57 md:w-12 md:flex-col md:justify-between md:gap-3 - на десктопе: статичная позиция, вертикальный флекс.
        // md:border-0 md:bg-transparent md:p-0 - убираем границы и фон на десктопе для интеграции в макет.
        // Почему fixed на мобильных? Стандартный паттерн для bottom navigation bar в мобильных apps (как в iOS/Android).
        // md:static: На десктопе интегрируется в AppShell как боковая панель.
        // h-57: Кастомная высота (вероятно, 228px), адаптированная под контент.
        <nav
            className={`
              fixed right-0 bottom-0 left-0 flex h-16 w-full flex-row
              items-center justify-around gap-3 border-t border-app-divider
              bg-white p-2
              md:static md:h-57 md:w-12 md:flex-col md:justify-between md:gap-3
              md:border-0 md:bg-transparent md:p-0
            `}
        >
            {/* Итерация по navItems: Для каждого пункта рендерим кнопку.
            Используем map для декларативного рендера, с key=id для оптимизации React. */}

            {navItems.map(({ id, label, Icon, path }) => {
                // Определение активного состояния: Проверяем, начинается ли текущий pathname с path пункта.
                // Boolean() для явного приведения к булю, чтобы избежать undefined.
                // Почему startsWith? Для поддержки вложенных маршрутов (например, /chats/1 считается активным для /chats).
                // Это распространенный паттерн в навигации для выделения родительских разделов.
                const isActive = Boolean(
                    path && pathname.startsWith(path),
                )
                // Возврат кнопки для каждого пункта.
                // button вместо Link: Для onClick подходит, и позволяет кастомную стилизацию.
                return (
                    // onClick: Вызывает router.push(path) для навигации, если path определен.
                    // aria-pressed: Указывает состояние (активный/неактивный) для доступности (скрин-ридеры).
                    // className: Условные классы через cn для активного/неактивного состояния.
                    // Классы: flex h-16 w-12 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg transition-colors
                    // - вертикальный флекс с центрированием, курсор, скругление, переходы.
                    // md:h-12 md:flex-row md:justify-center md:gap-0 - на десктопе: горизонтальный флекс без gap.
                    // Условно: Если активный - border и bg-gray-main; иначе - hover:bg-gray-main.
                    // Почему button? Семантически правильный для действий, с поддержкой клавиатуры.
                    // aria-pressed: Рекомендуется для toggle-like элементов, даже если не toggle.
                    <button
                        key={id}
                        type="button"
                        onClick={() => {
                            // Проверка if (path): Защита от undefined, хотя в данных path всегда есть.
                            // router.push: Программный переход, обновляет URL и состояние.
                            if (path) {
                                router.push(path)
                            }
                        }}
                        aria-pressed={isActive}
                        className={cn(
                            `
                              flex h-16 w-12 cursor-pointer flex-col
                              items-center justify-center gap-1 rounded-lg
                              transition-colors
                              md:h-12 md:flex-row md:justify-center md:gap-0
                            `,
                            isActive
                                ? 'border border-app-divider bg-gray-main' // Активный: граница и фон.
                                : `
                                  border border-transparent
                                  hover:bg-gray-main
                                `, // Неактивный: прозрачная граница, hover-эффект.
                        )}
                    >
                        {/* className: Базовый iconBaseClass + условный цвет (активный: violet, неактивный: gray).
                        aria-hidden: Иконка декоративная, скрыта от скрин-ридеров (текст label описывает).
                        Почему условный цвет? Визуальная обратная связь для активного состояния. */}
                        <Icon
                            className={cn(
                                iconBaseClass,
                                isActive
                                    ? `text-accent-violet-primary` // Активный: акцентный цвет.
                                    : `text-text-gray`, // Неактивный: серый.
                            )}
                            aria-hidden
                        />

                        {/* Классы: block text-center text-[14px] text-text-gray md:hidden - центрированный текст, скрыт на десктопе.
                        Почему md:hidden? На десктопе подписи не нужны (иконки достаточно), экономим пространство.
                        Пустой пробел в начале: Возможно, для выравнивания или избежания пустого текста.
                        Принцип Clean Code: Условный рендер через CSS, без JS-логики. */}
                        <span
                            className={cn(
                                `
                                  block text-center text-[14px]
                                  md:hidden
                                `,
                                isActive
                                    ? 'text-accent-violet-primary' // Активный: фиолетовый текст.
                                    : 'text-text-gray', // Неактивный: серый текст.
                            )}
                        >
                            {' '}
                            {/* Подпись только на мобильных */}
                            {label}
                        </span>
                    </button>
                )
            })}
        </nav>
    )
}
