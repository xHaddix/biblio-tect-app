/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Lock, Mail, User } from 'lucide-react';
import { authApi } from '../api/auth';
import { getApiErrorMessage } from '../lib/api';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

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
    <div className="flex min-h-screen bg-brand-bg-page">
      {/* Columna Izquierda: Banner Oscuro */}
      <div className="hidden w-1/2 flex-col justify-between bg-brand-dark p-12 text-brand-text-light lg:flex">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-brand-accent p-2 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">
            Biblioteca
          </span>
        </div>

        <div className="my-auto max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Únete y gestiona tu biblioteca
          </h1>
          <p className="mt-4 text-brand-text-light/80">
            Crea tu cuenta para acceder al catálogo, gestionar reservas y llevar
            un seguimiento claro de tus préstamos.
          </p>
        </div>

        <p className="text-sm text-brand-text-light/60">
          © 2026 Biblioteca App
        </p>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-brand-text-dark">
              Crear cuenta
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Completa tus datos para comenzar
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Nombre completo
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-slate-900 focus:border-brand-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-slate-900 focus:border-brand-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-slate-900 focus:border-brand-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Confirmar contraseña
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-slate-900 focus:border-brand-accent focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-accent py-3 font-semibold text-white transition hover:bg-brand-accent-hover disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrarme'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-accent hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
