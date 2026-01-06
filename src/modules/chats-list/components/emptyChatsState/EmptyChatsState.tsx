'use client'

import Image from 'next/image'
import { Button } from '@shared/ui/button/Button'
import { cn } from '@shared/lib/utils'
import customStyles from '@modules/chats-list/components/emptyChatsState/emptyChatsState.module.css'

interface EmptyChatsStateProps {
    className?: string
    onStartChat?: () => void
}

export default function EmptyChatsState({
    className,
    onStartChat,
}: EmptyChatsStateProps) {
    return (
        <div
            className={cn(
                `
                  flex min-h-100 w-full flex-col items-center justify-center
                  px-4
                `,
                className,
            )}
        >
            <div
                className={cn(
                    customStyles['empty-chats-container'],
                    'w-full max-w-full',
                    className,
                )}
            >
                {/* Картинка */}
                <div className="relative h-50 w-50 shrink-0">
                    <Image
                        src="/images/search/imgSearchWeb.svg"
                        alt="Нет чатов"
                        fill
                        className="object-contain"
                        sizes="200px"
                    />
                </div>

                {/* Текстовый блок */}
                <div
                    className={`
                      flex w-full max-w-90 flex-col items-center gap-6
                    `}
                >
                    {/* Заголовок */}
                    <div className="w-full">
                        <h3
                            className={cn(
                                customStyles[
                                    'empty-chats-title'
                                ],
                                `
                                  text-center text-base leading-[130%]
                                  font-normal tracking-[0.01em] text-text-gray
                                  sm:text-lg
                                `,
                            )}
                        >
                            У вас пока нет чатов
                        </h3>
                    </div>

                    {/* Описание */}
                    <div className="flex w-full flex-col gap-3">
                        <p
                            className={cn(
                                customStyles[
                                    'empty-chats-text'
                                ],
                                'text-center',
                            )}
                        >
                            Начните общение и здесь всё
                            появится
                        </p>
                    </div>

                    {/* Кнопка "Начать чат" */}
                    <div className="mt-10 w-full px-1">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={onStartChat}
                            className="w-full"
                        >
                            Начать чат
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
