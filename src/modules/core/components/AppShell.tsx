import { AppHeader } from './AppHeader'
import AppSidebar from './AppSidebar'

export default function AppShell({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 p-1">
            <AppHeader />
            <div className="mx-auto flex w-300 flex-row gap-4">
                <AppSidebar />
                <div className="flex-1">{children}</div>
            </div>
        </div>
    )
}
