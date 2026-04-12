import { useMemo } from 'react';
import { useProblem } from '../context/ProblemContext';
import './ResultsPage.css';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function ResultsPage() {
  const { problems } = useProblem();

const difficultyLabelMap = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
  쉬움: '쉬움',
  보통: '보통',
  어려움: '어려움',
};

  const resultList = useMemo(() => {
    return problems
      .map((problem) => {
        const submitted = sessionStorage.getItem(`solved-${problem.id}`) === 'true';
        const raw = sessionStorage.getItem(`result-${problem.id}`);
        const result = raw ? JSON.parse(raw) : null;

        return {
          ...problem,
          submitted,
          isCorrect: result?.isCorrect ?? false,
          errorType: result?.errorType ?? null,
          summary: result?.summary ?? '',
          wrongReason: result?.wrongReason ?? '',
          solutionDirection: result?.solutionDirection ?? '',
          improvement: result?.improvement ?? '',
        };
      })
      .filter((problem) => problem.submitted);
  }, [problems]);

  const stats = useMemo(() => {
    const total = resultList.length;
    const correct = resultList.filter((p) => p.isCorrect).length;

    const easy = resultList.filter((p) => p.difficulty === 'easy');
    const medium = resultList.filter((p) => p.difficulty === 'medium');
    const hard = resultList.filter((p) => p.difficulty === 'hard');

    const rate = (arr) =>
      arr.length === 0 ? 0 : Math.round((arr.filter((p) => p.isCorrect).length / arr.length) * 100);

    return {
      total,
      correct,
      overallRate: total === 0 ? 0 : Math.round((correct / total) * 100),
      easyRate: rate(easy),
      mediumRate: rate(medium),
      hardRate: rate(hard),
    };
  }, [resultList]);

  const lineChartData = [
  { name: '쉬움', rate: stats.easyRate },
  { name: '보통', rate: stats.mediumRate },
  { name: '어려움', rate: stats.hardRate },
];

const pieChartData = [
  { name: '정답', value: stats.correct },
  { name: '오답', value: stats.total - stats.correct },
];

const PIE_COLORS = ['#22c55e', '#ef4444'];

return (
  <div className="results-page">
    <div className="results-inner">
      <h2 className="results-title">결과 확인</h2>
      <p className="results-subtitle">제출한 문제와 AI 피드백을 확인할 수 있습니다.</p>

      <div className="results-summary">
        <div className="results-stat-card">
          <div className="results-stat-value">{stats.correct}/{stats.total}</div>
          <div className="results-stat-label">정답 / 제출</div>
        </div>

        <div className="results-stat-card">
          <div className="results-stat-value">{stats.overallRate}%</div>
          <div className="results-stat-label">전체 정답률</div>
        </div>
      </div>

      <div className="results-chart-grid">
        <div className="results-chart-card">
          <h3 className="results-section-title">난이도별 정답률 추이</h3>
          <div className="results-chart-inner">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis domain={[0, 100]} stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="results-chart-card">
          <h3 className="results-section-title">정답 / 오답 비율</h3>
          <div className="results-chart-inner">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="results-pie-legend">
              <div className="legend-item">
                <span className="legend-dot correct"></span>
                <span>정답 {stats.correct}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot wrong"></span>
                <span>오답 {stats.total - stats.correct}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="results-chart-box">
        <h3 className="results-section-title">난이도별 정답률</h3>

        <div className="bar-row">
          <span className="bar-label">쉬움</span>
          <div className="bar-track">
            <div className="bar-fill easy" style={{ width: `${stats.easyRate}%` }} />
          </div>
          <span className="bar-value">{stats.easyRate}%</span>
        </div>

        <div className="bar-row">
          <span className="bar-label">보통</span>
          <div className="bar-track">
            <div className="bar-fill medium" style={{ width: `${stats.mediumRate}%` }} />
          </div>
          <span className="bar-value">{stats.mediumRate}%</span>
        </div>

        <div className="bar-row">
          <span className="bar-label">어려움</span>
          <div className="bar-track">
            <div className="bar-fill hard" style={{ width: `${stats.hardRate}%` }} />
          </div>
          <span className="bar-value">{stats.hardRate}%</span>
        </div>
      </div>

      <div className="results-list">
        {resultList.length === 0 ? (
          <div className="results-empty">아직 제출한 문제가 없습니다.</div>
        ) : (
          resultList.map((item) => (
            <div key={item.id} className="result-card">
              <div className="result-card-header">
                <div>
                  <div className="result-problem-title">{item.title}</div>
                  <div className="result-meta">
                    난이도: {difficultyLabelMap[item.difficulty] || '쉬움'} · 오류유형: {item.errorType || '없음'}
                  </div>
                </div>

                <div className={`result-badge ${item.isCorrect ? 'correct' : 'wrong'}`}>
                  {item.isCorrect ? '정답' : '오답'}
                </div>
              </div>

              <div className="result-ai-box">
                <p><strong>요약:</strong> {item.summary || '-'}</p>
                <p><strong>오류 원인:</strong> {item.wrongReason || '-'}</p>
                <p><strong>해결 방향:</strong> {item.solutionDirection || '-'}</p>
                <p><strong>개선 피드백:</strong> {item.improvement || '-'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);
}