
import { AppHeader } from './AppHeader';
import AppSidebar from './AppSidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-1 flex flex-col items-center justify-center gap-4"> 
      <AppHeader />
      <div className="w-300 mx-auto flex flex-row gap-4">
        <AppSidebar />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>

  );
}