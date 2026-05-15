import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblem } from '../context/ProblemContext';
import {
  getAllSubmissions,
  getCategories,
} from '../api/problemApi';
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

const isTutorialCategory = (category) => {
  return String(category?.title || '').includes('튜토리얼');
};

const tutorialGuideCategory = {
  id: 'tutorial-guide',
  title: '튜토리얼 사용법',
  isTutorialGuide: true,
};

const examMonitorGuideCategory = {
  id: 'exam-monitor-guide',
  title: '시험 운영 관리',
  isExamMonitorGuide: true,
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
  const isAdmin = user?.role === 'ADMIN';

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const currentStudentId =
    user?.studentId ||
    user?.loginId ||
    user?.username ||
    user?.id ||
    null;




useEffect(() => {
  fetchProblems();
  fetchSubmissions();
}, []);

  const fetchSubmissions = async () => {
    try {
      const data = await getAllSubmissions();
      setSubmissions(data || []);
    } catch (err) {
      console.error('제출 목록 조회 실패:', err);
      setSubmissions([]);
    }
  };

  

const fetchCategoriesData = async () => {
  try {
    const data = await getCategories();
    setCategories(data);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchCategoriesData();
}, []);

const visibleCategories = useMemo(() => {
  const normalCategories = categories.filter(
    (cat) => !isTutorialCategory(cat)
  );

  if (!isAdmin) {
    return normalCategories;
  }

  return [tutorialGuideCategory, examMonitorGuideCategory, ...normalCategories];
}, [categories, isAdmin]);

const filteredCategories = visibleCategories.filter((cat) =>
  String(cat.title || '').toLowerCase().includes(search.toLowerCase())
);

const mySubmissions = useMemo(() => {
  return submissions.filter((s) => {
    return (
      String(s.studentId) === String(user?.studentId) ||
      String(s.userId) === String(user?.id) ||
      String(s.memberId) === String(user?.id)
    );
  });
}, [submissions, user]);

const categoryStats = useMemo(() => {
  return categories
    .filter((cat) => !isTutorialCategory(cat))
    .map((cat) => {
    const categoryProblems = problems.filter(
      (p) => String(p.categoryId) === String(cat.id)
    );

    const totalProblems = categoryProblems.length;

    const solvedCount = categoryProblems.filter((problem) => {
      return mySubmissions.some(
        (s) =>
          String(s.examId) === String(problem.id) &&
          (s.correct ?? s.isCorrect) === true
      );
    }).length;

    const submittedCount = categoryProblems.filter((problem) => {
      return mySubmissions.some(
        (s) => String(s.examId) === String(problem.id)
      );
    }).length;

    return {
      ...cat,
      totalProblems,
      solvedCount,
      submittedCount,
      completed:
        totalProblems > 0 &&
        solvedCount === totalProblems,
    };
  });
}, [categories, problems, mySubmissions]);


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
    await fetchCategoriesData();
    await fetchSubmissions();    // 기존 그대로
  } finally {
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }
};

const computedStats = {
  totalExams: categoryStats.length,

  completedExams: categoryStats.filter(
    (c) => c.completed
  ).length,

  inProgressExams: categoryStats.filter(
    (c) =>
      c.submittedCount > 0 &&
      !c.completed
  ).length,

  totalSolvedProblems: categoryStats.reduce(
    (sum, c) => sum + c.solvedCount,
    0
  ),

  totalProblems: categoryStats.reduce(
    (sum, c) => sum + c.totalProblems,
    0
  ),

  totalSubmissions: mySubmissions.length,
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
              <span className="progress-label">
                완료 시험
              </span>

              <span className="progress-value">
                <span className="progress-solved">
                  {computedStats.completedExams}
                </span>

                <span className="progress-sep"> / </span>

                <span>
                  {computedStats.totalExams}
                </span>
              </span>
            </div>

            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${
                    computedStats.totalExams > 0
                      ? (
                          computedStats.completedExams /
                          computedStats.totalExams
                        ) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
            <div className="sidebar-section">
              <h3 className="sidebar-heading">통계</h3>

              <div className="stats-summary">
                <div className="stats-summary-item">
                  
                  <div className="stats-summary-value">
                    {computedStats.completedExams}
                  </div>
                  <div className="stats-summary-label">
                    완료 시험
                  </div>
                </div>

                <div className="stats-summary-item">
                  <div className="stats-summary-value">
                    {computedStats.totalExams}
                  </div>
                  <div className="stats-summary-label">
                    전체 시험
                  </div>
                </div>

                <div className="stats-summary-item">
                  <div className="stats-summary-value">
                    {computedStats.totalSolvedProblems}
                  </div>
                  <div className="stats-summary-label">
                    푼 문제
                  </div>
                </div>

                <div className="stats-summary-item">
                  <div className="stats-summary-value">
                    {computedStats.totalSubmissions}
                  </div>
                  <div className="stats-summary-label">
                    전체 제출
                  </div>
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
                placeholder="시험 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              {['all', 'solved', 'unsolved'].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all'
 		 ? '전체'
  		: f === 'solved'
 		 ? '완료'
  		: '미제출'}
                </button>
              ))}
            </div>

            <span className="problem-count">{filteredCategories.length}개 시험</span>

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
            {filteredCategories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isTutorialGuide = cat.isTutorialGuide === true;
		const isExamMonitorGuide = cat.isExamMonitorGuide === true;

                const stat = categoryStats.find(
                  (c) => String(c.id) === String(cat.id)
                );

                return (
                  <div
                    key={cat.id}
className={`problem-item ${
  isTutorialGuide ? 'tutorial-guide-item' : ''
} ${
  isExamMonitorGuide ? 'monitor-guide-item' : ''
}`}
onClick={() =>
  isTutorialGuide
    ? navigate('/tutorial')
    : isExamMonitorGuide
    ? navigate('/admin/exam-monitor')
    : navigate(`/exam/${cat.id}`)
}
                  >
                    <div className="problem-left">
                      <span className="problem-title">
                        {cat.title}

                        {isTutorialGuide && (
                          <span className="tutorial-only-badge">
                            관리자 전용
                          </span>
                        )}

                        {!isTutorialGuide && stat?.completed && (
                          <span className="completed-badge">
                            ✓ 완료
                          </span>
                        )}
                      </span>

{isTutorialGuide ? (
  <>
    <div className="category-progress-text">
      문제 생성, 테스트케이스 관리, 객관식 출제, 결과 분석 사용법 안내
    </div>

    <div className="tutorial-guide-desc">
      클릭하면 관리자용 사이트 사용 방법을 확인할 수 있습니다.
    </div>
  </>
) : isExamMonitorGuide ? (
  <>
    <div className="category-progress-text">
      시험 폴더별 시작/종료 통제와 학생 이탈 알림 확인
    </div>

    <div className="tutorial-guide-desc">
      클릭하면 시험 운영 관리 화면으로 이동합니다.
    </div>
  </>
) : (
                        <>
                          <div className="category-progress-text">
                            {stat?.solvedCount ?? 0} / {stat?.totalProblems ?? 0} 문제 완료
                          </div>

                          <div className="category-progress-bar">
                            <div
                              className="category-progress-fill"
                              style={{
                                width: `${
                                  stat?.totalProblems > 0
                                    ? (stat.solvedCount / stat.totalProblems) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="problem-right">
                      <span
                        className={`difficulty-badge ${
  			isTutorialGuide
    			? 'tutorial-start-badge'
    			: isExamMonitorGuide
    			? 'monitor-start-badge'
    			: 'tag-easy'
			}`}
                      >
                        {isTutorialGuide
  			? '사용법 보기'
  			: isExamMonitorGuide
  			? '운영 관리'
  			: '시험 시작'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}