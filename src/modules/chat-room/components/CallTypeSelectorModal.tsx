import { cn } from '@shared/lib/utils'

interface CallTypeSelectorModalProps {
    open: boolean
    onSelect: (variant: 'outgoing' | 'incoming') => void
}

/**
 * ВРЕМЕННЫЙ компонент: модалка выбора типа звонка для тестов UI.
 *
 * Позволяет вручную выбрать сценарий звонка (входящий/исходящий)
 * для проверки CallModal без реальной интеграции с сигналинг-сервером.
 * Будет удалён после подключения реального VoIP.
 */
export default function CallTypeSelectorModal({
    open,
    onSelect,
}: Readonly<CallTypeSelectorModalProps>) {
    if (!open) return null

    return (
        <div
            className={cn(
                'fixed',
                'inset-0',
                'z-60',
                'flex',
                'items-center',
                'justify-center',
                'bg-black/40',
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Выбор типа звонка"
        >
            <div
                className={cn(
                    'w-[320px]',
                    'rounded-xl',
                    'bg-white',
                    'px-6',
                    'py-5',
                    'text-center',
                    'shadow-lg',
                )}
            >
                <p className="text-base font-semibold text-text-black">
                    Тесты звонков
                </p>
                <div className="mt-5 flex flex-col gap-3">
                    <button
                        type="button"
                        className={cn(
                            'rounded-lg',
                            'bg-accent-violet-primary',
                            'px-4',
                            'py-2',
                            'text-sm',
                            'font-semibold',
                            'text-white',
                        )}
                        onClick={() => onSelect('incoming')}
                    >
                        Тебе звонят
                    </button>
                    <button
                        type="button"
                        className={cn(
                            'rounded-lg',
                            'border',
                            'border-accent-violet-primary',
                            'px-4',
                            'py-2',
                            'text-sm',
                            'font-semibold',
                            'text-accent-violet-primary',
                        )}
                        onClick={() => onSelect('outgoing')}
                    >
                        Ты звонишь
                    </button>
                </div>
                <p className="mt-4 text-xs text-text-gray">
                    Только для тестов звонков
                </p>
            </div>
        </div>
    )
}
