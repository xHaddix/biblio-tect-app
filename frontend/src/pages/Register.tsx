/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { authApi } from '../api/auth';
import { getApiErrorMessage } from '../lib/api';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!name.trim()) {
      errors.name = 'El nombre completo es requerido';
    }

    if (!email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password) {
      errors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
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
      const response = await authApi.register(name, email, password);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      void navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al crear la cuenta'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg-page overflow-hidden">
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
            <span>Únete a la comunidad</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight transition-all duration-500 hover:text-white/95">
            Únete y gestiona tu biblioteca
          </h1>
          <p className="text-brand-text-light/80 leading-relaxed transition-opacity duration-300 hover:opacity-100">
            Crea tu cuenta para acceder al catálogo, gestionar reservas y llevar
            un seguimiento claro de tus préstamos.
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
              Crear cuenta
            </h2>
            <p className="text-sm text-slate-600">
              Completa tus datos para comenzar{' '}
              <span className="inline-block animate-bounce">🚀</span>
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50/90 p-4 text-sm text-red-600 border border-red-200 shadow-sm backdrop-blur-sm animate-bounce [animation-iteration-count:2]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Input Nombre */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-700 transition-colors group-focus-within:text-brand-accent">
                Nombre completo
              </label>
              <div className="relative mt-1">
                <User
                  className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transition-all duration-200 ${
                    fieldErrors.name
                      ? 'text-red-400'
                      : 'text-slate-400 group-focus-within:text-brand-accent group-focus-within:scale-110'
                  }`}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name)
                      setFieldErrors({ ...fieldErrors, name: undefined });
                  }}
                  placeholder="Tu nombre completo"
                  className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-slate-900 transition-all duration-300 focus:outline-none hover:border-slate-400 ${
                    fieldErrors.name
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-300 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/15'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-2 flex items-center gap-1.5 px-1 text-xs font-medium text-red-500 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{fieldErrors.name}</span>
                </p>
              )}
            </div>

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
                  placeholder="correo@ejemplo.com"
                  className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-slate-900 transition-all duration-300 focus:outline-none hover:border-slate-400 ${
                    fieldErrors.email
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-300 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/15'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-2 flex items-center gap-1.5 px-1 text-xs font-medium text-red-500 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
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
              {fieldErrors.password && (
                <p className="mt-2 flex items-center gap-1.5 px-1 text-xs font-medium text-red-500 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            {/* Input Confirmar Contraseña */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-700 transition-colors group-focus-within:text-brand-accent">
                Confirmar contraseña
              </label>
              <div className="relative mt-1">
                <Lock
                  className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transition-all duration-200 ${
                    fieldErrors.confirmPassword
                      ? 'text-red-400'
                      : 'text-slate-400 group-focus-within:text-brand-accent group-focus-within:scale-110'
                  }`}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword)
                      setFieldErrors({
                        ...fieldErrors,
                        confirmPassword: undefined,
                      });
                  }}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border py-2.5 pl-11 pr-12 text-slate-900 transition-all duration-300 focus:outline-none hover:border-slate-400 ${
                    fieldErrors.confirmPassword
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-300 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-all duration-200 p-1.5 rounded-lg hover:bg-slate-100 active:scale-90"
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 transition-transform duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 transition-transform duration-200" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-2 flex items-center gap-1.5 px-1 text-xs font-medium text-red-500 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{fieldErrors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative overflow-hidden group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent py-3.5 font-semibold text-white shadow-md transition-all duration-300 hover:bg-brand-accent-hover hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <span className="relative z-10">Registrarme</span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="inline-block font-semibold text-brand-accent transition-all duration-200 hover:text-brand-accent-hover hover:underline hover:scale-105"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
