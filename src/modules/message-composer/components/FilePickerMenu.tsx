'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

type FilePickerMenuProps = {
    /** Колбэк при выборе «Выбрать изображение» — открывает нативный file-input с accept="image/*" */
    onSelectImage: () => void
    /** Колбэк при выборе «Выбрать файл» — открывает нативный file-input без фильтра */
    onSelectFile: () => void
    /** Колбэк закрытия меню (клик вне области / после выбора пункта) */
    onClose: () => void
}

/**
 * Выпадающее меню выбора типа вложения.
 *
 * Появляется при клике на кнопку-скрепку (Paperclip) в MessageComposer.
 * Позиционируется абсолютно над кнопкой (bottom-full) и содержит два пункта:
 *   1. «Выбрать изображение» — фильтрует нативный диалог по image/*
 *   2. «Выбрать файл» — позволяет выбрать любой файл
 *
 * При клике вне области меню — автоматически закрывается через
 * слушатель mousedown на document (паттерн «click outside»).
 *
 * Дизайн-референс: public/files_pin.svg, public/files_pin.png
 */
export default function FilePickerMenu({
    onSelectImage,
    onSelectFile,
    onClose,
}: Readonly<FilePickerMenuProps>) {
    // Ref на корневой div меню — используется для определения,
    // произошёл ли клик внутри или вне меню
    const menuRef = useRef<HTMLDivElement>(null)

    // Слушатель «click outside»: при mousedown вне области menuRef
    // закрываем меню. Используем mousedown (а не click), чтобы
    // закрытие происходило до того, как сработает click на внешних элементах.
    // Очистка слушателя при размонтировании предотвращает утечку памяти.
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target as Node,
                )
            ) {
                onClose()
            }
        }

        document.addEventListener(
            'mousedown',
            handleClickOutside,
        )
        return () =>
            document.removeEventListener(
                'mousedown',
                handleClickOutside,
            )
    }, [onClose])

    return (
        // Контейнер меню: абсолютное позиционирование над кнопкой-скрепкой,
        // z-50 чтобы быть поверх textarea и emoji picker,
        <div
            ref={menuRef}
            className={`
              absolute bottom-full left-0 z-50 mb-2 min-w-56 overflow-hidden
              rounded-lg bg-white-bg shadow-context-shadow
            `}
        >
            {/* Пункт «Выбрать изображение»: вызывает onSelectImage (триггерит
                hidden input с accept="image/*") и сразу закрывает меню */}
            <button
                type="button"
                onClick={() => {
                    onSelectImage()
                    onClose()
                }}
                className={`
                  flex w-full cursor-pointer items-center justify-between gap-3
                  px-4 py-3 text-left text-sm text-text-black transition-colors
                  hover:bg-gray-light
                `}
            >
                <span>Выбрать изображение</span>
                {/* Иконка галереи */}
                <Image
                    src="/icons/messageComposer/files-pin/image.svg"
                    alt=""
                    width={18}
                    height={18}
                />
            </button>

            {/* Пункт Выбрать файл: вызывает onSelectFile (триггерит
                hidden input без ограничения типа) и сразу закрывает меню */}
            <button
                type="button"
                onClick={() => {
                    onSelectFile()
                    onClose()
                }}
                className={`
                  flex w-full cursor-pointer items-center justify-between gap-3
                  px-4 py-3 text-left text-sm text-text-black transition-colors
                  hover:bg-gray-light
                `}
            >
                <span>Выбрать файл</span>
                {/* Иконка документа */}
                <Image
                    src="/icons/messageComposer/files-pin/file.svg"
                    alt=""
                    width={16}
                    height={20}
                />
            </button>
        </div>
    )
}
