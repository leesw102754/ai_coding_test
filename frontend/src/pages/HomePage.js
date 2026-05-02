import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblem } from '../context/ProblemContext';
import { getAllSubmissions } from '../api/problemApi';
import './HomePage.css';

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

export default function HomePage() {
  const navigate = useNavigate();
  const { problems, fetchProblems, loading } = useProblem();

  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const savedUser = sessionStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  const currentStudentId =
    user?.studentId ||
    user?.loginId ||
    user?.username ||
    user?.id ||
    null;

  const fetchSubmissions = async () => {
    try {
      const data = await getAllSubmissions();
      setSubmissions(data || []);
    } catch (err) {
      console.error('제출 목록 조회 실패:', err);
      setSubmissions([]);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const mySubmissions = useMemo(() => {
    if (!currentStudentId) return [];

    return submissions.filter((s) => {
      return (
        String(s.studentId) === String(currentStudentId) ||
        String(s.userId) === String(currentStudentId) ||
        String(s.memberId) === String(currentStudentId)
      );
    });
  }, [submissions, currentStudentId]);

  const problemsWithStatus = useMemo(() => {
    return problems.map((p) => {
      const problemSubmissions = mySubmissions.filter(
        (s) => String(s.examId) === String(p.id)
      );

      const submitted = problemSubmissions.length > 0;

      const solved = problemSubmissions.some((s) => {
        return (s.correct ?? s.isCorrect ?? false) === true;
      });

      return {
        ...p,
        submitted,
        solved,
      };
    });
  }, [problems, mySubmissions]);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      await fetchProblems();
      await fetchSubmissions();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const computedStats = {
    total: problemsWithStatus.length,
    solved: problemsWithStatus.filter((p) => p.solved).length,
    submitted: problemsWithStatus.filter((p) => p.submitted).length,
    unsolved: problemsWithStatus.filter((p) => !p.submitted).length,
    easy: problemsWithStatus.filter(
      (p) => p.difficulty === 'easy' || p.difficulty === '쉬움'
    ).length,
    medium: problemsWithStatus.filter(
      (p) => p.difficulty === 'medium' || p.difficulty === '보통'
    ).length,
    hard: problemsWithStatus.filter(
      (p) => p.difficulty === 'hard' || p.difficulty === '어려움'
    ).length,
  };

  const filtered = problemsWithStatus.filter((p) => {
    const title = p.title || '';
    const tags = p.tags || [];

    const matchSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      tags.some((t) => String(t).toLowerCase().includes(search.toLowerCase()));

    const matchFilter =
      filter === 'all' ||
      (filter === 'easy' &&
        (p.difficulty === 'easy' || p.difficulty === '쉬움')) ||
      (filter === 'medium' &&
        (p.difficulty === 'medium' || p.difficulty === '보통')) ||
      (filter === 'hard' &&
        (p.difficulty === 'hard' || p.difficulty === '어려움')) ||
      (filter === 'solved' && p.solved) ||
      (filter === 'unsolved' && !p.submitted);

    return matchSearch && matchFilter;
  });

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-network">
            <svg className="network-svg" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
                </radialGradient>
              </defs>

              {[
                [100, 80], [200, 40], [320, 100], [450, 60], [560, 120], [680, 50], [750, 90],
                [150, 150], [280, 160], [400, 140], [520, 170], [640, 140],
              ].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="18" fill="url(#nodeGlow)" />
                  <circle cx={x} cy={y} r="5" fill="var(--accent-blue)" opacity="0.7" />
                </g>
              ))}

              {[
                [100, 80, 200, 40], [200, 40, 320, 100], [320, 100, 450, 60],
                [450, 60, 560, 120], [560, 120, 680, 50], [680, 50, 750, 90],
                [100, 80, 150, 150], [200, 40, 280, 160], [320, 100, 280, 160],
                [450, 60, 400, 140], [560, 120, 520, 170], [680, 50, 640, 140],
                [280, 160, 400, 140], [400, 140, 520, 170], [520, 170, 640, 140],
              ].map(([x1, y1, x2, y2], i) => (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--accent-blue)"
                  strokeOpacity="0.2"
                  strokeWidth="1"
                />
              ))}
            </svg>
          </div>

          <h1 className="hero-title">코딩테스트 플랫폼</h1>
          <p className="hero-subtitle">팀 내부 코딩테스트 · 알고리즘 역량 평가</p>
        </div>
      </section>

      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-heading">진행 현황</h3>

            <div className="progress-item">
              <span className="progress-label">푼 문제</span>
              <span className="progress-value">
                <span className="progress-solved">{computedStats.submitted}</span>
                <span className="progress-sep"> / </span>
                <span>{computedStats.total}</span>
              </span>
            </div>

            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${
                    computedStats.total > 0
                      ? (computedStats.submitted / computedStats.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-heading">난이도별</h3>

            <div className="diff-list">
              <div className="diff-item" onClick={() => setFilter('easy')}>
                <span className="diff-dot dot-easy" />
                <span className="diff-name">쉬움</span>
                <span className="diff-count">{computedStats.easy}</span>
              </div>

              <div className="diff-item" onClick={() => setFilter('medium')}>
                <span className="diff-dot dot-medium" />
                <span className="diff-name">보통</span>
                <span className="diff-count">{computedStats.medium}</span>
              </div>

              <div className="diff-item" onClick={() => setFilter('hard')}>
                <span className="diff-dot dot-hard" />
                <span className="diff-name">어려움</span>
                <span className="diff-count">{computedStats.hard}</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-heading">통계</h3>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{computedStats.solved}</div>
                <div className="stat-label">정답</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{computedStats.total}</div>
                <div className="stat-label">전체</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-value">
                  {computedStats.total > 0
                    ? Math.round((computedStats.solved / computedStats.total) * 100)
                    : 0}
                  %
                </div>
                <div className="stat-label">정답률</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{computedStats.unsolved}</div>
                <div className="stat-label">미해결</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="problem-area">
          <div className="problem-toolbar">
            <div className="search-box">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                type="text"
                placeholder="문제 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              {['all', 'easy', 'medium', 'hard', 'solved', 'unsolved'].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all'
                    ? '전체'
                    : f === 'easy'
                    ? '쉬움'
                    : f === 'medium'
                    ? '보통'
                    : f === 'hard'
                    ? '어려움'
                    : f === 'solved'
                    ? '정답'
                    : '미제출'}
                </button>
              ))}
            </div>

            <span className="problem-count">{filtered.length}개 문제</span>

<button
  type="button"
  className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
  onClick={handleRefresh}
  disabled={isRefreshing}
  title="새로고침"
>
  <svg
    className="refresh-icon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 2v6h-6" />
    <path d="M3 11a9 9 0 0 1 15.55-5.36L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 13a9 9 0 0 1-15.55 5.36L3 16" />
  </svg>
</button>
          </div>

          <div className="problem-list">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              filtered.map((problem) => (
                <div
                  key={problem.id}
                  className={`problem-item ${problem.submitted ? 'solved' : ''}`}
                  onClick={() => navigate(`/problem/${problem.id}`)}
                >
                  <div className="problem-left">
                    <div className={`solve-indicator ${problem.submitted ? 'solved' : ''}`}>
                      {problem.submitted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : null}
                    </div>

                    <span className="problem-number">{problem.number}</span>
                    <span className="problem-title">{problem.title}</span>
                  </div>

                  <div className="problem-right">
                    <div className="problem-tags">
                      {(problem.tags || []).map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>

                    <span className={`difficulty-badge ${difficultyClass[problem.difficulty] || 'tag-easy'}`}>
                      {difficultyLabel[problem.difficulty] || '쉬움'}
                    </span>

                    <span className="time-limit">{problem.timeLimit}ms</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}