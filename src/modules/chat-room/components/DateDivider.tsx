'use client'
import { memo } from 'react'

/**
 * Разделитель дат в списке сообщений чата.
 *
 * Визуально представляет собой компактную «пилюлю» (pill badge)
 * с полупрозрачным фоном accent-violet-dark/60% и blur-эффектом,
 * центрированную по горизонтали между сообщениями.
 *
 * Вставляется в MessagesList перед первым сообщением каждого нового
 * календарного дня, позволяя пользователю быстро ориентироваться
 * в хронологии переписки.
 *
 * Форматирование даты:
 *   - «Сегодня»           — сообщение отправлено сегодня
 *   - «Вчера»             — сообщение отправлено вчера
 *   - «15 января»         — дата текущего года (год опускается)
 *   - «5 декабря 2025»    — дата прошлого года (год указывается)
 *
 */

/**
 * Названия месяцев в родительном падеже (русская грамматика).
 *
 * Используется родительный падеж, потому что в русском языке дата
 * записывается как «5 декабря», а не «5 декабрь».
 * Индексация совпадает с Date.getMonth() (0 = январь, 11 = декабрь).
 */
const MONTHS_GENITIVE = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
]

/**
 * Форматирует Unix-timestamp (секунды) в человекочитаемую дату.
 *
 * Алгоритм:
 * 1. Обнуляем время у обеих дат (сообщение и «сейчас»), чтобы
 *    сравнивать только календарные дни без влияния часов/минут.
 * 2. Вычисляем разницу в днях через миллисекунды.
 * 3. Для 0 и 1 дня возвращаем относительные метки («Сегодня», «Вчера»),
 *    для остальных — абсолютную дату с месяцем в родительном падеже.
 *
 * @param timestampSec — Unix-время создания сообщения (в секундах, не мс)
 * @returns Локализованная строка даты на русском языке
 */
function formatDividerDate(timestampSec: number): string {
    const date = new Date(timestampSec * 1000)
    const now = new Date()

    // Обнуляем часы/минуты/секунды, оставляя только год-месяц-день.
    // Без этого сообщение в 23:59 и текущее время 00:01 дали бы
    // разницу < 1 дня, хотя календарно это разные сутки.
    const dateDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    )
    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
    )

    // 86 400 000 мс = 24 часа. Math.round страхует от ошибок
    // перехода на летнее/зимнее время (±1 час → ±3 600 000 мс).
    const diffMs = today.getTime() - dateDay.getTime()
    const diffDays = Math.round(diffMs / 86_400_000)

    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'

    const day = date.getDate()
    const month = MONTHS_GENITIVE[date.getMonth()]

    // Год отображаем только для прошлых лет — в текущем году он избыточен
    if (date.getFullYear() !== now.getFullYear()) {
        return `${day} ${month} ${date.getFullYear()}`
    }

    return `${day} ${month}`
}

/**
 * Компонент-разделитель дат между группами сообщений.
 *
 * Рендерится как <li> внутри <ul> списка сообщений.
 *
 * @param timestampSec — Unix-timestamp первого сообщения дня (секунды).
 *   Передаётся из MessagesList, который определяет границы дней
 *   через вспомогательную функцию isSameDay().
 */
function DateDivider({
    timestampSec,
}: Readonly<{ timestampSec: number }>) {
    const label = formatDividerDate(timestampSec)

    return (
        <li
            role="separator"
            aria-label={label}
            className="flex justify-center py-2 select-none"
        >
            {/*
             * <time> с атрибутом dateTime в ISO-формате (YYYY-MM-DD)
             * обеспечивает машиночитаемость для поисковых систем и
             * вспомогательных технологий.
             */}
            <time
                dateTime={
                    new Date(timestampSec * 1000)
                        .toISOString()
                        .split('T')[0]
                }
                // eslint-disable-next-line better-tailwindcss/enforce-consistent-line-wrapping
                className={`
                  rounded-lg bg-accent-violet-dark/60 px-2 py-0.5 text-sm
                  leading-[120%] font-medium text-white backdrop-blur-[4px]
                `}
            >
                {label}
            </time>
        </li>
    )
}

/**
 * memo() здесь оправдан: компонент принимает единственный примитивный проп
 * (number), и его вывод полностью детерминирован входом.
 * При прокрутке списка сообщений родитель перерендеривается часто,
 * но метка даты не меняется — memo() отсекает лишние рендеры.
 */
export default memo(DateDivider)
