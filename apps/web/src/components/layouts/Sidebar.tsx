import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';

const navItems = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'clients', path: '/clients', icon: Users },
  { key: 'invoices', path: '/invoices', icon: FileText },
  { key: 'settings', path: '/settings', icon: Settings },
] as const;

export function Sidebar() {
  const { t } = useTranslation('common');
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const { sidebarOpen, toggleSidebar } = useUiStore();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    }
    logout();
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        {sidebarOpen && <span className="ml-2 text-lg font-bold">DevDash</span>}
      </div>

      <nav className="flex flex-col gap-1 p-2">
        {navItems.map(({ key, path, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={key}
              to={path}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                isActive && 'bg-accent text-accent-foreground',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{t(`nav.${key}`)}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-accent"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
