import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={cn('transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-16')}>
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
