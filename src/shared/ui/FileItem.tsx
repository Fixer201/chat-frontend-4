'use client'

import Image from 'next/image'
import type { BaseFile } from '@shared/types/file'

interface FileItemProps {
    file: BaseFile
    onDownload: (id: number) => void
}

export default function FileItem({
    file,
    onDownload,
}: FileItemProps) {
    return (
        <div
            className={`
              group flex items-center border-b border-gray-200 p-3
              transition-colors
              hover:bg-gray-50
            `}
        >
            <div className="flex items-center justify-center text-2xl">
                {/* ВСЕГДА рендерим кнопку, меняем только её содержимое */}
                <button
                    onClick={() => onDownload(file.id)}
                    className={`
                      relative flex h-10 w-10 items-center justify-center
                      rounded-full transition-colors
                      hover:cursor-pointer
                      ${
                          file.isLoading
                              ? 'bg-white-bg'
                              : `
                                bg-accent-violet
                                hover:bg-accent-violet-dark
                              `
                      }
                    `}
                >
                    {file.isLoading ? (
                        // Анимированная иконка загрузки
                        <>
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 40 40"
                                className="text-accent-violet"
                            >
                                {/* Фоновый круг */}
                                <circle
                                    cx="20"
                                    cy="20"
                                    r="17"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    className="opacity-30"
                                />

                                {/* Прогресс загрузки */}
                                <circle
                                    cx="20"
                                    cy="20"
                                    r="17"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray="107"
                                    strokeDashoffset={
                                        107 *
                                        (1 -
                                            file.progress /
                                                100)
                                    }
                                    className={`
                                      origin-center -rotate-90 transition-all
                                      duration-100
                                    `}
                                    style={{
                                        transformOrigin:
                                            'center',
                                    }}
                                />

                                {/* Крестик в центре */}
                                <line
                                    x1="13"
                                    y1="13"
                                    x2="27"
                                    y2="27"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1="27"
                                    y1="13"
                                    x2="13"
                                    y2="27"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </>
                    ) : (
                        // Обычная иконка загрузки
                        <Image
                            src="/icons/fileLoad.svg"
                            alt="file icon"
                            width={35}
                            height={35}
                        />
                    )}
                </button>
            </div>

            <div className="ml-3 min-w-0 flex-1">
                <h4 className="truncate font-medium text-text-black">
                    {file.name}
                </h4>
                <div className="flex items-center gap-2 text-sm text-text-gray">
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>{file.date}</span>
                </div>
            </div>
        </div>
    )
}
