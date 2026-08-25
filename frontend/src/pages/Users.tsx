/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useState } from 'react';
import { X, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { Role, type User } from '../types';

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    role: Role;
    status?: number;
    password?: string;
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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setRole(editingUser.role);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setRole(Role.CLIENT);
      setPassword('');
    }
    setShowPassword(false);
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser && !password) {
      alert('La contraseña es obligatoria para un nuevo usuario');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        name,
        email,
        role,
        status: editingUser ? editingUser.status : 1,
        ...(password ? { password } : {}),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <p className="text-xs text-slate-500">
                  {editingUser
                    ? 'Actualiza los datos del usuario.'
                    : 'Registra a un nuevo usuario en la plataforma.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Avatar Placeholder */}
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                <UserIcon className="h-9 w-9 text-[#5c3d2e]" />
              </div>
            </div>

            {/* Formulario */}
            <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-[#5c3d2e] focus:outline-none focus:ring-4 focus:ring-[#5c3d2e]/10 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-[#5c3d2e] focus:outline-none focus:ring-4 focus:ring-[#5c3d2e]/10 transition"
                />
              </div>

              {/* Campo Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contraseña {editingUser ? '(Opcional)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      editingUser
                        ? 'Dejar en blanco para mantener actual'
                        : '••••••••'
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 pr-10 text-sm text-slate-900 focus:border-[#5c3d2e] focus:outline-none focus:ring-4 focus:ring-[#5c3d2e]/10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rol asignado
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-[#5c3d2e] focus:outline-none focus:ring-4 focus:ring-[#5c3d2e]/10 transition"
                >
                  <option value={Role.CLIENT}>Cliente</option>
                  <option value={Role.ADMIN}>Administrador</option>
                </select>
              </div>
            </form>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="user-form"
              disabled={submitting}
              className="rounded-xl bg-[#5c3d2e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a3125] transition disabled:opacity-50"
            >
              {submitting
                ? 'Guardando...'
                : editingUser
                  ? 'Actualizar'
                  : 'Crear usuario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
