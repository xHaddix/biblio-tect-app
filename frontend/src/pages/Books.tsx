/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { Search, Plus, Trash2, Edit, BookOpen, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book, BookCategory } from '../types';
import { booksApi } from '../api/books';
import { getApiErrorMessage } from '../lib/api';
import { BookDrawer } from '../components/BookDrawer';
import { CategoryDropdown } from '../components/CategoryDropdown';
import { ConfirmModal } from '../components/ConfirmModal';

export const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el Drawer Lateral (Crear/Editar)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Estados para el Modal de Confirmación de Eliminación
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksData, categoriesData] = await Promise.all([
        booksApi.getAll(),
        booksApi.getCategories(),
      ]);
      setBooks(booksData);
      setCategories(categoriesData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al cargar los datos'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleOpenDrawer = (book?: Book) => {
    setEditingBook(book || null);
    setIsDrawerOpen(true);
  };

  const handleSaveBook = async (formData: FormData) => {
    try {
      if (editingBook) {
        await booksApi.update(editingBook.id, formData);
      } else {
        await booksApi.create(formData);
      }
      setIsDrawerOpen(false);
      void fetchData();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Error al guardar el libro'));
    }
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeletingBookId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBookId) return;
    try {
      setIsDeleting(true);
      await booksApi.delete(deletingBookId);
      setDeletingBookId(null);
      void fetchData();
    } catch (err) {
      alert(getApiErrorMessage(err, 'No se pudo eliminar el libro'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'ALL' || b.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-6"
      >
        {/* Encabezado Principal */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Libros</h1>
            <p className="text-sm text-slate-500">
              Gestiona el catálogo de libros
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-2 rounded-lg bg-[#5c3d2e] px-4 py-2 font-semibold text-white hover:bg-[#4a3125] transition shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Crear libro
          </motion.button>
        </div>

        {/* Barra de Búsqueda y Filtro de Categorías */}
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
              placeholder="Buscar libros..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-4 text-sm focus:border-[#5c3d2e] focus:outline-none transition"
            />
          </div>

          <CategoryDropdown
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val)}
            categories={categories}
          />
        </motion.div>

        {/* Tabla Principal */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">
            Cargando catálogo...
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
                  <th className="px-6 py-3.5">Portada</th>
                  <th className="px-6 py-3.5">Título</th>
                  <th className="px-6 py-3.5">Autor</th>
                  <th className="px-6 py-3.5">Categoría</th>
                  <th className="px-6 py-3.5">Disponibles</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filtered.map((book, index) => (
                    <motion.tr
                      key={book.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        duration: 0.25,
                        delay: index * 0.04,
                      }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="h-12 w-9 rounded border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shadow-xs">
                          {book.imageUrl ? (
                            <img
                              src={book.imageUrl}
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-3">{book.author}</td>
                      <td className="px-6 py-3">
                        {book.category?.name || 'Sin categoría'}
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-800">
                        {book.availableCopies}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/books/${book.id}`}
                            className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenDrawer(book)}
                            className="text-slate-400 hover:text-[#5c3d2e] p-1 transition-colors cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(book.id)}
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

      {/* Panel Lateral (Crear / Editar Libro) */}
      <BookDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleSaveBook}
        editingBook={editingBook}
        categories={categories}
      />

      {/* Modal Personalizado para Confirmar Eliminación */}
      <ConfirmModal
        isOpen={!!deletingBookId}
        onClose={() => setDeletingBookId(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar libro?"
        message="¿Estás seguro de que deseas eliminar este libro del catálogo? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </MainLayout>
  );
};
