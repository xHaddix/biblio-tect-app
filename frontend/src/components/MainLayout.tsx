import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Receipt,
  LogOut,
  ChevronLeft,
  Menu,
  Store,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      void navigate('/login');
    }, 1200);
  };

  const getUserRole = (): string => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsedUser = JSON.parse(userStr) as { role?: string };
        if (parsedUser?.role) {
          return parsedUser.role.trim().toUpperCase();
        }
      }
    } catch {
      // Fallback
    }
    return 'ADMIN';
  };

  const userRole = getUserRole();
  const isClient = userRole === 'CLIENT';

  const navItems = isClient
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/catalog', label: 'Catálogo', icon: Store },
        { to: '/loans', label: 'Mis Préstamos', icon: Receipt },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/catalog', label: 'Catálogo', icon: Store },
        { to: '/users', label: 'Usuarios', icon: Users },
        { to: '/books', label: 'Libros', icon: BookOpen },
        { to: '/loans', label: 'Préstamos', icon: Receipt },
      ];

  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden">
      {/* Sidebar Fijo a la altura de la pantalla */}
      <aside
        className={`sticky top-0 h-screen flex flex-col justify-between bg-brand-dark text-white p-4 transition-all duration-300 ease-in-out z-30 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Botón Flotante para Colapsar/Expandir */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="absolute -right-3.5 top-7 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-brand-dark text-white shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          aria-label={isCollapsed ? 'Expandir barra' : 'Colapsar barra'}
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Sección Superior: Header y Navegación con Scroll Interno si es necesario */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Header del Sidebar */}
          <div className="flex items-center gap-3 px-2 py-4 shrink-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent text-white shadow-md">
              <BookOpen className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-wide text-white truncate animate-in fade-in duration-200">
                Bosque de tinta
              </span>
            )}
          </div>

          {/* Navegación (con Scroll independiente) */}
          <nav className="mt-8 space-y-2 overflow-y-auto flex-1 no-scrollbar pr-1">
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

        {/* Cerrar Sesión (Anclado siempre al pie del Sidebar) */}
        <div className="border-t border-white/10 pt-4 shrink-0">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200 cursor-pointer disabled:opacity-50"
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

      {/* Contenido Principal con desplazamiento propio */}
      <main className="flex-1 h-screen overflow-y-auto p-8 transition-all duration-300">
        {children}
      </main>

      {/* Overlay Animado al Cerrar Sesión */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-dark/95 backdrop-blur-md text-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/5 border border-white/10 text-center shadow-2xl max-w-sm w-full mx-4"
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                  className="absolute -inset-2 rounded-2xl bg-brand-accent/20 blur-sm"
                />
                <div className="relative rounded-2xl bg-brand-accent p-4 text-white shadow-lg">
                  <BookOpen className="h-8 w-8" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Cerrando sesión
                </h3>
                <p className="text-xs text-slate-300">
                  Guardando cambios... ¡Hasta pronto!
                </p>
              </div>

              <Loader2 className="h-6 w-6 animate-spin text-brand-accent mt-2" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
