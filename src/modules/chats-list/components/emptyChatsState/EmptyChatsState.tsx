// Компонент состояния "Нет чатов" (пустой экран)
'use client'

import Image from 'next/image'
import { Button } from '@shared/ui/button/Button'
import { cn } from '@shared/lib/utils'
import customStyles from '@modules/chats-list/components/emptyChatsState/emptyChatsState.module.css'

// Интерфейс пропсов компонента EmptyChatsState
interface EmptyChatsStateProps {
    className?: string // Дополнительные CSS классы для кастомизации стилей
    onStartChat?: () => void // Обработчик клика по кнопке "Начать чат" - опциональный, так как компонент может использоваться без действия
}

// Компонент для отображения состояния, когда чатов нет
// Используется как fallback UI в основном списке чатов
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
                    customStyles['empty-chats-container'], // CSS модуль для изоляции стилей
                    'w-full max-w-full', // Дополнительные инлайн стили
                    className,
                )}
            >
                {/* Иллюстрация */}
                {/* Используем relative positioning для контейнера и fill для Image */}
                <div className="relative h-50 w-50 shrink-0">
                    <Image
                        src="/images/search/imgSearchWeb.svg" // Путь к изображению из public директории
                        alt="Нет чатов" // Alt текст для accessibility и SEO
                        fill // Next.js Image prop - заполняет родительский контейнер
                        className="object-contain" // Сохраняет пропорции изображения
                        sizes="200px" // Информация для браузера о размерах изображения для оптимизации загрузки
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
                                ], // Стили из CSS модуля
                                `
                                  text-center text-base leading-[130%]
                                  font-normal tracking-extra-tight
                                  text-text-gray
                                  sm:text-lg
                                `, // Адаптивные стили для мобильных и десктоп
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
                                'text-center', // Центрирование текста
                            )}
                        >
                            Начните общение и здесь всё
                            появится
                        </p>
                    </div>

                    {/* Кнопка "Начать чат" */}
                    {/* margin-top 10 для визуального отделения от текста */}
                    <div className="mt-10 w-full px-1">
                        <Button
                            variant="primary" // Основной стиль кнопки
                            size="lg" // Большой размер для лучшей кликабельности
                            onClick={onStartChat} // Обработчик из пропсов
                            className="w-full" // Занимает всю доступную ширину
                        >
                            Начать чат
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
