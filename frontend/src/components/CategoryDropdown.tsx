import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BookCategory } from '../types';

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  categories: BookCategory[];
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
  categories,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find((cat) => cat.id === value);
  const selectedLabel =
    value === 'ALL'
      ? 'Todas las categorías'
      : selectedCategory?.name || 'Todas las categorías';

  // Cerrar al hacer clic fuera del componente
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
    <div className="relative min-w-[200px]" ref={containerRef}>
      {/* Botón Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50/80 focus:outline-none transition-all"
      >
        <div className="flex items-center gap-2 truncate">
          <Filter className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{selectedLabel}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
        </motion.div>
      </button>

      {/* Menú Desplegable Animado */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 z-30 mt-1.5 w-full min-w-[220px] rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-xl backdrop-blur-md"
          >
            <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
              {/* Opción TODAS */}
              <button
                type="button"
                onClick={() => {
                  onChange('ALL');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  value === 'ALL'
                    ? 'bg-[#f5efe6] text-[#5c3d2e]'
                    : 'text-slate-600 hover:bg-slate-100/80'
                }`}
              >
                <span>Todas las categorías</span>
                {value === 'ALL' && (
                  <Check className="h-3.5 w-3.5 text-[#5c3d2e]" />
                )}
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
                        : 'text-slate-600 hover:bg-slate-100/80'
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
