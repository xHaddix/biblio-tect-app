import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  return (
    <div className="flex min-h-screen bg-brand-bg-page overflow-hidden">
      {/* Columna Izquierda: Banner Oscuro Fijo */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-brand-dark p-12 text-brand-text-light lg:flex overflow-hidden">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-brand-accent/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-brand-accent/15 blur-3xl animate-pulse [animation-delay:1000ms]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 transition-transform duration-300 hover:translate-x-2">
          <div className="group rounded-xl bg-brand-accent p-2.5 text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:rotate-3">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">
            Bosque de tinta
          </span>
        </div>

        {/* Texto dinámico según la vista */}
        <div className="relative z-10 my-auto max-w-md space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-spin [animation-duration:3s]" />
                <span>
                  {isRegister
                    ? 'Únete a la comunidad'
                    : 'Sistema Bibliotecario 2026'}
                </span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                {isRegister
                  ? 'Únete y gestiona tu biblioteca'
                  : 'Gestiona libros, usuarios y préstamos'}
              </h1>
              <p className="text-brand-text-light/80 leading-relaxed">
                {isRegister
                  ? 'Crea tu cuenta para acceder al catálogo, gestionar reservas y llevar un seguimiento claro de tus préstamos.'
                  : 'Plataforma centralizada para el control total del catálogo de biblioteca y flujo de reservas.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="relative z-10 text-sm text-brand-text-light/60">
          © 2026 Biblioteca App
        </p>
      </div>

      {/* Columna Derecha: Formulario con Animación de Transición */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: isRegister ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRegister ? -30 : 30 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
