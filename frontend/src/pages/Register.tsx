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
  AlertCircle,
  ShieldCheck,
  X,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../api/auth';
import { getApiErrorMessage } from '../lib/api';
import { AuthLayout } from '../components/AuthLayout';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado para el modal de términos y condiciones
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  // Estado para controlar la animación del overlay de éxito al registrarse
  const [isRegistering, setIsRegistering] = useState(false);

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

    if (!acceptedTerms) {
      errors.terms =
        'Debes aceptar la política de tratamiento de datos personales';
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

      // Activar overlay animado antes de redirigir
      setIsRegistering(true);

      setTimeout(() => {
        void navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al crear la cuenta'));
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="space-y-2 text-left">
          <h2 className="text-3xl font-bold text-brand-text-dark tracking-tight transition-transform duration-300 hover:translate-x-1">
            Crear cuenta
          </h2>
          <p className="text-sm text-slate-600">
            Completa tus datos para comenzar{' '}
            <span className="inline-block animate-bounce">🚀</span>
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
            <AnimatePresence>
              {fieldErrors.name && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1.5 flex items-center gap-1.5 px-1 text-xs font-medium text-red-500"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{fieldErrors.name}</span>
                </motion.p>
              )}
            </AnimatePresence>
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-all duration-200 p-1.5 rounded-lg hover:bg-slate-100 active:scale-90 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-all duration-200 p-1.5 rounded-lg hover:bg-slate-100 active:scale-90 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <AnimatePresence>
              {fieldErrors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1.5 flex items-center gap-1.5 px-1 text-xs font-medium text-red-500"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{fieldErrors.confirmPassword}</span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Checkbox Animado Personalizado en Tono Café */}
          <div className="pt-2 space-y-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-0.5">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (fieldErrors.terms) {
                      setFieldErrors({ ...fieldErrors, terms: undefined });
                    }
                  }}
                  className="sr-only"
                />

                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`h-5 w-5 rounded-md border-2 transition-colors flex items-center justify-center ${
                    acceptedTerms
                      ? 'bg-brand-accent border-brand-accent shadow-sm'
                      : fieldErrors.terms
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-slate-300 bg-white group-hover:border-brand-accent'
                  }`}
                >
                  <AnimatePresence>
                    {acceptedTerms && (
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

              <span className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors select-none">
                Acepto la{' '}
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(true)}
                  className="font-semibold text-brand-accent hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  política de tratamiento de datos personales
                  <ShieldCheck className="h-3.5 w-3.5 inline shrink-0 text-brand-accent" />
                </button>
              </span>
            </label>

            <AnimatePresence>
              {fieldErrors.terms && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 flex items-center gap-1.5 px-1 text-xs font-medium text-red-500"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{fieldErrors.terms}</span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Botón Submit con Animación Hover */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || isRegistering}
            className="relative overflow-hidden group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent py-3.5 font-semibold text-white shadow-md transition-all duration-300 hover:bg-brand-accent-hover hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
          >
            <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

            {loading && !isRegistering ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Registrando...</span>
              </>
            ) : (
              <span className="relative z-10">Registrarme</span>
            )}
          </motion.button>
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

      {/* Modal de Política de Tratamiento de Datos Personales */}
      <AnimatePresence>
        {isPolicyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                  <ShieldCheck className="h-5 w-5 text-brand-accent" />
                  <span>Política de Tratamiento de Datos</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contenido de la Política */}
              <div className="my-4 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed pr-2 no-scrollbar">
                <p>
                  En <strong>Bosque de Tinta</strong> nos tomamos muy en serio
                  la privacidad y seguridad de tu información personal.
                </p>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">
                    1. Recolección de Datos
                  </h4>
                  <p>
                    Recopilamos tu nombre completo, dirección de correo
                    electrónico y credenciales cifradas con el único objetivo de
                    prestar el servicio de préstamo e inventario de libros en
                    nuestra plataforma.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">
                    2. Uso de la Información
                  </h4>
                  <p>
                    Tus datos solo serán empleados para gestionar tu sesión,
                    llevar el registro de préstamos activos y notificar el
                    estado de las devoluciones de libros.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">
                    3. Protección y Seguridad
                  </h4>
                  <p>
                    Implementamos medidas de encriptación avanzadas para
                    proteger tus contraseñas y datos personales de accesos no
                    autorizados. Nunca venderemos ni compartiremos tus datos con
                    terceros.
                  </p>
                </div>
              </div>

              {/* Botón Aceptar y Cerrar Modal */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAcceptedTerms(true);
                    if (fieldErrors.terms) {
                      setFieldErrors({ ...fieldErrors, terms: undefined });
                    }
                    setIsPolicyModalOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-accent-hover transition active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Aceptar y Continuar</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Overlay Animado al Registrarse */}
      <AnimatePresence>
        {isRegistering && (
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
                  Creando cuenta
                </h3>
                <p className="text-xs text-slate-300">
                  ¡Te damos la bienvenida a Bosque de Tinta!
                </p>
              </div>

              <Loader2 className="h-6 w-6 animate-spin text-brand-accent mt-2" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};
