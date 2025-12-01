import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AppSidebar />
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}
