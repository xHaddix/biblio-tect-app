import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BookCategory } from '../types';

interface FormCategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categories: BookCategory[];
  placeholder?: string;
}

export const FormCategorySelect: React.FC<FormCategorySelectProps> = ({
  value,
  onChange,
  categories,
  placeholder = 'Selecciona una categoría...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find((cat) => cat.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Botón Trigger del Select */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm text-left bg-white transition-all ${
          isOpen
            ? 'border-[#5c3d2e] ring-1 ring-[#5c3d2e]'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span
          className={`truncate ${
            selectedCategory ? 'text-slate-800 font-medium' : 'text-slate-400'
          }`}
        >
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
        </motion.div>
      </button>

      {/* Menú Desplegable con Animación */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar">
              {/* Opción por defecto (limpiar) */}
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  !value
                    ? 'bg-[#f5efe6] text-[#5c3d2e]'
                    : 'text-slate-500 hover:bg-slate-100/80'
                }`}
              >
                <span>Sin categoría</span>
                {!value && <Check className="h-3.5 w-3.5 text-[#5c3d2e]" />}
              </button>

              <div className="my-1 border-t border-slate-100" />

              {/* Lista de Categorías */}
              {categories.map((cat) => {
                const isSelected = value === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onChange(cat.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-[#f5efe6] text-[#5c3d2e]'
                        : 'text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
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
  );
};
