import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCategories,
  getExamsByCategory,
  getObjectiveQuestionsByCategoryId,
  getObjectiveSubmissionsByStudentId,
  submitObjectiveAnswer,
} from '../api/problemApi';
import './ObjectiveSolvePage.css';

export default function ObjectiveSolvePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryIdFromUrl = searchParams.get('categoryId');
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categoryIdFromUrl || ''
  );

  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);

  useEffect(() => {
    if (user?.studentId) {
      setStudentId(user.studentId);
    }

    if (user?.name || user?.username) {
      setStudentName(user.name || user.username);
    }
  }, [user]);

  const selectedCategoryTitle = useMemo(() => {
    const found = categories.find(
      (category) => String(category.id) === String(selectedCategoryId)
    );

    return found?.title || '객관식 문제';
  }, [categories, selectedCategoryId]);

  const answeredCount = questions.filter(
    (question) => answers[question.id]
  ).length;

  const allAnswered =
    questions.length > 0 && answeredCount === questions.length;

  const allSubmitted =
    questions.length > 0 &&
    questions.every((question) => results[question.id]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      const list = data || [];

      setCategories(list);

      if (categoryIdFromUrl) {
        setSelectedCategoryId(String(categoryIdFromUrl));
      } else if (list.length > 0 && !selectedCategoryId) {
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
    setAnswers({});
    setResults({});
    return;
  }

  try {
    await getExamsByCategory(categoryId);

    const [questionData, submissionData] = await Promise.all([
      getObjectiveQuestionsByCategoryId(categoryId),
      studentId.trim()
        ? getObjectiveSubmissionsByStudentId(studentId.trim())
        : Promise.resolve([]),
    ]);

    const questionList = questionData || [];
    const questionIdSet = new Set(
      questionList.map((question) => String(question.id))
    );

    const previousSubmissions = (submissionData || []).filter((submission) =>
      questionIdSet.has(String(submission.questionId))
    );

    const nextAnswers = {};
    const nextResults = {};

    previousSubmissions.forEach((submission) => {
      const questionId = submission.questionId;

      nextAnswers[questionId] = Number(submission.selectedAnswer);

      nextResults[questionId] = {
        ...submission,
        correct:
          submission.correct === true ||
          submission.isCorrect === true ||
          String(submission.correct).toLowerCase() === 'true',
      };
    });

    setQuestions(questionList);
    setAnswers(nextAnswers);
    setResults(nextResults);
    setMessage('');
} catch (err) {
  console.error('객관식 문제/제출 조회 실패:', err);

  const serverStatus = err.response?.data?.status;
  const serverMessage = err.response?.data?.message;

  setQuestions([]);
  setAnswers({});
  setResults({});

  if (serverStatus === 'BEFORE_EXAM') {
    setMessage(serverMessage || '아직 시험 시작 전입니다.');

    setTimeout(() => {
      navigate('/');
    }, 500);

    return;
  }

  if (serverStatus === 'EXAM_ENDED') {
    setMessage(serverMessage || '이미 종료된 시험입니다.');

    setTimeout(() => {
      navigate(`/results?categoryId=${categoryId}`);
    }, 500);

    return;
  }

  setMessage('객관식 문제를 불러오지 못했습니다.');
}
};

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

useEffect(() => {
  loadQuestions(selectedCategoryId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedCategoryId, studentId]);

  const handleSelectAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: Number(value),
    }));
  };

  const handleSubmitAll = async () => {
    if (!studentId.trim() || !studentName.trim()) {
      setMessage('학번과 이름을 입력하세요.');
      return;
    }

    if (questions.length === 0) {
      setMessage('제출할 객관식 문제가 없습니다.');
      return;
    }

    const unanswered = questions.filter((question) => !answers[question.id]);

    if (unanswered.length > 0) {
      setMessage(`아직 선택하지 않은 문제가 ${unanswered.length}개 있습니다.`);
      return;
    }

    try {
      setIsSubmittingAll(true);
      setMessage('');

      const submitTargets = questions.filter(
        (question) => !results[question.id]
      );

      if (submitTargets.length === 0) {
        setMessage('이미 모든 객관식 문제를 제출했습니다.');
        return;
      }

      const submitResults = await Promise.all(
        submitTargets.map((question) =>
          submitObjectiveAnswer({
            studentId: studentId.trim(),
            studentName: studentName.trim(),
            categoryId: Number(selectedCategoryId),
            questionId: question.id,
            selectedAnswer: answers[question.id],
          })
        )
      );

      const nextResults = {};

      submitTargets.forEach((question, index) => {
        nextResults[question.id] = submitResults[index];
      });

      setResults((prev) => ({
        ...prev,
        ...nextResults,
      }));

      setMessage('객관식 답안을 전체 제출했습니다.');
    } catch (err) {
      console.error('객관식 전체 제출 실패:', err);

      setMessage(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          '객관식 전체 제출에 실패했습니다.'
      );
    } finally {
      setIsSubmittingAll(false);
    }
  };

  return (
    <div className="objective-solve-page">
      <div className="objective-solve-container">
<header className="objective-solve-header objective-solve-header-row">
  <div>
    <h1>객관식 문제 풀이</h1>
    <p>시험 폴더의 객관식 문제를 풀고 제출할 수 있습니다.</p>
  </div>

  <button
    type="button"
    className="objective-back-btn"
    onClick={() => {
      if (selectedCategoryId) {
        navigate(`/exam/${selectedCategoryId}`);
      } else {
        navigate('/');
      }
    }}
  >
    ← 시험 목록으로
  </button>
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
          <div className="objective-solve-list-header">
            <div>
              <h2>{selectedCategoryTitle}</h2>
              <p>
                선택 완료: {answeredCount}/{questions.length}
              </p>
            </div>

            <button
              type="button"
              className="objective-submit-all-btn"
              onClick={handleSubmitAll}
              disabled={!allAnswered || allSubmitted || isSubmittingAll}
            >
              {allSubmitted
                ? '전체 제출 완료'
                : isSubmittingAll
                ? '전체 제출 중...'
                : '전체 제출'}
            </button>
          </div>

	{allSubmitted && (
  <button
    type="button"
    className="objective-submit-all-btn"
    onClick={() => navigate(`/results?categoryId=${selectedCategoryId}`)}
  >
    결과 확인
  </button>
)}

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
                        <span>
                          {num}. {question[`choice${num}`]}
                        </span>
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
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}