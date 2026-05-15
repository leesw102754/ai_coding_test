import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getExamsByCategory,
  getObjectiveQuestionsByCategoryId,
  getSubmissionsByStudentId,
} from '../api/problemApi';
import './ExamPage.css';
import { useAuth } from '../context/AuthContext';

const difficultyLabel = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
  쉬움: '쉬움',
  보통: '보통',
  어려움: '어려움',
};

const difficultyClass = {
  easy: 'tag-easy',
  medium: 'tag-medium',
  hard: 'tag-hard',
  쉬움: 'tag-easy',
  보통: 'tag-medium',
  어려움: 'tag-hard',
};

const formatDateTime = (value) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ExamPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
const [problems, setProblems] = useState([]);
const [objectiveQuestions, setObjectiveQuestions] = useState([]);
const [loading, setLoading] = useState(true);
const [solvedProblems, setSolvedProblems] = useState([]);
const [accessError, setAccessError] = useState(null);

  useEffect(() => {
const fetchProblems = async () => {
  try {
    setLoading(true);

    setAccessError(null);

    const [codingRes, objectiveData] = await Promise.all([
      getExamsByCategory(categoryId),
      getObjectiveQuestionsByCategoryId(categoryId),
    ]);

    const codingProblems = codingRes?.data || [];
    const objectiveProblems = objectiveData || [];

    const mappedProblems = codingProblems.map((problem, index) => ({
      ...problem,
      number: index + 1,
    }));

    setProblems(mappedProblems);
    setObjectiveQuestions(objectiveProblems);
} catch (err) {
  console.error('카테고리 문제 불러오기 실패:', err);

  const serverStatus = err.response?.data?.status;
  const serverMessage = err.response?.data?.message;

  if (serverStatus === 'BEFORE_EXAM') {
    setAccessError({
      title: '시험 시작 전입니다.',
      message: serverMessage || '아직 시험 시간이 시작되지 않았습니다.',
	detail: err.response?.data?.startTime
  	? `시작 시간: ${formatDateTime(err.response.data.startTime)}`
 	 : '',
    });
  } else if (serverStatus === 'EXAM_ENDED') {
    setAccessError({
      title: '시험이 종료되었습니다.',
      message: serverMessage || '이미 종료된 시험입니다.',
      detail: '',
    });
  } else {
    setAccessError({
      title: '문제 목록을 불러오지 못했습니다.',
      message: '백엔드 서버 또는 시험 폴더 정보를 확인하세요.',
      detail: '',
    });
  }

  setProblems([]);
  setObjectiveQuestions([]);
} finally {
    setLoading(false);
  }
};

    fetchProblems();
  }, [categoryId]);

  useEffect(() => {
  const fetchSolvedProblems = async () => {
    if (!user?.studentId) return;

    try {
      const submissions = await getSubmissionsByStudentId(
        user.studentId
      );

      const solvedIds = (submissions || []).map((item) =>
        Number(item.examId)
      );

      setSolvedProblems(solvedIds);
    } catch (err) {
      console.error('제출 기록 조회 실패:', err);
    }
  };

  fetchSolvedProblems();
}, [user?.studentId]);

  const stats = useMemo(() => {
    return {
      total: problems.length,
      easy: problems.filter(
        (p) => p.difficulty === 'easy' || p.difficulty === '쉬움'
      ).length,
      medium: problems.filter(
        (p) => p.difficulty === 'medium' || p.difficulty === '보통'
      ).length,
      hard: problems.filter(
        (p) => p.difficulty === 'hard' || p.difficulty === '어려움'
      ).length,
    };
  }, [problems]);

if (loading) {
  return (
    <div className="exam-page">
      <div className="exam-empty">문제 목록을 불러오는 중입니다...</div>
    </div>
  );
}

if (accessError) {
  return (
    <div className="exam-page">
      <div className="exam-empty">
        <h3>{accessError.title}</h3>
        <p>{accessError.message}</p>
        {accessError.detail && <p>{accessError.detail}</p>}

        <button className="btn-back" onClick={() => navigate('/')}>
          ← 시험 목록으로
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="exam-page">
      <div className="exam-layout">
        <aside className="exam-sidebar">
          <div className="exam-side-card">
            <h3>진행 현황</h3>
            <div className="exam-progress-row">
              <span>총 문제</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="exam-side-card">
            <h3>난이도별</h3>

            <div className="exam-difficulty-row">
              <span className="dot easy"></span>
              <span>쉬움</span>
              <strong>{stats.easy}</strong>
            </div>

            <div className="exam-difficulty-row">
              <span className="dot medium"></span>
              <span>보통</span>
              <strong>{stats.medium}</strong>
            </div>

            <div className="exam-difficulty-row">
              <span className="dot hard"></span>
              <span>어려움</span>
              <strong>{stats.hard}</strong>
            </div>
          </div>
        </aside>

        <main className="exam-main">
          <div className="exam-top">
            <button className="btn-back" onClick={() => navigate('/')}>
              ← 목록으로
            </button>

            <div className="exam-count">{stats.total}개 문제</div>
          </div>

          {problems.length === 0 ? (
            <div className="exam-empty">
              이 시험 폴더에 등록된 문제가 없습니다.
            </div>
          ) : (
            <div className="exam-problem-list">
{problems.map((problem) => {
  const isSolved = solvedProblems.includes(Number(problem.id));

  return (
    <div
      key={problem.id}
      className={`exam-problem-item ${
        isSolved ? 'solved' : ''
      }`}
    >
      <div className="exam-problem-left">
        <span className="exam-problem-number">
          {problem.number}
        </span>

        <div>
          <div className="exam-problem-title">
            {problem.title}

            {isSolved && (
              <span className="solved-badge">
                ✓ 완료
              </span>
            )}
          </div>

          <div className="exam-problem-meta">
            {problem.point ?? 0}점 · 제한시간{' '}
            {problem.timeLimit ?? 1000}ms
          </div>
        </div>
      </div>

      <div className="exam-problem-right">
        <span
          className={`difficulty-badge ${
            difficultyClass[problem.difficulty] || 'tag-easy'
          }`}
        >
          {difficultyLabel[problem.difficulty] || '쉬움'}
        </span>

<button
  type="button"
  className={`exam-start-btn ${isSolved ? 'solved-btn' : ''}`}
  onClick={(e) => {
    e.stopPropagation();

    if (isSolved) {
      navigate(`/results?categoryId=${categoryId}`);
      return;
    }

    navigate(`/problem/${problem.id}`, {
      state: { fromCategoryId: categoryId },
    });
  }}
>
  {isSolved ? '결과 보기' : '문제 풀기'}
</button>
      </div>
    </div>
  );
})}
            </div>
          )}

<div className="exam-objective-section">
  <div className="exam-section-header">
    <h3>객관식 문제</h3>
    <span>{objectiveQuestions.length}개 문제</span>
  </div>

  {objectiveQuestions.length === 0 ? (
    <div className="exam-empty-small">
      이 시험 폴더에 등록된 객관식 문제가 없습니다.
    </div>
  ) : (
    <div className="exam-objective-card">
      <div>
        <strong>객관식 문제 {objectiveQuestions.length}개</strong>
        <p>해당 시험 폴더의 객관식 문제를 풀이할 수 있습니다.</p>
      </div>

      <button
        type="button"
        className="exam-start-btn"
        onClick={() => navigate(`/objective-solve?categoryId=${categoryId}`)}
      >
        객관식 풀기
      </button>
    </div>
  )}
</div>
        </main>
      </div>
    </div>
  );
}