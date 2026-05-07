import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getExamsByCategory,
  getObjectiveQuestionsByCategoryId,
} from '../api/problemApi';
import './ExamPage.css';

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

export default function ExamPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [objectiveQuestions, setObjectiveQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
const fetchProblems = async () => {
  try {
    setLoading(true);

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
    setProblems([]);
    setObjectiveQuestions([]);
  } finally {
    setLoading(false);
  }
};

    fetchProblems();
  }, [categoryId]);

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
              {problems.map((problem) => (
		<div
  			key={problem.id}
  			className="exam-problem-item"
		>
                  <div className="exam-problem-left">
                    <span className="exam-problem-number">
                      {problem.number}
                    </span>

                    <div>
                      <div className="exam-problem-title">
                        {problem.title}
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
  		className="exam-start-btn"
  		onClick={(e) => {
    		e.stopPropagation();
    		navigate(`/problem/${problem.id}`, {
      		state: { fromCategoryId: categoryId },
    		});
  		}}
		>
  		문제 풀기
		</button>
                  </div>
                </div>
              ))}
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