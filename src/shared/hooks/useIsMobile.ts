// hooks/useIsMobile.ts
'use client' // Директива для Next.js: указывает, что хук работает только на клиенте (использует window).
import { useState, useEffect } from 'react'

// Кастомный хук useIsMobile: Определяет, находится ли устройство в мобильном режиме на основе ширины окна.
// Возвращает булево значение isMobile (true, если ширина <= breakpoint).
// Принципы Clean Code:
// - Единая ответственность: Только определение мобильности, без бизнес-логики.
// - Переиспользуемость: Можно использовать в любом компоненте для адаптивного поведения.
// - DRY: Избегает дублирования кода в нескольких компонентах.
// - Читаемость: Логика инкапсулирована, с явными именами и комментариями.
// Почему хук? Позволяет реактивно отслеживать изменения размера окна с помощью useState и useEffect.
// Ссылка на документацию React: https://react.dev/learn/reusing-logic-with-custom-hooks
export default function useIsMobile(
    breakpoint: number = 768,
): boolean {
    // Состояние isMobile: Инициализируется с false (безопасное значение на сервере).
    // Lazy initialization (() => window.innerWidth <= breakpoint) для точного начального значения на клиенте.
    // Почему lazy? Предотвращает ошибки SSR (Server-Side Rendering) в Next.js, где window недоступен.
    // Ссылка: https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state
    const [isMobile, setIsMobile] = useState<boolean>(
        () => {
            // Проверка на клиент: typeof window !== 'undefined' предотвращает ошибки в SSR.
            // Если window доступен, проверяем ширину; иначе false (предполагаем десктоп по умолчанию).
            if (typeof window !== 'undefined') {
                return window.innerWidth <= breakpoint
            }
            return false
        },
    )

    // useEffect: Добавляет слушатель 'resize' для обновления isMobile при изменении размера окна.
    // Выполняется только при монтировании (пустой массив зависимостей []).
    // Почему useEffect? Для синхронизации с внешней системой (браузерным API window).
    // Очистка в return: Удаляет слушатель при размонтировании, предотвращая утечки памяти.
    // Ссылка: https://react.dev/reference/react/useEffect#examples-connecting
    useEffect(() => {
        // Функция checkMobile: Обновляет состояние на основе текущей ширины.
        // Вызывается сразу (для начальной проверки) и при каждом resize.
        const checkMobile = () =>
            setIsMobile(window.innerWidth <= breakpoint)

        // Начальная проверка: Устанавливает корректное значение при монтировании.
        checkMobile()

        // Добавляем слушатель события 'resize' на window.
        // window - глобальный объект браузера, доступный только на клиенте.
        window.addEventListener('resize', checkMobile)

        // Функция очистки: Удаляет слушатель при размонтировании компонента.
        // Предотвращает утечки памяти и ненужные вызовы после уничтожения.
        return () =>
            window.removeEventListener(
                'resize',
                checkMobile,
            )
    }, [breakpoint]) // Зависимость от breakpoint: Если breakpoint изменится, эффект перезапустится.

    // Возврат isMobile: Булево значение для использования в компоненте.
    return isMobile
}
