import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Books } from './pages/Books';
import { Loans } from './pages/Loans';
import { BookDetail } from './pages/BookDetail';
import { Catalog } from './pages/Catalog';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/books" element={<Books />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
