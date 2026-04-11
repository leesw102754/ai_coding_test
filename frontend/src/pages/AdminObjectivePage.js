import { useState } from 'react';
import './AdminObjectivePage.css';

export default function AdminObjectivePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !description.trim() ||
      !option1.trim() ||
      !option2.trim() ||
      !option3.trim() ||
      !option4.trim() ||
      !answer
    ) {
      setMessage('모든 항목을 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // 나중에 API 연결
      console.log({
        title,
        description,
        options: [option1, option2, option3, option4],
        answer,
      });

      setMessage('객관식 문제 등록 틀이 준비되었습니다.');
      setTitle('');
      setDescription('');
      setOption1('');
      setOption2('');
      setOption3('');
      setOption4('');
      setAnswer('');
    } catch (err) {
      console.error(err);
      setMessage('문제 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminobjectivepage">
      <div className="adminobjectivepage-inner">
        <h2 className="adminobjectivepage-title">객관식 문제 등록</h2>
        <p className="adminobjectivepage-subtitle">
          객관식 문제를 등록할 수 있습니다.
        </p>

        <form className="adminobjectivepage-form" onSubmit={handleSubmit}>
          <div className="adminobjectivepage-form-group">
            <label className="adminobjectivepage-label">문제 제목</label>
            <input
              type="text"
              className="adminobjectivepage-input"
              placeholder="예: Java 기초 문법 1번"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="adminobjectivepage-form-group">
            <label className="adminobjectivepage-label">문제 설명</label>
            <textarea
              className="adminobjectivepage-textarea"
              placeholder="예: 다음 중 자바의 기본 자료형이 아닌 것은?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </div>

          <div className="adminobjectivepage-options-wrap">
            <div className="adminobjectivepage-form-group">
              <label className="adminobjectivepage-label">보기 1</label>
              <input
                type="text"
                className="adminobjectivepage-input"
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
              />
            </div>

            <div className="adminobjectivepage-form-group">
              <label className="adminobjectivepage-label">보기 2</label>
              <input
                type="text"
                className="adminobjectivepage-input"
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
              />
            </div>

            <div className="adminobjectivepage-form-group">
              <label className="adminobjectivepage-label">보기 3</label>
              <input
                type="text"
                className="adminobjectivepage-input"
                value={option3}
                onChange={(e) => setOption3(e.target.value)}
              />
            </div>

            <div className="adminobjectivepage-form-group">
              <label className="adminobjectivepage-label">보기 4</label>
              <input
                type="text"
                className="adminobjectivepage-input"
                value={option4}
                onChange={(e) => setOption4(e.target.value)}
              />
            </div>
          </div>

          <div className="adminobjectivepage-form-group">
            <label className="adminobjectivepage-label">정답 선택</label>
            <select
              className="adminobjectivepage-select"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            >
              <option value="">정답을 선택하세요</option>
              <option value="1">보기 1</option>
              <option value="2">보기 2</option>
              <option value="3">보기 3</option>
              <option value="4">보기 4</option>
            </select>
          </div>

          {message && <div className="adminobjectivepage-message">{message}</div>}

          <button
            className="adminobjectivepage-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? '등록 중...' : '문제 등록'}
          </button>
        </form>
      </div>
    </div>
  );
}