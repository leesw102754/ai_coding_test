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
import AdminObjectivePage from './pages/AdminObjectivePage';
import AdminCodingPage from './pages/AdminCodingPage';
import AdminResultPage from './pages/AdminResultPage';
import AdminExamManagePage from './pages/AdminExamManagePage';
import ResultsPage from './pages/ResultsPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ObjectiveSolvePage from './pages/ObjectiveSolvePage';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProblemProvider>
          <BrowserRouter>
            <AppRoutes />
                  <ToastContainer
              position="top-center"
              autoClose={2000}
              pauseOnHover
              closeOnClick
            />
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
  	<Route path="/" element={<HomePage />} />
  	<Route path="/problem/:id" element={<ProblemPage />} />
  	<Route path="/objective-solve" element={<ObjectiveSolvePage />} />
  	<Route path="/results" element={<ResultsPage />} />

        {user.role === 'ADMIN' && (
          <>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/objective" element={<AdminObjectivePage />} />
            <Route path="/admin/coding" element={<AdminCodingPage />} />
            <Route path="/admin/results" element={<AdminResultPage />} />
            <Route path="/admin/exams" element={<AdminExamManagePage />} />
          </>
        )}

        <Route
          path="*"
          element={user.role === 'ADMIN' ? <AdminPage /> : <HomePage />}
        />
      </Routes>
    </>
  );
}