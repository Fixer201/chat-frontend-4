'use client'

import Image from 'next/image'
import { Button } from '@shared/ui/button/Button'
import { cn } from '@shared/lib/utils'

interface EmptyChatsStateProps {
  className?: string
  onStartChat?: () => void
}

export default function EmptyChatsState({ 
  className, 
  onStartChat 
}: EmptyChatsStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] w-full px-4",
      className
    )}>
      <div className={cn("empty-chats-container", className)}>
        {/* Картинка */}
        <div className="relative w-[200px] h-[200px] flex-shrink-0">
          <Image
            src="/images/search/imgSearchWeb.svg"
            alt="Нет чатов"
            fill
            className="object-contain"
            sizes="200px"
          />
        </div>
        
        {/* Текстовый блок */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Заголовок */}
          <div className="w-full">
            <h3 className="text-base sm:text-lg font-normal text-text-gray text-center leading-[130%] tracking-[0.01em]">
              У вас пока нет чатов
            </h3>
          </div>
          
          {/* Описание */}
          <div className="flex flex-col gap-3 w-full">
            <p className="empty-chats-text">
              Начните общение и здесь всё появится
            </p>
          </div>
          
          {/* Кнопка "Начать чат" */}
          <div className="empty-chats-button"> {/* mt-10 соответствует примерно 40px */}
            <Button
              variant="primary"
              size="lg"
              onClick={onStartChat}
              className="w-full  mx-auto"
            >
              Начать чат
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}