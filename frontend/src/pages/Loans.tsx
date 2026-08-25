/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Plus, CheckCircle, BookOpen } from 'lucide-react';
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

  // Formulario
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
      setBooks(booksData.filter((b) => b.availableCopies));
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
    if (!confirm('¿Registrar devolución de este libro?')) return;
    try {
      await loansApi.returnLoan(id);
      void fetchData();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Error al procesar devolución'));
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isCreating ? 'Nuevo préstamo' : 'Gestión de Préstamos'}
            </h1>
            <p className="text-sm text-slate-500">
              {isCreating
                ? 'Registra un nuevo préstamo de libro'
                : 'Lista y control de devoluciones'}
            </p>
          </div>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white hover:bg-brand-accent-hover transition shadow-sm text-sm"
            >
              <Plus className="h-4 w-4" /> Nuevo préstamo
            </button>
          )}
        </div>

        {isCreating ? (
          /* Formulario fiel al prototipo */
          <div className="rounded-xl border border-brand-border/40 bg-white p-6 shadow-sm">
            <form onSubmit={handleCreateLoan} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Usuario
                  </label>
                  <select
                    required
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-brand-accent focus:outline-none bg-white"
                  >
                    <option value="">Seleccionar usuario</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Libro
                  </label>
                  <select
                    required
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-brand-accent focus:outline-none bg-white"
                  >
                    <option value="">Buscar y seleccionar libro</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} - {b.author}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumen del Préstamo */}
              <div className="rounded-xl bg-slate-50/70 p-4 border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Resumen del préstamo
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-9 rounded bg-slate-200 flex items-center justify-center overflow-hidden border">
                      {selectedBookObj?.imageUrl ? (
                        <img
                          src={selectedBookObj.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedBookObj?.title ||
                          'Título del libro seleccionado'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedBookObj?.author || 'Autor del libro'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900">
                      {selectedUserObj?.name || 'Usuario seleccionado'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {selectedUserObj?.email || 'usuario@email.com'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-brand-accent px-5 py-2 text-sm font-semibold text-white hover:bg-brand-accent-hover disabled:opacity-50"
                >
                  {submitting ? 'Procesando...' : 'Registrar préstamo'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Tabla Principal */
          <div className="overflow-x-auto rounded-xl border border-brand-border/30 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/60 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Usuario</th>
                  <th className="px-6 py-3.5">Libro</th>
                  <th className="px-6 py-3.5">Fecha Préstamo</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-semibold text-slate-900">
                      {loan.user?.name || loan.userId}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {loan.book?.title || loan.bookId}
                    </td>
                    <td className="px-6 py-3">
                      {new Date(loan.loanDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          !loan.returnDate
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {!loan.returnDate ? 'Activo' : 'Devuelto'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {!loan.returnDate && (
                        <button
                          onClick={() => void handleReturnLoan(loan.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          <CheckCircle className="h-4 w-4" /> Marcar como
                          devuelto
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
