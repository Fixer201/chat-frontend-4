
import { AppHeader } from './AppHeader';
import AppSidebar from './AppSidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div>

      <AppHeader />

      <div className="flex justify-center content-center m-1 ">
        <AppSidebar />
        {children}
      </div>



    </div>
  );

}
