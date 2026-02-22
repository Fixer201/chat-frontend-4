'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@shared/lib/utils'
import ContactsIcon from '@public/icons/app-sidebar/contacts.svg'
import MessageIcon from '@public/icons/app-sidebar/message.svg'
import ServiceIcon from '@public/icons/app-sidebar/service.svg'
import SettingsIcon from '@public/icons/app-sidebar/settings.svg'
const iconBaseClass = 'h-8 w-8 transition-colors'

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

export default function AppSidebar() {
    // Хук useRouter: Получаем экземпляр роутера для программной навигации.
    // Это позволяет вызывать router.push(path) для перехода без перезагрузки.
    const router = useRouter()
    // Хук usePathname: Получаем текущий путь из URL.
    // Используется для определения активного пункта меню (сравнение с path в navItems).
    // Это реактивно: при изменении пути компонент перерендерится.
    const pathname = usePathname()
    return (
        // Элемент nav: Семантический контейнер для навигации, улучшает доступность для скрин-ридеров.
        // Классы: fixed right-0 bottom-0 left-0 - фиксированная позиция снизу на всю ширину (мобильная панель).
        // flex h-16 w-full flex-row items-center justify-around gap-3 - горизонтальный флекс с равным распределением.
        // border-t border-app-divider bg-white p-2 - верхняя граница, белый фон, отступы.
        // md:static md:h-57 md:w-12 md:flex-col md:justify-between md:gap-3 - на десктопе: статичная позиция, вертикальный флекс.
        // md:border-0 md:bg-transparent md:p-0 - убираем границы и фон на десктопе для интеграции в макет.
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
                const isActive = Boolean(
                    path && pathname.startsWith(path),
                )
                // Возврат кнопки для каждого пункта.
                return (
                    // onClick: Вызывает router.push(path) для навигации, если path определен.
                    // aria-pressed: Указывает состояние (активный/неактивный) для доступности (скрин-ридеры).
                    // className: Условные классы через cn для активного/неактивного состояния.
                    // Классы: flex h-16 w-12 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg transition-colors
                    // - вертикальный флекс с центрированием, курсор, скругление, переходы.
                    // md:h-12 md:flex-row md:justify-center md:gap-0 - на десктопе: горизонтальный флекс без gap.
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
