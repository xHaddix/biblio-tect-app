/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, type User } from '../types';
import { usersApi } from '../api/users';
import { getApiErrorMessage } from '../lib/api';
import { UserDrawer } from '../components/UserDrawer';
import { ConfirmModal } from '../components/ConfirmModal';

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer Lateral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Modales de Confirmación
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusToggleUser, setStatusToggleUser] = useState<User | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al obtener usuarios'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const handleOpenDrawer = (user?: User) => {
    setEditingUser(user || null);
    setIsDrawerOpen(true);
  };

  const handleSaveUser = async (data: {
    name: string;
    email: string;
    role: Role;
    status?: number;
    password?: string;
  }) => {
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
          ...(data.password ? { password: data.password } : {}),
        });
      } else {
        await usersApi.create(
          data as { name: string; email: string; role: Role; password: string },
        );
      }
      setIsDrawerOpen(false);
      void fetchUsers();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Error al procesar el usuario'));
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusToggleUser) return;
    try {
      setIsTogglingStatus(true);
      const newStatus = statusToggleUser.status === 1 ? 0 : 1;

      await usersApi.update(statusToggleUser.id, {
        status: newStatus,
      });

      setStatusToggleUser(null);
      void fetchUsers();
    } catch (err) {
      alert(
        getApiErrorMessage(err, 'No se pudo cambiar el estado del usuario'),
      );
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeletingUserId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUserId) return;
    try {
      setIsDeleting(true);
      await usersApi.delete(deletingUserId);
      setDeletingUserId(null);
      void fetchUsers();
    } catch (err) {
      alert(getApiErrorMessage(err, 'No se pudo eliminar el usuario'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-6"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
            <p className="text-sm text-slate-500">
              Gestiona los usuarios de la biblioteca
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-2 rounded-lg bg-[#5c3d2e] px-4 py-2 font-semibold text-white hover:bg-[#4a3125] transition shadow-sm cursor-pointer text-sm"
          >
            <Plus className="h-4 w-4" /> Crear usuario
          </motion.button>
        </div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col gap-3 sm:flex-row bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-4 text-sm focus:border-[#5c3d2e] focus:outline-none transition"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-200 py-1.5 px-3 text-sm focus:border-[#5c3d2e] focus:outline-none bg-white transition"
          >
            <option value="ALL">Todos los roles</option>
            <option value={Role.ADMIN}>Admin</option>
            <option value={Role.CLIENT}>Cliente</option>
          </select>
        </motion.div>

        {/* Tabla Animada */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">
            Cargando usuarios...
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
            {error}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="overflow-x-auto rounded-xl border border-slate-200/60 bg-white shadow-sm"
          >
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/60 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Nombre</th>
                  <th className="px-6 py-3.5">Correo</th>
                  <th className="px-6 py-3.5">Rol</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredUsers.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        duration: 0.25,
                        delay: idx * 0.04,
                      }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-slate-900">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-3">{user.email}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === Role.ADMIN
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {user.role === Role.ADMIN ? 'Admin' : 'Usuario'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => setStatusToggleUser(user)}
                          className="group focus:outline-none"
                          title="Haz clic para cambiar estado"
                        >
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-all ${
                              user.status === 1
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {user.status === 1 ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            {user.status === 1 ? 'Activo' : 'Inactivo'}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDrawer(user)}
                            className="text-slate-400 hover:text-[#5c3d2e] p-1 transition-colors cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(user.id)}
                            className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )}
      </motion.div>

      {/* Drawer Lateral */}
      <UserDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleSaveUser}
        editingUser={editingUser}
      />

      {/* Modal para Alternar Estado (Activar/Inactivar) */}
      <ConfirmModal
        isOpen={!!statusToggleUser}
        onClose={() => setStatusToggleUser(null)}
        onConfirm={handleConfirmToggleStatus}
        title={
          statusToggleUser?.status === 1
            ? '¿Inactivar usuario?'
            : '¿Activar usuario?'
        }
        message={
          statusToggleUser?.status === 1
            ? `¿Estás seguro de inhabilitar a "${statusToggleUser?.name}"? No podrá acceder al sistema.`
            : `¿Deseas reactivar el acceso para "${statusToggleUser?.name}"?`
        }
        confirmText={
          statusToggleUser?.status === 1 ? 'Sí, inactivar' : 'Sí, activar'
        }
        cancelText="Cancelar"
        isLoading={isTogglingStatus}
      />

      {/* Modal para Eliminar Usuario */}
      <ConfirmModal
        isOpen={!!deletingUserId}
        onClose={() => setDeletingUserId(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar usuario?"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </MainLayout>
  );
};
