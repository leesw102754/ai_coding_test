import { useState,useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, signup as signupApi } from '../api/authApi';
import LoadingOverlay from '../components/LoadingOverlay';

export default function LoginPage() {
const [loginLoading, setLoginLoading] = useState(false);
const [signupLoading, setSignupLoading] = useState(false);
const navigate = useNavigate();
const { login, user } = useAuth();
    
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [signupForm, setSignupForm] = useState({
    username: '',
    password: '',
    name: '',
    studentId: '',
  });

const handleLogin = async (e) => {
  e.preventDefault();

  if (!id || !pw) {
    alert('입력하세요');
    return;
  }

  try {
    setLoginLoading(true);

    const userData = await loginApi({
      username: id,
      password: pw,
    });

    login(userData);
  } catch (err) {
    alert(err.response?.data?.message || '로그인 실패');
  } finally {
    setLoginLoading(false);
  }
};


  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSignup = async (e) => {
  e.preventDefault();

  const { username, password, name, studentId } = signupForm;
  if (!username || !password || !name || !studentId) {
    alert('모든 항목을 입력하세요');
    return;
  }

  try {
    setSignupLoading(true);

    await signupApi({ username, password, name, studentId });

    alert('회원가입 성공! 로그인해주세요');
    setSignupForm({
      username: '',
      password: '',
      name: '',
      studentId: '',
    });
    setIsSignupOpen(false);
  } catch (err) {
    alert(err.response?.data?.message || '회원가입 실패');
  } finally {
    setSignupLoading(false);
  }
};

useEffect(() => {
  if (user) {
    navigate('/');
  }
}, [user, navigate]);




return (
  <div className="login-page">
    <div className="login-hero">
      <div className="login-hero-content">
        <h1 className="login-title">CodeTest</h1>
        <p className="login-subtitle">코딩 테스트 플랫폼에 로그인하세요</p>
      </div>
    </div>

    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2 className="card-title">로그인</h2>

        <input
          type="text"
          name="username"
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="login-input"
        />

        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="login-input"
        />

<button type="submit" className="login-btn" disabled={loginLoading}>
  {loginLoading ? '로그인 중...' : '로그인'}
</button>

        <div className="login-footer">
          계정이 없으신가요?{' '}
          <span
            className="link"
            onClick={() => setIsSignupOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            회원가입
          </span>
        </div>
      </form>
    </div>

{isSignupOpen && (
  <div className="modal-overlay" onClick={() => setIsSignupOpen(false)}>
    <div className="signup-modal layout-style" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="close-btn"
        onClick={() => setIsSignupOpen(false)}
      >
        ✕
      </button>

      <h2>회원가입</h2>

      <form onSubmit={handleSignup} className="signup-form-layout">
        <div className="signup-left">
          <div className="signup-row first-row">
            <input
              type="text"
              name="username"
              placeholder="아이디"
              value={signupForm.username}
              onChange={handleSignupChange}
              className="login-input"
            />
            <button type="button" className="check-btn">
              중복확인
            </button>
          </div>

          <div className="signup-row">
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={signupForm.password}
              onChange={handleSignupChange}
              className="login-input"
            />
          </div>

          <div className="signup-row">
            <input
              type="text"
              name="name"
              placeholder="이름"
              value={signupForm.name}
              onChange={handleSignupChange}
              className="login-input"
            />
          </div>

          <div className="signup-row">
            <input
              type="text"
              name="studentId"
              placeholder="학번"
              value={signupForm.studentId}
              onChange={handleSignupChange}
              className="login-input"
            />
          </div>

          <button type="submit" className="login-btn signup-submit-btn">
            회원가입
          </button>
        </div>

        <div className="signup-right-note">
        </div>
      </form>
    </div>
  </div>
)}
{(loginLoading || signupLoading) && (
  <LoadingOverlay
    text={loginLoading ? "로그인 중입니다..." : "회원가입 처리 중입니다..."}
  />
)}
  </div>
);
}