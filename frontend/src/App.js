import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ProblemProvider } from './context/ProblemContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProblemPage from './pages/ProblemPage';
import './styles/global.css';

import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProblemProvider>
          <BrowserRouter>
            <AppRoutes /> {/* 👈 여기로 분리 */}
          </BrowserRouter>
        </ProblemProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}


function AppRoutes() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <div>로딩중...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <>
      <Header />
      <Routes>
        {user.role === 'ADMIN' ? (
          <>
            <Route path="/" element={<AdminPage />} />
            <Route path="*" element={<AdminPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/problem/:id" element={<ProblemPage />} />
            <Route path="*" element={<HomePage />} />
          </>
        )}
      </Routes>
    </>
  );
}