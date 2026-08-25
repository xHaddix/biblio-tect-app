import { useEffect, useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Users, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
// Importaciones para las animaciones
import { motion, AnimatePresence } from 'framer-motion';
import { loansApi } from '../api/loans';
import { usersApi } from '../api/users';
import { booksApi } from '../api/books';
import type { Loan } from '../types';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    books: 0,
    activeLoans: 0,
    returnedLoans: 0,
  });
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [expiringLoans, setExpiringLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect CORREGIDO: La función callback no es async
  useEffect(() => {
    // Definimos la función asíncrona internamente
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [users, books, loans] = await Promise.all([
          usersApi.getAll(),
          booksApi.getAll(),
          loansApi.getAll(),
        ]);

        const active = loans.filter((l) => !l.returnDate);
        const returned = loans.filter((l) => l.returnDate);

        setStats({
          users: users.length,
          books: books.length,
          activeLoans: active.length,
          returnedLoans: returned.length,
        });

        // Simulación de datos para las listas
        setRecentLoans(loans.slice(0, 4));
        setExpiringLoans(active.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Ejecutamos la función asíncrona (usando void para TS)
    void fetchDashboardData();
  }, []); // Array de dependencias vacío para ejecutar solo al montar

  return (
    <MainLayout>
      {/* Contenedor principal con animación de entrada suave */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Bienvenido de nuevo</p>
        </div>

        {/* Tarjetas KPi Animadas con AnimatePresence para secuenciar */}
        <AnimatePresence>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Usuarios',
                stat: stats.users,
                icon: <Users className="h-6 w-6" />,
                color: 'amber',
              },
              {
                title: 'Libros',
                stat: stats.books,
                icon: <BookOpen className="h-6 w-6" />,
                color: 'amber',
              },
              {
                title: 'Préstamos activos',
                stat: stats.activeLoans,
                icon: <Clock className="h-6 w-6" />,
                color: 'red',
              },
              {
                title: 'Préstamos devueltos',
                stat: stats.returnedLoans,
                icon: <CheckCircle2 className="h-6 w-6" />,
                color: 'emerald',
              },
            ].map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }} // Efecto secuencial
                className="flex items-center justify-between rounded-xl border border-brand-border/40 bg-white p-5 shadow-sm"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    {kpi.title}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    {loading ? '...' : kpi.stat}
                  </h3>
                  <span className="mt-1 inline-flex items-center text-xs font-medium text-emerald-600">
                    ↑ 12% desde el mes pasado
                  </span>
                </div>
                <div
                  className={`rounded-lg bg-${kpi.color}-100/60 p-3 text-${kpi.color}-800`}
                >
                  {kpi.icon}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Sección Préstamos con animaciones de entrada y cascada */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recientes */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-xl border border-brand-border/40 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Préstamos recientes</h3>
              <Link
                to="/loans"
                className="text-xs font-semibold text-brand-accent hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              <AnimatePresence>
                {recentLoans.map((loan, index) => (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }} // Efecto cascada
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-8 flex-shrink-0 rounded bg-slate-100 overflow-hidden border">
                        {loan.book?.imageUrl ? (
                          <img
                            src={loan.book.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-4 w-4 m-auto text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {loan.book?.title || 'Libro'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {loan.book?.author || 'Autor'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-900">
                        {loan.user?.name || 'Usuario'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(loan.loanDate).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Por vencer */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="rounded-xl border border-brand-border/40 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Préstamos por vencer</h3>
              <Link
                to="/loans"
                className="text-xs font-semibold text-brand-accent hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              <AnimatePresence>
                {expiringLoans.map((loan, index) => (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }} // Efecto cascada
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-8 flex-shrink-0 rounded bg-slate-100 overflow-hidden border">
                        {loan.book?.imageUrl ? (
                          <img
                            src={loan.book.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-4 w-4 m-auto text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {loan.book?.title || 'Libro'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {loan.book?.author || 'Autor'}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      3 días
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
};
