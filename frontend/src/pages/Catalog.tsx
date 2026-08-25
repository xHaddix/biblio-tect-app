import { useEffect, useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import {
  Search,
  BookOpen,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle,
  Filter,
  RotateCcw,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { booksApi } from '../api/books';
import { loansApi } from '../api/loans';
import { getApiErrorMessage } from '../lib/api';
import type { Book, Category, Loan } from '../types';

export const Catalog = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<
    'ALL' | 'AVAILABLE' | 'LOANED'
  >('ALL');

  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksData, categoriesData, loansData] = await Promise.all([
        booksApi.getAll(),
        booksApi.getCategories(),
        loansApi.getAll(),
      ]);

      setBooks(booksData);
      setCategories(categoriesData);

      // Filtrar préstamos activos del usuario logueado
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr) as { id: string };
        const activeLoans = loansData.filter(
          (loan: Loan) => loan.userId === user.id && !loan.returnDate,
        );
        setUserLoans(activeLoans);
      }
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Error al cargar el catálogo de libros'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const hasActiveLoan = (bookId: string) => {
    return userLoans.some((loan) => loan.bookId === bookId);
  };

  const handleRequestLoan = async (bookId: string) => {
    try {
      setRequestingId(bookId);
      setError(null);

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError(
          'No se encontró información de sesión. Por favor, inicia sesión de nuevo.',
        );
        return;
      }

      const user = JSON.parse(userStr) as { id: string };

      await loansApi.create({
        bookId,
        userId: user.id,
      });

      setSuccessMessage('¡Libro solicitado con éxito! Revisa "Mis Préstamos".');
      setTimeout(() => setSuccessMessage(null), 4000);

      void fetchData();
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'No se pudo solicitar el préstamo del libro'),
      );
    } finally {
      setRequestingId(null);
    }
  };

  const filteredBooks = books.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase());
    const bookCategoryId = (b as { categoryId?: string }).categoryId;
    const matchesCategory =
      selectedCategory === 'ALL' || bookCategoryId === selectedCategory;

    const copies = (b as { availableCopies?: number }).availableCopies ?? 0;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'AVAILABLE' && copies > 0) ||
      (selectedStatus === 'LOANED' && copies === 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const booksByCategory = categories
    .map((category) => {
      const categoryBooks = filteredBooks.filter(
        (b) => (b as { categoryId?: string }).categoryId === category.id,
      );
      return {
        category,
        books: categoryBooks,
      };
    })
    .filter((group) => group.books.length > 0);

  const uncategorizedBooks = filteredBooks.filter(
    (b) =>
      !categories.some(
        (cat) => cat.id === (b as { categoryId?: string }).categoryId,
      ),
  );

  const totalBooksCount = books.length;
  const availableBooksCount = books.filter(
    (b) => ((b as { availableCopies?: number }).availableCopies ?? 0) > 0,
  ).length;
  const loanedBooksCount = totalBooksCount - availableBooksCount;

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Catálogo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Explora los libros organizados por categorías
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total de libros
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalBooksCount}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Libros en el catálogo
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/30 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Disponibles
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {availableBooksCount}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              {totalBooksCount > 0
                ? Math.round((availableBooksCount / totalBooksCount) * 100)
                : 0}
              % del total
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/30 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Prestados
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-800">
              {loanedBooksCount}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {totalBooksCount > 0
                ? Math.round((loanedBooksCount / totalBooksCount) * 100)
                : 0}
              % del total
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Categorías
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {categories.length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Categorías registradas
            </p>
          </div>
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span className="text-sm font-medium">{successMessage}</span>
          </motion.div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-brand-accent focus:outline-none transition shadow-sm"
              />
            </div>

            {loading ? (
              <div className="p-16 text-center text-slate-400 animate-pulse bg-white rounded-2xl border border-slate-200/60">
                Cargando catálogo disponible...
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/60 text-slate-500 shadow-sm">
                No se encontraron libros con los filtros seleccionados.
              </div>
            ) : (
              <div className="space-y-10">
                {booksByCategory.map(({ category, books: catBooks }) => (
                  <div key={category.id} className="space-y-4">
                    <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-slate-800 tracking-wide">
                        {category.name}
                      </h2>
                      <span className="text-xs font-medium text-slate-400">
                        {catBooks.length}{' '}
                        {catBooks.length === 1 ? 'libro' : 'libros'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <AnimatePresence>
                        {catBooks.map((book, idx) => {
                          const copies =
                            (book as { availableCopies?: number })
                              .availableCopies ?? 0;
                          const imageUrl = (book as { imageUrl?: string })
                            .imageUrl;
                          const isAlreadyLoaned = hasActiveLoan(book.id);

                          return (
                            <motion.div
                              key={book.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.25, delay: idx * 0.03 }}
                              className="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group p-3 space-y-2 w-[190px]"
                            >
                              <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center relative border border-slate-100 overflow-hidden p-2">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={book.title}
                                    className="h-full w-full object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="h-14 w-10 bg-white rounded-lg shadow-md border border-amber-200/60 flex items-center justify-center text-[#5c3d2e]">
                                    <BookOpen className="h-5 w-5" />
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1 flex-1">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    copies > 0
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                  }`}
                                >
                                  {copies > 0 ? 'Disponible' : 'Prestado'}
                                </span>
                                <h3
                                  className="font-bold text-slate-900 line-clamp-1 text-xs"
                                  title={book.title}
                                >
                                  {book.title}
                                </h3>
                                {book.isbn && (
                                  <p className="text-[10px] text-slate-400 font-medium truncate">
                                    ISBN: {book.isbn}
                                  </p>
                                )}
                              </div>

                              <motion.button
                                whileHover={{
                                  scale:
                                    copies > 0 && !isAlreadyLoaned ? 1.02 : 1,
                                }}
                                whileTap={{
                                  scale:
                                    copies > 0 && !isAlreadyLoaned ? 0.98 : 1,
                                }}
                                disabled={
                                  copies <= 0 ||
                                  requestingId === book.id ||
                                  isAlreadyLoaned
                                }
                                onClick={() => void handleRequestLoan(book.id)}
                                className={`w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold transition shadow-sm cursor-pointer ${
                                  isAlreadyLoaned
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed'
                                    : copies > 0
                                      ? 'bg-brand-accent text-white hover:bg-brand-accent-hover'
                                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {isAlreadyLoaned ? (
                                  <>
                                    <Check className="h-3 w-3 text-amber-700" />
                                    <span>Ya solicitado</span>
                                  </>
                                ) : (
                                  <>
                                    <BookmarkPlus className="h-3 w-3" />
                                    <span>
                                      {requestingId === book.id
                                        ? 'Solicitando...'
                                        : 'Solicitar'}
                                    </span>
                                  </>
                                )}
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}

                {uncategorizedBooks.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 pb-2">
                      <h2 className="text-lg font-bold text-slate-800 tracking-wide">
                        Otros libros
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {uncategorizedBooks.map((book) => {
                        const copies =
                          (book as { availableCopies?: number })
                            .availableCopies ?? 0;
                        const imageUrl = (book as { imageUrl?: string })
                          .imageUrl;
                        const isAlreadyLoaned = hasActiveLoan(book.id);

                        return (
                          <div
                            key={book.id}
                            className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-3 space-y-2 w-[190px] flex flex-col justify-between"
                          >
                            <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center border p-2">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt=""
                                  className="h-full w-full object-contain rounded-lg"
                                />
                              ) : (
                                <BookOpen className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div className="space-y-1 flex-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${copies > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                              >
                                {copies > 0 ? 'Disponible' : 'Prestado'}
                              </span>
                              <h3 className="font-bold text-xs text-slate-900 line-clamp-1">
                                {book.title}
                              </h3>
                              {book.isbn && (
                                <p className="text-[10px] text-slate-400 truncate">
                                  ISBN: {book.isbn}
                                </p>
                              )}
                            </div>
                            <button
                              disabled={
                                copies <= 0 ||
                                requestingId === book.id ||
                                isAlreadyLoaned
                              }
                              onClick={() => void handleRequestLoan(book.id)}
                              className={`w-full py-1.5 rounded-xl text-[11px] font-semibold ${
                                isAlreadyLoaned
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed'
                                  : copies > 0
                                    ? 'bg-brand-accent hover:bg-brand-accent-hover text-white'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              {isAlreadyLoaned
                                ? 'Ya solicitado'
                                : requestingId === book.id
                                  ? 'Solicitando...'
                                  : 'Solicitar'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Filter className="h-4 w-4 text-brand-accent" />
                <span>Filtros</span>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSearch('');
                }}
                className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Limpiar filtros
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-700 focus:border-brand-accent focus:outline-none transition shadow-sm cursor-pointer"
              >
                <option value="ALL">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Estado
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={selectedStatus === 'ALL'}
                    onChange={() => setSelectedStatus('ALL')}
                    className="text-brand-accent focus:ring-brand-accent"
                  />
                  <span>Todos</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={selectedStatus === 'AVAILABLE'}
                    onChange={() => setSelectedStatus('AVAILABLE')}
                    className="text-brand-accent focus:ring-brand-accent"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />{' '}
                    Disponibles
                  </span>
                </label>
                <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={selectedStatus === 'LOANED'}
                    onChange={() => setSelectedStatus('LOANED')}
                    className="text-brand-accent focus:ring-brand-accent"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />{' '}
                    Prestados
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};
