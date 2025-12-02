
import { AppHeader } from './AppHeader';
import AppSidebar from './AppSidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div>

    <AppHeader />
     
<div className="flex justify-center items-center">
  <AppSidebar />
{children}
</div>


      
    </div>
  );
}
