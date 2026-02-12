import BlacklistList from '@modules/settings/components/BlacklistList'
import { cn } from '@shared/lib/utils'

export default function BlacklistPage() {
    return (
        <div
            className={cn(
                'flex h-full w-full gap-2',
                'md:gap-6',
            )}
        >
            <BlacklistList />

            <div
                className={cn(
                    'hidden flex-1 rounded-md border border-app-divider',
                    'bg-gray-main',
                    'md:block',
                )}
            />
        </div>
    )
}
