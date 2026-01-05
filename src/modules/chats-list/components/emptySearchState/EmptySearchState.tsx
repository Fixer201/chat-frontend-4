'use client'

import Image from 'next/image'
import { cn } from '@shared/lib/utils'
import customStyles from '@modules/chats-list/components/emptySearchState/emptySearchState.module.css'
interface EmptySearchStateProps {
    className?: string
}

export default function EmptySearchState({
    className,
}: EmptySearchStateProps) {
    return (
        <div
            className={cn(
                'flex min-h-100 w-full flex-col items-center justify-center px-4',
                className,
            )}
        >
            <div
                className={cn(
                    `
        ${customStyles['empty-search-container']}
      `,
                    className,
                )}
            >
                {/* Картинка */}
                <div className="relative h-50 w-50 shrink-0">
                    <Image
                        src="/images/search/imgSearchWeb.svg"
                        alt="Поиск не дал результатов"
                        fill
                        className="object-contain"
                        sizes="200px"
                    />
                </div>

                {/* Текстовый блок */}
                <div className="flex w-full flex-col items-center gap-6">
                    {/* Заголовок */}
                    <div className="w-full">
                        <h3
                            className={`
              ${customStyles['empty-search-title']}
            `}
                        >
                            Поиск не дал результатов
                        </h3>
                    </div>

                    {/* Описание */}
                    <div className="flex w-full flex-col gap-3">
                        <p
                            className={`
              ${customStyles['empty-search-text']}
            `}
                        >
                            По вашему запросу ничего не
                            найдено.
                        </p>
                        <p
                            className={`
              ${customStyles['empty-search-text']}
            `}
                        >
                            Измените запрос и попробуйте
                            снова.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
