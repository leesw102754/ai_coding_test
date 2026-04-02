import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Header.css';
import { useAuth } from '../context/AuthContext';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useAuth();
  const [ openModal, setOpenModal ] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
  sessionStorage.removeItem('user');
  setUser(null);
  navigate('/');
};

// 로그아웃 모달 외부 클릭 시 닫기
useEffect(() => {
  const handleClick = (e) => {
    if (!e.target.closest('.profile')) {
      setOpenModal(false);
    }
  };

  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}, []);


  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="logo-icon">&lt;/&gt;</span>
          <span className="logo-text">CodeTest</span>
        </Link>

        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-label="테마 전환"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {user && (
      <div className="profile">
        <button
          className="profile-btn"
          onClick={() => setOpenModal(prev => !prev)}
        >
          👤
        </button>

        {openModal && (
          <div className="dropdown">
            <div className="dropdown-item">{user.id}</div>
        
            <button
              className="dropdown-btn logout"
              onClick={logout}
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
          )}
        </div>
      </div>
    </header>
  );
}
