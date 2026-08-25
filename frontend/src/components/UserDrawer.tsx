/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState, useEffect, useRef } from 'react';
import { X, User as UserIcon, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, type User } from '../types';

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    role: Role;
    status?: number;
  }) => Promise<void>;
  editingUser: User | null;
}

export const UserDrawer: React.FC<UserDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.CLIENT);
  const [status, setStatus] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false);
  const roleSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setRole(editingUser.role);
      setStatus(editingUser.status ?? 1);
    } else {
      setName('');
      setEmail('');
      setRole(Role.CLIENT);
      setStatus(1);
    }
  }, [editingUser, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleSelectRef.current &&
        !roleSelectRef.current.contains(event.target as Node)
      ) {
        setIsRoleSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit({
        name,
        email,
        role,
        ...(editingUser ? { status } : {}),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const roles = [
    { value: Role.CLIENT, label: 'Cliente' },
    { value: Role.ADMIN, label: 'Administrador' },
  ];

  const currentRoleLabel =
    roles.find((r) => r.value === role)?.label || 'Cliente';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingUser
                      ? 'Actualiza los datos y permisos de acceso.'
                      : 'Registra a un nuevo usuario en la plataforma.'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form
                id="user-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                <div className="flex justify-center my-2">
                  <div className="h-20 w-20 rounded-full bg-[#f5efe6] flex items-center justify-center text-[#5c3d2e] shadow-inner">
                    <UserIcon className="h-10 w-10" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#5c3d2e] focus:ring-1 focus:ring-[#5c3d2e] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#5c3d2e] focus:ring-1 focus:ring-[#5c3d2e] focus:outline-none transition"
                  />
                </div>

                {/* Selector de Rol Personalizado */}
                <div ref={roleSelectRef}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rol asignado
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsRoleSelectOpen(!isRoleSelectOpen)}
                      className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm text-left bg-white transition-all ${
                        isRoleSelectOpen
                          ? 'border-[#5c3d2e] ring-1 ring-[#5c3d2e]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate text-slate-800 font-medium">
                        {currentRoleLabel}
                      </span>
                      <motion.div
                        animate={{ rotate: isRoleSelectOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isRoleSelectOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute left-0 right-0 z-10 mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                        >
                          <div className="space-y-0.5">
                            {roles.map((r) => {
                              const isSelected = role === r.value;
                              return (
                                <button
                                  key={r.value}
                                  type="button"
                                  onClick={() => {
                                    setRole(r.value);
                                    setIsRoleSelectOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                                    isSelected
                                      ? 'bg-[#f5efe6] text-[#5c3d2e]'
                                      : 'text-slate-700 hover:bg-slate-100/80'
                                  }`}
                                >
                                  <span className="truncate">{r.label}</span>
                                  {isSelected && (
                                    <Check className="h-3.5 w-3.5 text-[#5c3d2e] flex-shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Control de Estado al Editar */}
                {editingUser && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estado de la cuenta
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus(1)}
                        className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition cursor-pointer ${
                          status === 1
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Activo
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(0)}
                        className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition cursor-pointer ${
                          status === 0
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Inactivo
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Footer */}
              <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="user-form"
                  disabled={submitting}
                  className="rounded-lg bg-[#5c3d2e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a3125] disabled:opacity-50 shadow-sm transition cursor-pointer"
                >
                  {submitting
                    ? 'Guardando...'
                    : editingUser
                      ? 'Actualizar'
                      : 'Crear Usuario'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
