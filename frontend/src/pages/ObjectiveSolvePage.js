import { useEffect, useMemo, useState } from 'react';
import {
  getCategories,
  getObjectiveQuestionsByCategoryId,
  submitObjectiveAnswer,
} from '../api/problemApi';
import './ObjectiveSolvePage.css';

export default function ObjectiveSolvePage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const [studentId, setStudentId] = useState('2026001');
  const [studentName, setStudentName] = useState('이승욱');

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [message, setMessage] = useState('');

  const selectedCategoryTitle = useMemo(() => {
    const found = categories.find(
      (category) => String(category.id) === String(selectedCategoryId)
    );
    return found?.title || '객관식 문제';
  }, [categories, selectedCategoryId]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      const list = data || [];
      setCategories(list);

      if (list.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(String(list[0].id));
      }
    } catch (err) {
      console.error('카테고리 조회 실패:', err);
      setCategories([]);
    }
  };

  const loadQuestions = async (categoryId) => {
    if (!categoryId) {
      setQuestions([]);
      return;
    }

    try {
      const data = await getObjectiveQuestionsByCategoryId(categoryId);
      setQuestions(data || []);
      setAnswers({});
      setResults({});
      setMessage('');
    } catch (err) {
      console.error('객관식 문제 조회 실패:', err);
      setQuestions([]);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadQuestions(selectedCategoryId);
  }, [selectedCategoryId]);

  const handleSelectAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: Number(value),
    }));
  };

  const handleSubmitOne = async (question) => {
    if (!studentId.trim() || !studentName.trim()) {
      setMessage('학번과 이름을 입력하세요.');
      return;
    }

    const selectedAnswer = answers[question.id];

    if (!selectedAnswer) {
      setMessage('정답을 선택하세요.');
      return;
    }

    try {
      setMessage('');

      const result = await submitObjectiveAnswer({
        studentId: studentId.trim(),
        studentName: studentName.trim(),
        categoryId: Number(selectedCategoryId),
        questionId: question.id,
        selectedAnswer,
      });

      if (result.duplicated) {
        setMessage(result.message || '이미 제출한 문제입니다.');
        return;
      }

      setResults((prev) => ({
        ...prev,
        [question.id]: result,
      }));

      setMessage('객관식 답안을 제출했습니다.');
    } catch (err) {
      console.error('객관식 제출 실패:', err);
      setMessage(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          '객관식 제출에 실패했습니다.'
      );
    }
  };

  return (
    <div className="objective-solve-page">
      <div className="objective-solve-container">
        <header className="objective-solve-header">
          <div>
            <h1>객관식 문제 풀이</h1>
            <p>시험 폴더의 객관식 문제를 풀고 제출할 수 있습니다.</p>
          </div>
        </header>

        <section className="objective-solve-control-card">
          <div className="objective-solve-grid">
            <div className="objective-solve-field">
              <label>시험 폴더</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                {categories.length === 0 ? (
                  <option value="">등록된 폴더가 없습니다</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="objective-solve-field">
              <label>학번</label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="objective-solve-field">
              <label>이름</label>
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
          </div>
        </section>

        {message && <div className="objective-solve-message">{message}</div>}

        <section className="objective-solve-list">
          <h2>{selectedCategoryTitle}</h2>

          {questions.length === 0 ? (
            <div className="objective-solve-empty">
              등록된 객관식 문제가 없습니다.
            </div>
          ) : (
            questions.map((question, index) => {
              const result = results[question.id];

              return (
                <article key={question.id} className="objective-question-card">
                  <div className="objective-question-top">
                    <div>
                      <span className="objective-question-number">
                        문제 {index + 1}
                      </span>
                      <h3>{question.title}</h3>
                    </div>

                    <span className="objective-question-point">
                      {question.point}점
                    </span>
                  </div>

                  <p className="objective-question-description">
                    {question.description}
                  </p>

                  <div className="objective-choice-list">
                    {[1, 2, 3, 4].map((num) => (
                      <label
                        key={num}
                        className={`objective-choice-item ${
                          answers[question.id] === num ? 'selected' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={`objective-${question.id}`}
                          value={num}
                          checked={answers[question.id] === num}
                          onChange={(e) =>
                            handleSelectAnswer(question.id, e.target.value)
                          }
                          disabled={!!result}
                        />
                        <span>{num}. {question[`choice${num}`]}</span>
                      </label>
                    ))}
                  </div>

                  {result && (
                    <div
                      className={`objective-result-box ${
                        result.correct ? 'correct' : 'wrong'
                      }`}
                    >
                      <strong>
                        {result.correct ? '정답입니다.' : '오답입니다.'}
                      </strong>
                      <p>획득 점수: {result.earnedPoint}점</p>
                      <p>정답: 보기 {result.correctAnswer}</p>
                      {result.explanation && (
                        <p>해설: {result.explanation}</p>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    className="objective-submit-btn"
                    onClick={() => handleSubmitOne(question)}
                    disabled={!!result}
                  >
                    {result ? '제출 완료' : '답안 제출'}
                  </button>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}