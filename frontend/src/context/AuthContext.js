import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  // 🔥 새로고침 시 sessionStorage 유지
  useEffect(() => {
    const saved = sessionStorage.getItem('user');

    if (saved && saved !== 'undefined') {
      try {
        setUser(JSON.parse(saved));
      } catch (err) {
        console.error('sessionStorage user 파싱 오류:', err);
        sessionStorage.removeItem('user');
      }
    }

    setAuthLoading(false);
  }, []);

  // 로그인
  const login = (userData) => {
    if (!userData) {
      console.error('login에 userData가 없음');
      return;
    }

    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // 로그아웃
  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 커스텀 훅
export function useAuth() {
  return useContext(AuthContext);
}