import { useState } from 'react';
import { createExam, createTestCase } from '../api/problemApi';
import './AdminCodingPage.css';

export default function AdminCodingPage() {
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [difficulty, setDifficulty] = useState('easy');

const [testInput, setTestInput] = useState('');
const [expectedOutput, setExpectedOutput] = useState('');
const [testCases, setTestCases] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddTestCase = () => {
    if (!testInput.trim() || !expectedOutput.trim()) {
      setMessage('테스트케이스 입력값과 기대 출력값을 모두 입력하세요.');
      return;
    }

    const newTestCase = {
      input: testInput,
      expectedOutput,
    };

    setTestCases((prev) => [...prev, newTestCase]);
    setTestInput('');
    setExpectedOutput('');
    setMessage('테스트케이스가 추가되었습니다.');
  };

  const handleRemoveTestCase = (index) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage('제목과 설명을 입력하세요.');
      return;
    }

    if (testCases.length === 0) {
      setMessage('최소 1개 이상의 테스트케이스를 추가하세요.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const createdExam = await createExam({
        title,
        description,
	difficulty,
      });

      const examId = createdExam.id;

      if (!examId) {
        throw new Error('문제 등록 후 examId를 받지 못했습니다.');
      }

      for (const tc of testCases) {
        await createTestCase({
          examId,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        });
      }

      setMessage('문제와 테스트케이스가 모두 등록되었습니다.');
      setTitle('');
      setDescription('');
      setDifficulty('easy');
      setTestInput('');
      setExpectedOutput('');
      setTestCases([]);
    } catch (err) {
      console.error(err);
      setMessage('문제 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admincodingpage">
      <div className="admincodingpage-inner">
        <h2 className="admincodingpage-title">코드형 문제 등록</h2>
        <p className="admincodingpage-subtitle">
          코드 작성형 문제와 테스트케이스를 함께 등록할 수 있습니다.
        </p>

        <form className="admincodingpage-form" onSubmit={handleSubmit}>
          <div className="admincodingpage-form-group">
            <label className="admincodingpage-label">문제 제목</label>
            <input
              type="text"
              className="admincodingpage-input"
              placeholder="예: 두 수의 합 구하기"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="admincodingpage-form-group">
            <label className="admincodingpage-label">문제 설명</label>
            <textarea
              className="admincodingpage-textarea"
              placeholder="예: 두 정수를 입력받아 합을 출력하시오"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
            />
          </div>

	<div className="admincodingpage-form-group">
 	 <label className="admincodingpage-label">난이도</label>
 	 <select
 	   className="admincodingpage-select"
  	   value={difficulty}
  	   onChange={(e) => setDifficulty(e.target.value)}
	  >
 	   <option value="easy">쉬움</option>
 	   <option value="medium">보통</option>
 	   <option value="hard">어려움</option>
	  </select>
	</div>

          <div className="admincodingpage-testcase-section">
            <h3 className="admincodingpage-testcase-title">테스트케이스 추가</h3>

            <div className="admincodingpage-form-group">
              <label className="admincodingpage-label">입력값</label>
              <textarea
                className="admincodingpage-textarea admincodingpage-testcase-textarea"
                placeholder={'예:\n1 2\n'}
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                rows={4}
              />
            </div>

            <div className="admincodingpage-form-group">
              <label className="admincodingpage-label">기대 출력값</label>
              <textarea
                className="admincodingpage-textarea admincodingpage-testcase-textarea"
                placeholder="예: 3"
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                rows={3}
              />
            </div>

            <button
              type="button"
              className="admincodingpage-add-btn"
              onClick={handleAddTestCase}
            >
              테스트케이스 추가
            </button>

            {testCases.length > 0 && (
              <div className="admincodingpage-testcase-list">
                <h4 className="admincodingpage-testcase-list-title">
                  추가된 테스트케이스 목록
                </h4>

                {testCases.map((tc, index) => (
                  <div key={index} className="admincodingpage-testcase-item">
                    <div className="admincodingpage-testcase-item-row">
                      <strong>입력값</strong>
                      <pre>{tc.input}</pre>
                    </div>

                    <div className="admincodingpage-testcase-item-row">
                      <strong>기대 출력값</strong>
                      <pre>{tc.expectedOutput}</pre>
                    </div>

                    <button
                      type="button"
                      className="admincodingpage-remove-btn"
                      onClick={() => handleRemoveTestCase(index)}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {message && <div className="admincodingpage-message">{message}</div>}

          <button
            className="admincodingpage-submit-btn"
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