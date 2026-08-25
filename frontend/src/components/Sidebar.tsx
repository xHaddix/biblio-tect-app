import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Receipt,
  LogOut,
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Usuarios', path: '/users', icon: Users },
    { name: 'Libros', path: '/books', icon: BookOpen },
    { name: 'Préstamos', path: '/loans', icon: Receipt },
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-brand-dark text-brand-text-light">
      {/* Header del Sidebar */}
      <div className="flex items-center gap-3 p-6 border-b border-brand-border/20">
        <div className="rounded-lg bg-brand-accent p-2 text-white">
          <BookOpen className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold tracking-wide text-white">
          Biblioteca
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-accent text-white'
                  : 'text-brand-text-light/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Botón de Salir */}
      <div className="p-4 border-t border-brand-border/20">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
