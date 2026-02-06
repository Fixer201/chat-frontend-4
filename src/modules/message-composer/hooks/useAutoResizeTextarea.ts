import { useEffect, useRef } from 'react'

/**
 * Хук для автоматического изменения высоты textarea в зависимости от содержимого.
 *
 * Алгоритм работы:
 *   1. При каждом изменении `value` сбрасывает `height` в 'auto', чтобы
 *      scrollHeight корректно отразил реальную высоту контента
 *      (иначе при удалении текста высота не уменьшится).
 *   2. Считывает scrollHeight и устанавливает высоту с ограничением
 *      `maxHeight`. После достижения лимита textarea переходит в режим
 *      прокрутки (overflow: auto по умолчанию).
 *
 * @param value — текущее значение textarea (строка из state)
 * @param maxHeight — максимальная высота в px (по умолчанию 472, из макета Figma).
 *                    Для модального окна SendFileModal используется 160 (~40% модалки).
 * @returns ref — привязывается к <textarea ref={ref}> для доступа к DOM-элементу
 *
 * Используется в:
 *   - MessageComposer (основное поле ввода, maxHeight=472)
 *   - SendFileModal (поле подписи к файлу, maxHeight=160)
 */
export function useAutoResizeTextarea(
    value: string,
    maxHeight = 472,
) {
    const ref = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        // Сбрасываем высоту, чтобы scrollHeight пересчитался от реального контента
        el.style.height = 'auto'

        // Ограничиваем максимум — после него появляется внутренняя прокрутка
        el.style.height =
            Math.min(el.scrollHeight, maxHeight) + 'px'
    }, [value, maxHeight])

    return ref
}
