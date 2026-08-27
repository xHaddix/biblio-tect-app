/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../api/auth';
import axios from 'axios';

interface FieldErrors {
  email?: string;
  password?: string;
}

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estado para controlar la animación del overlay de éxito al iniciar sesión
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  // Precargar credenciales guardadas si existen
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password) {
      errors.password = 'La contraseña es requerida';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await authApi.login({ email, password });

      // Manejo de la opción Recordarme
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Iniciar overlay de bienvenida animado antes del redireccionamiento
      setIsLoggingIn(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: unknown) {
      let errorMessage = 'Credenciales incorrectas o error al iniciar sesión';

      if (axios.isAxiosError(err) && err.response?.data) {
        const dataMessage = err.response.data.message;

        if (typeof dataMessage === 'string') {
          errorMessage = dataMessage;
        } else if (Array.isArray(dataMessage)) {
          errorMessage = dataMessage.join(', ');
        } else if (
          dataMessage &&
          typeof dataMessage === 'object' &&
          'message' in dataMessage
        ) {
          const innerMsg = (dataMessage as { message: unknown }).message;
          if (typeof innerMsg === 'string') {
            errorMessage = innerMsg;
          } else if (Array.isArray(innerMsg)) {
            errorMessage = innerMsg.join(', ');
          }
        }
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg-page overflow-hidden relative">
      {/* Columna Izquierda: Banner Oscuro */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-brand-dark p-12 text-brand-text-light lg:flex overflow-hidden">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-brand-accent/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-brand-accent/15 blur-3xl animate-pulse [animation-delay:1000ms]" />

        <div className="relative z-10 flex items-center gap-3 transition-transform duration-300 hover:translate-x-2">
          <div className="group rounded-xl bg-brand-accent p-2.5 text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:rotate-3">
            <BookOpen className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">
            Bosque de tinta
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/20">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-spin [animation-duration:3s]" />
            <span>Sistema Bibliotecario 2026</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight transition-all duration-500 hover:text-white/95">
            Gestiona libros, usuarios y préstamos
          </h1>
          <p className="text-brand-text-light/80 leading-relaxed transition-opacity duration-300 hover:opacity-100">
            Plataforma centralizada para el control total del catálogo de
            biblioteca y flujo de reservas.
          </p>
        </div>

        <p className="relative z-10 text-sm text-brand-text-light/60">
          © 2026 Biblioteca App
        </p>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-left">
            <h2 className="text-3xl font-bold text-brand-text-dark tracking-tight transition-transform duration-300 hover:translate-x-1">
              Iniciar sesión
            </h2>
            <p className="text-sm text-slate-600">
              Bienvenido de nuevo{' '}
              <span className="inline-block animate-bounce">👋</span>
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl bg-red-50/90 p-4 text-sm text-red-600 border border-red-200 shadow-sm backdrop-blur-sm flex items-center gap-2"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Input Correo */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-700 transition-colors group-focus-within:text-brand-accent">
                Correo electrónico
              </label>
              <div className="relative mt-1">
                <Mail
                  className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transition-all duration-200 ${
                    fieldErrors.email
                      ? 'text-red-400'
                      : 'text-slate-400 group-focus-within:text-brand-accent group-focus-within:scale-110'
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email)
                      setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  placeholder="admin@biblioteca.com"
                  className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-slate-900 transition-all duration-300 focus:outline-none hover:border-slate-400 ${
                    fieldErrors.email
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-300 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/15'
                  }`}
                />
              </div>

              <AnimatePresence>
                {fieldErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 flex items-center gap-1.5 px-1 text-xs font-medium text-red-500"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Input Contraseña */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-700 transition-colors group-focus-within:text-brand-accent">
                Contraseña
              </label>
              <div className="relative mt-1">
                <Lock
                  className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transition-all duration-200 ${
                    fieldErrors.password
                      ? 'text-red-400'
                      : 'text-slate-400 group-focus-within:text-brand-accent group-focus-within:scale-110'
                  }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password)
                      setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border py-2.5 pl-11 pr-12 text-slate-900 transition-all duration-300 focus:outline-none hover:border-slate-400 ${
                    fieldErrors.password
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-300 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-all duration-200 p-1.5 rounded-lg hover:bg-slate-100 active:scale-90"
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 transition-transform duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 transition-transform duration-200" />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {fieldErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 flex items-center gap-1.5 px-1 text-xs font-medium text-red-500"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Fila Recordarme / Olvidé contraseña */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />

                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`h-5 w-5 rounded-md border-2 transition-colors flex items-center justify-center ${
                      rememberMe
                        ? 'bg-brand-accent border-brand-accent shadow-sm'
                        : 'border-slate-300 bg-white group-hover:border-brand-accent'
                    }`}
                  >
                    <AnimatePresence>
                      {rememberMe && (
                        <motion.svg
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="h-3.5 w-3.5 text-white stroke-[3]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.2 }}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <span className="font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  Recordarme
                </span>
              </label>

              <button
                type="button"
                onClick={() => alert('Función de recuperación de contraseña')}
                className="font-medium text-brand-accent transition-all duration-200 hover:text-brand-accent-hover hover:underline cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || isLoggingIn}
              className="relative overflow-hidden group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent py-3.5 font-semibold text-white shadow-md transition-all duration-300 hover:bg-brand-accent-hover hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

              {loading && !isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Cargando...</span>
                </>
              ) : (
                <span className="relative z-10">Iniciar sesión</span>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-600">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="inline-block font-semibold text-brand-accent transition-all duration-200 hover:text-brand-accent-hover hover:underline hover:scale-105"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>

      {/* Overlay Animado al Iniciar Sesión (Igual a MainLayout) */}
      <AnimatePresence>
        {isLoggingIn && (
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
                  Iniciando sesión
                </h3>
                <p className="text-xs text-slate-300">
                  ¡Bienvenido de nuevo a Bosque de Tinta!
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
