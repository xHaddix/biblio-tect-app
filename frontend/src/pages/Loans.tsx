/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import {
  Plus,
  CheckCircle2,
  BookOpen,
  Search,
  Clock,
  UserCheck,
  Calendar,
  X,
  Loader2,
  ArrowRight,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import type { Loan, User, Book } from '../types';
import { loansApi } from '../api/loans';
import { usersApi } from '../api/users';
import { booksApi } from '../api/books';
import { getApiErrorMessage } from '../lib/api';

export const Loans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'ALL' | 'ACTIVE' | 'RETURNED'
  >('ALL');

  // Formulario / Modal
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansData, usersData, booksData] = await Promise.all([
        loansApi.getAll(),
        usersApi.getAll(),
        booksApi.getAll(),
      ]);
      setLoans(loansData);
      setUsers(usersData);
      setBooks(booksData.filter((b) => b.availableCopies > 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const selectedBookObj = books.find((b) => b.id === selectedBook);
  const selectedUserObj = users.find((u) => u.id === selectedUser);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedBook) return;

    try {
      setSubmitting(true);
      await loansApi.create({ userId: selectedUser, bookId: selectedBook });
      setIsCreating(false);
      setSelectedUser('');
      setSelectedBook('');
      void fetchData();
    } catch (err) {
      alert(getApiErrorMessage(err, 'No se pudo procesar el préstamo'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnLoan = async (id: string) => {
    if (!confirm('¿Confirmas la devolución de este libro?')) return;
    try {
      await loansApi.returnLoan(id);
      void fetchData();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Error al procesar devolución'));
    }
  };

  // Cálculos de KPI
  const activeLoansCount = loans.filter((l) => !l.returnDate).length;
  const returnedLoansCount = loans.filter((l) => l.returnDate).length;

  // Filtrado de lista
  const filteredLoans = loans.filter((loan) => {
    const userName = (loan.user?.name || '').toLowerCase();
    const bookTitle = (loan.book?.title || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      userName.includes(search) || bookTitle.includes(search);
    const matchesStatus =
      filterStatus === 'ALL'
        ? true
        : filterStatus === 'ACTIVE'
          ? !loan.returnDate
          : !!loan.returnDate;

    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Encabezado Principal */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              Gestión de Préstamos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Control general de circulaciones, reservas activas y devoluciones
              de libros.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-brand-accent-hover hover:shadow-lg active:scale-95 text-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo préstamo</span>
          </button>
        </div>

        {/* Tarjetas de Estadísticas (KPIs) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Registros
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {loans.length}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/30 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Préstamos Activos
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-800">
                  {activeLoansCount}
                </p>
              </div>
              <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/30 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Devueltos
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-800">
                  {returnedLoansCount}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulario / Modal de Nuevo Préstamo */}
        {isCreating && (
          <div className="rounded-2xl border border-brand-accent/20 bg-white p-6 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-accent" />
                <h3 className="text-lg font-bold text-slate-900">
                  Registrar nuevo préstamo
                </h3>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Selector de Usuario */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Usuario solicitante
                  </label>
                  <select
                    required
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-sm transition-all focus:border-brand-accent focus:outline-none focus:ring-4 focus:ring-brand-accent/15"
                  >
                    <option value="">Selecciona un usuario...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de Libro */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Libro disponible
                  </label>
                  <select
                    required
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-sm transition-all focus:border-brand-accent focus:outline-none focus:ring-4 focus:ring-brand-accent/15"
                  >
                    <option value="">Selecciona un libro...</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} — {b.author} ({b.availableCopies} disp.)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vista Previa / Tarjeta Resumen */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Resumen de la transacción
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Detalles del Libro */}
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-300 bg-slate-200 shadow-sm flex items-center justify-center">
                      {selectedBookObj?.imageUrl ? (
                        <img
                          src={selectedBookObj.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedBookObj?.title || 'Selecciona un libro'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedBookObj?.author || 'Autor del libro'}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="hidden h-5 w-5 text-slate-400 sm:block" />

                  {/* Detalles del Usuario */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent font-bold text-sm">
                      {selectedUserObj?.name ? (
                        selectedUserObj.name.charAt(0).toUpperCase()
                      ) : (
                        <UserIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedUserObj?.name || 'Selecciona un usuario'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedUserObj?.email || 'correo@ejemplo.com'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedUser || !selectedBook}
                  className="flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-accent-hover active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>Confirmar préstamo</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Controles de Búsqueda y Filtros */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por libro o usuario..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-all focus:border-brand-accent focus:outline-none focus:ring-4 focus:ring-brand-accent/15"
            />
          </div>

          {/* Tabs de Filtro de Estado */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`rounded-lg px-3.5 py-1.5 transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('ACTIVE')}
              className={`rounded-lg px-3.5 py-1.5 transition-all ${
                filterStatus === 'ACTIVE'
                  ? 'bg-white text-amber-800 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus('RETURNED')}
              className={`rounded-lg px-3.5 py-1.5 transition-all ${
                filterStatus === 'RETURNED'
                  ? 'bg-white text-emerald-800 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Devueltos
            </button>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
              <p className="mt-3 text-sm">Cargando préstamos...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-base font-semibold text-slate-700">
                No se encontraron préstamos
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Intenta ajustando el filtro o término de búsqueda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Libro</th>
                    <th className="px-6 py-4">Fecha Préstamo</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLoans.map((loan) => (
                    <tr
                      key={loan.id}
                      className="group transition-colors hover:bg-slate-50/60"
                    >
                      {/* Usuario */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                            {loan.user?.name ? (
                              loan.user.name.charAt(0).toUpperCase()
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {loan.user?.name || 'Usuario desconocido'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {loan.user?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Libro */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-8 flex-shrink-0 overflow-hidden rounded bg-slate-200 border border-slate-300 flex items-center justify-center">
                            {loan.book?.imageUrl ? (
                              <img
                                src={loan.book.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {loan.book?.title || 'Libro sin título'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {loan.book?.author || 'Autor N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {new Date(loan.loanDate).toLocaleDateString(
                              'es-ES',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Estado Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            !loan.returnDate
                              ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${!loan.returnDate ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}
                          />
                          {!loan.returnDate ? 'En Préstamo' : 'Devuelto'}
                        </span>
                      </td>

                      {/* Botón de Acción */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {!loan.returnDate ? (
                          <button
                            onClick={() => void handleReturnLoan(loan.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 hover:text-emerald-800 active:scale-95"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Registrar devolución</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Completado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
