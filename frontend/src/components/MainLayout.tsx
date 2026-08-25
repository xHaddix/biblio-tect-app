import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Receipt,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    void navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/users', label: 'Usuarios', icon: Users },
    { to: '/books', label: 'Libros', icon: BookOpen },
    { to: '/loans', label: 'Préstamos', icon: Receipt },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Deslizable */}
      <aside
        className={`relative flex flex-col justify-between bg-brand-dark text-white p-4 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Botón Flotante para Colapsar/Expandir */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-7 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-brand-dark text-white shadow-md transition-transform hover:scale-110 active:scale-95"
          aria-label={isCollapsed ? 'Expandir barra' : 'Colapsar barra'}
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <div>
          {/* Header del Sidebar / Logotipo */}
          <div className="flex items-center gap-3 px-2 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent text-white shadow-md">
              <BookOpen className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-wide text-white truncate animate-in fade-in duration-200">
                Biblioteca
              </span>
            )}
          </div>

          {/* Menú de Navegación */}
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-accent text-white shadow-md'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate animate-in fade-in duration-200">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Botón de Cerrar Sesión */}
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
            title={isCollapsed ? 'Cerrar sesión' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <span className="truncate animate-in fade-in duration-200">
                Cerrar sesión
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};
