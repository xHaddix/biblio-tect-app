/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, User as UserIcon } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="flex h-screen bg-brand-bg-page text-brand-text-dark">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between bg-white px-8 border-b border-brand-border/30">
          <h2 className="text-xl font-bold">Dashboard</h2>

          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 hover:bg-slate-100 text-slate-600">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="rounded-full bg-brand-dark p-2 text-white">
                <UserIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">
                {user.name || 'Usuario'}
              </span>
            </div>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
};
