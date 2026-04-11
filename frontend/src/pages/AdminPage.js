import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

export default function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="admin-page">
      <div className="admin-page-inner">
        <h2 className="admin-title">문제 출제 관리</h2>
        <p className="admin-subtitle">출제할 문제 유형을 선택하세요.</p>

        <div className="admin-type-list">
          <button
            className="admin-type-card"
            onClick={() => navigate('/admin/objective')}
          >
            <div className="admin-type-circle">O/X</div>
            <div className="admin-type-text">객관식 문제 출제</div>
          </button>

          <button
            className="admin-type-card"
            onClick={() => navigate('/admin/coding')}
          >
            <div className="admin-type-circle">{'</>'}</div>
            <div className="admin-type-text">코드작성형 문제 출제</div>
          </button>
        </div>
      </div>
    </div>
  );
}