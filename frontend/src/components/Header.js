import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Header.css';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    Object.keys(sessionStorage).forEach((key) => {
      if (
        key === 'user' ||
        key.startsWith('result-') ||
        key.startsWith('solved-')
      ) {
        sessionStorage.removeItem(key);
      }
    });

    setUser(null);
    navigate('/');
  };

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
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {user && (
            <div className="profile">
              <button
                className={`profile-btn ${openModal ? 'active' : ''}`}
                onClick={() => setOpenModal((prev) => !prev)}
              >
                <div className="profile-avatar">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="profile-meta">
                  <span className="profile-name">{user.name}</span>
                  <span className="profile-role">
                    {user.role === 'ADMIN' ? '관리자' : '사용자'}
                  </span>
                </div>
                <svg
                  className={`profile-arrow ${openModal ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openModal && (
                <div className="dropdown">
                  <div className="dropdown-user">
                    <div className="dropdown-avatar">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">{user.name}</div>
                      <div className="dropdown-user-role">
                        {user.role === 'ADMIN' ? '관리자 계정' : '일반 사용자'}
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  {user.role === 'ADMIN' ? (
                    <>
                      <button
                        className="dropdown-btn"
                        onClick={() => {
                          setOpenModal(false);
                          navigate('/admin/results');
                        }}
                      >
                        <span className="dropdown-btn-icon">📊</span>
                        <span>전체 결과 확인</span>
                      </button>

                      <button
                        className="dropdown-btn"
                        onClick={() => {
                          setOpenModal(false);
                          navigate('/admin/exams');
                        }}
                      >
                        <span className="dropdown-btn-icon">📝</span>
                        <span>전체 문제 관리</span>
                      </button>
                    </>
                  ) : (
                    <button
                      className="dropdown-btn"
                      onClick={() => {
                        setOpenModal(false);
                        navigate('/results');
                      }}
                    >
                      <span className="dropdown-btn-icon">📊</span>
                      <span>결과 확인</span>
                    </button>
                  )}

                  <button className="dropdown-btn logout" onClick={logout}>
                    <span className="dropdown-btn-icon">↪</span>
                    <span>로그아웃</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {user?.role === 'ADMIN' && (
            <button className="nav-btn admin-nav-btn" onClick={() => navigate('/admin')}>
              문제출제
            </button>
          )}
        </div>
      </div>
    </header>
  );
}