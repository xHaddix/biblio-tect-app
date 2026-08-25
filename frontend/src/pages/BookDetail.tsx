/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { ArrowLeft, Edit, Trash2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Book, BookCategory } from '../types';
import { booksApi } from '../api/books';
import { getApiErrorMessage } from '../lib/api';
import { BookDrawer } from '../components/BookDrawer';
import { ConfirmModal } from '../components/ConfirmModal';

export const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Modales / Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchBookData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [bookData, categoriesData] = await Promise.all([
        booksApi.getOne(id),
        booksApi.getCategories(),
      ]);
      setBook(bookData);
      setCategories(categoriesData);
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'No se pudo cargar la información del libro'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBookData();
  }, [id]);

  const handleSaveBook = async (formData: FormData) => {
    if (!book) return;
    try {
      await booksApi.update(book.id, formData);
      setIsDrawerOpen(false);
      void fetchBookData();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Error al actualizar el libro'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!book) return;
    try {
      setIsDeleting(true);
      await booksApi.delete(book.id);
      setIsDeleteModalOpen(false);
      navigate('/books');
    } catch (err) {
      alert(getApiErrorMessage(err, 'No se pudo eliminar el libro'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading)
    return (
      <MainLayout>
        <div className="p-8 text-center text-slate-500 animate-pulse">
          Cargando detalle...
        </div>
      </MainLayout>
    );

  if (error || !book)
    return (
      <MainLayout>
        <div className="p-8 text-center text-red-500">
          {error || 'Libro no encontrado'}
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="space-y-6 max-w-4xl"
      >
        {/* Navegación y Acciones */}
        <div className="flex items-center justify-between">
          <Link
            to="/books"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Libros &gt; Detalle del libro
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5 text-slate-500" /> Editar
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 shadow-xs transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </button>
          </div>
        </div>

        {/* Tarjeta Principal */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col gap-8 rounded-xl border border-slate-200/70 bg-white p-6 shadow-xs md:flex-row"
        >
          {/* Portada */}
          <div className="h-72 w-52 flex-shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-200/80 shadow-xs flex items-center justify-center">
            {book.imageUrl ? (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <BookOpen className="h-16 w-16 text-slate-300" />
            )}
          </div>

          {/* Información del libro */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                {book.title}
              </h1>
              <p className="mt-1 text-base font-medium text-slate-500">
                {book.author}
              </p>
            </div>

            <div>
              <span className="inline-block rounded-md bg-[#f5efe6] px-3 py-1 text-xs font-semibold text-[#5c3d2e]">
                {book.category?.name || 'Sin categoría'}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {book.description ||
                'Sin descripción disponible para este título.'}
            </p>

            {/* Especificaciones */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 border-t border-slate-100 pt-6 text-xs">
              <div>
                <p className="font-semibold text-slate-400 uppercase tracking-wider">
                  ISBN
                </p>
                <p className="mt-1 font-bold text-slate-800">{book.isbn}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase tracking-wider">
                  Publicado
                </p>
                <p className="mt-1 font-bold text-slate-800">
                  {book.publishedYear || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase tracking-wider">
                  Páginas
                </p>
                <p className="mt-1 font-bold text-slate-800">
                  {book.pages || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase tracking-wider">
                  Idioma
                </p>
                <p className="mt-1 font-bold text-slate-800">
                  {book.language || 'Español'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase tracking-wider">
                  Disponibles
                </p>
                <p className="mt-1 font-bold text-slate-800">
                  {book.availableCopies} de {book.totalCopies}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Drawer Lateral para Editar */}
      <BookDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleSaveBook}
        editingBook={book}
        categories={categories}
      />

      {/* Modal de Confirmación para Eliminar */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar libro?"
        message={`¿Estás seguro de que deseas eliminar "${book.title}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </MainLayout>
  );
};
