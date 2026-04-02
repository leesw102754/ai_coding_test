import { useState } from 'react';
import { createExam } from '../api/problemApi';
import './AdminPage.css';

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage('제목과 설명을 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      await createExam({
        title,
        description,
      });

      setMessage('문제가 등록되었습니다.');
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setMessage('문제 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-inner">
        <h2 className="admin-title">문제 등록</h2>
        <p className="admin-subtitle">새로운 시험 문제를 등록할 수 있습니다.</p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">문제 제목</label>
            <input
              type="text"
              className="admin-input"
              placeholder="예: 제5회 자바 기초 시험"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">문제 설명</label>
            <textarea
              className="admin-textarea"
              placeholder="예: Hello World를 출력하시오"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
            />
          </div>

          {message && <div className="admin-message">{message}</div>}

          <button className="admin-submit-btn" type="submit" disabled={loading}>
            {loading ? '등록 중...' : '문제 등록'}
          </button>
        </form>
      </div>
    </div>
  );
}