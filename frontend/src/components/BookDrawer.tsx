/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  BookOpen,
  Search,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book, BookCategory } from '../types';

interface BookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingBook: Book | null;
  categories: BookCategory[];
}

export const BookDrawer: React.FC<BookDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBook,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [publishedYear, setPublishedYear] = useState<number | ''>('');
  const [pages, setPages] = useState<number | ''>('');
  const [language, setLanguage] = useState('Español');
  const [totalCopies, setTotalCopies] = useState<number>(1);
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Errores personalizados
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Buscador de categorías
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const currentYear = 2026;

  useEffect(() => {
    if (editingBook) {
      setTitle(editingBook.title);
      setAuthor(editingBook.author);
      setIsbn(editingBook.isbn);
      setDescription(editingBook.description || '');
      setPublishedYear(editingBook.publishedYear || '');
      setPages(editingBook.pages || '');
      setLanguage(editingBook.language || 'Español');
      setTotalCopies(editingBook.totalCopies || 1);
      setCategoryId(editingBook.categoryId || '');
      setImagePreview(editingBook.imageUrl || null);
    } else {
      setTitle('');
      setAuthor('');
      setIsbn('');
      setDescription('');
      setPublishedYear('');
      setPages('');
      setLanguage('Español');
      setTotalCopies(1);
      setCategoryId('');
      setImagePreview(null);
    }
    setImageFile(null);
    setCategorySearch('');
    setErrors({});
  }, [editingBook, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Validación personalizada sin mensajes del navegador
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'El título es obligatorio';
    if (!author.trim()) newErrors.author = 'El autor es obligatorio';
    if (!isbn.trim()) newErrors.isbn = 'El ISBN es obligatorio';

    if (publishedYear !== '') {
      const yearNum = Number(publishedYear);
      if (yearNum > currentYear) {
        newErrors.publishedYear = `El año no puede ser mayor a ${currentYear}`;
      } else if (yearNum < 1000) {
        newErrors.publishedYear = 'Ingresa un año válido de 4 dígitos';
      }
    }

    if (totalCopies < 1) {
      newErrors.totalCopies = 'Debe haber al menos 1 copia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('author', author);
      formData.append('isbn', isbn);
      if (description) formData.append('description', description);
      if (publishedYear)
        formData.append('publishedYear', String(publishedYear));
      if (pages) formData.append('pages', String(pages));
      if (language) formData.append('language', language);
      formData.append('totalCopies', String(totalCopies));
      if (categoryId) formData.append('categoryId', categoryId);
      if (imageFile) formData.append('file', imageFile);

      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  const selectedCategoryName =
    categories.find((c) => c.id === categoryId)?.name ||
    'Seleccionar categoría...';

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
              className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingBook ? 'Editar Libro' : 'Nuevo Libro'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingBook
                      ? 'Actualiza los metadatos y la portada del catálogo.'
                      : 'Ingresa los detalles para registrar una nueva obra.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content - noValidate desactiva globos feos de HTML5 */}
              <form
                id="book-form"
                noValidate
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-6"
              >
                {/* Portada */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 flex gap-4 items-center">
                  <div className="h-28 w-20 flex-shrink-0 rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Portada del libro
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Formatos permitidos: JPG, PNG, WEBP. Máx. 5MB.
                    </p>
                    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition">
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      {imageFile ? 'Cambiar archivo' : 'Subir imagen'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Información Básica
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Cien años de soledad"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title)
                          setErrors((prev) => ({ ...prev, title: '' }));
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition ${
                        errors.title
                          ? 'border-rose-400 bg-rose-50/20'
                          : 'border-slate-200 focus:border-[#5c3d2e]'
                      }`}
                    />
                    {errors.title && (
                      <span className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3" /> {errors.title}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Autor *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Gabriel García Márquez"
                        value={author}
                        onChange={(e) => {
                          setAuthor(e.target.value);
                          if (errors.author)
                            setErrors((prev) => ({ ...prev, author: '' }));
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition ${
                          errors.author
                            ? 'border-rose-400 bg-rose-50/20'
                            : 'border-slate-200 focus:border-[#5c3d2e]'
                        }`}
                      />
                      {errors.author && (
                        <span className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3" /> {errors.author}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ISBN *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 9780307474728"
                        value={isbn}
                        onChange={(e) => {
                          setIsbn(e.target.value);
                          if (errors.isbn)
                            setErrors((prev) => ({ ...prev, isbn: '' }));
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition ${
                          errors.isbn
                            ? 'border-rose-400 bg-rose-50/20'
                            : 'border-slate-200 focus:border-[#5c3d2e]'
                        }`}
                      />
                      {errors.isbn && (
                        <span className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3" /> {errors.isbn}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selector de Categoría con Buscador */}
                  <div className="relative" ref={categoryRef}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Categoría
                    </label>
                    <div
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm cursor-pointer hover:border-slate-300 transition shadow-xs"
                    >
                      <span
                        className={
                          categoryId
                            ? 'text-slate-900 font-medium'
                            : 'text-slate-400'
                        }
                      >
                        {selectedCategoryName}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>

                    {isCategoryOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg p-2 space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Buscar categoría..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-[#5c3d2e]"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          <div
                            onClick={() => {
                              setCategoryId('');
                              setIsCategoryOpen(false);
                            }}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            Sin categoría
                          </div>
                          {filteredCategories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => {
                                setCategoryId(cat.id);
                                setIsCategoryOpen(false);
                              }}
                              className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition ${
                                categoryId === cat.id
                                  ? 'bg-[#5c3d2e] text-white font-medium'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {cat.name}
                            </div>
                          ))}
                          {filteredCategories.length === 0 && (
                            <div className="p-2 text-center text-xs text-slate-400">
                              No se encontraron categorías
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sinopsis / Descripción
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Resumen del argumento..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#5c3d2e] focus:outline-none transition resize-none"
                    />
                  </div>
                </div>

                {/* Detalles Adicionales */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Detalles Adicionales
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Año
                      </label>
                      <input
                        type="number"
                        placeholder="1967"
                        value={publishedYear}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            setPublishedYear('');
                          } else {
                            // Limitar a máximo 4 dígitos en tipeo directo
                            const numVal = Number(val);
                            if (val.length <= 4) {
                              setPublishedYear(numVal);
                            }
                          }
                          if (errors.publishedYear)
                            setErrors((prev) => ({
                              ...prev,
                              publishedYear: '',
                            }));
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition ${
                          errors.publishedYear
                            ? 'border-rose-400 bg-rose-50/20'
                            : 'border-slate-200 focus:border-[#5c3d2e]'
                        }`}
                      />
                      {errors.publishedYear && (
                        <span className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3" />{' '}
                          {errors.publishedYear}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Páginas
                      </label>
                      <input
                        type="number"
                        placeholder="471"
                        value={pages}
                        onChange={(e) =>
                          setPages(e.target.value ? Number(e.target.value) : '')
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#5c3d2e] focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Copias Total *
                      </label>
                      <input
                        type="number"
                        value={totalCopies}
                        onChange={(e) => setTotalCopies(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#5c3d2e] focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Footer Fijo */}
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
                  form="book-form"
                  disabled={submitting}
                  className="rounded-lg bg-[#5c3d2e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a3125] disabled:opacity-50 shadow-sm transition cursor-pointer"
                >
                  {submitting
                    ? 'Guardando...'
                    : editingBook
                      ? 'Actualizar Libro'
                      : 'Crear Libro'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
