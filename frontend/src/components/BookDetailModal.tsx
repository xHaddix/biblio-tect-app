import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  BookmarkPlus,
  Check,
  User,
  Calendar,
  Tag,
} from 'lucide-react';
import type { Book } from '../types';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestLoan: (bookId: string) => void;
  isAlreadyLoaned: boolean;
  isRequesting: boolean;
}

export const BookDetailModal = ({
  book,
  isOpen,
  onClose,
  onRequestLoan,
  isAlreadyLoaned,
  isRequesting,
}: BookDetailModalProps) => {
  if (!isOpen || !book) return null;

  const copies = (book as { availableCopies?: number }).availableCopies ?? 0;
  const imageUrl = (book as { imageUrl?: string }).imageUrl;
  const categoryName = (book as { category?: { name: string } }).category?.name;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100"
        >
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Portada del Libro */}
            <div className="h-64 w-44 shrink-0 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-sm flex items-center justify-center overflow-hidden p-2">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={book.title}
                  className="h-full w-full object-contain rounded-lg"
                />
              ) : (
                <div className="h-16 w-12 bg-white rounded-lg shadow border border-amber-200 flex items-center justify-center text-[#5c3d2e]">
                  <BookOpen className="h-6 w-6" />
                </div>
              )}
            </div>

            {/* Información del Libro */}
            <div className="space-y-4 flex-1 w-full text-left">
              <div>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${
                    copies > 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {copies > 0 ? `${copies} copias disponibles` : 'Sin stock'}
                </span>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {book.title}
                </h2>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Autor:</strong>{' '}
                    {book.author}
                  </span>
                </div>

                {categoryName && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>
                      <strong className="text-slate-800">Categoría:</strong>{' '}
                      {categoryName}
                    </span>
                  </div>
                )}

                {book.isbn && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>
                      <strong className="text-slate-800">ISBN:</strong>{' '}
                      {book.isbn}
                    </span>
                  </div>
                )}
              </div>

              {(book as { description?: string }).description && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">
                    {(book as { description?: string }).description}
                  </p>
                </div>
              )}

              {/* Botón de Acción */}
              <div className="pt-4">
                <button
                  disabled={copies <= 0 || isRequesting || isAlreadyLoaned}
                  onClick={() => {
                    onRequestLoan(book.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                    isAlreadyLoaned
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed'
                      : copies > 0
                        ? 'bg-brand-accent text-white hover:bg-brand-accent-hover active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isAlreadyLoaned ? (
                    <>
                      <Check className="h-4 w-4 text-amber-700" />
                      <span>Ya tienes una copia prestada</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-4 w-4" />
                      <span>
                        {isRequesting ? 'Solicitando...' : 'Solicitar préstamo'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
