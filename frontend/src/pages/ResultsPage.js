import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getSubmissionsByStudentId,
  getObjectiveQuestions,
  getObjectiveSubmissions,
} from '../api/problemApi';
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

const { user } = useAuth();
const [mySubmissions, setMySubmissions] = useState([]);
const [objectiveQuestions, setObjectiveQuestions] = useState([]);
const [myObjectiveSubmissions, setMyObjectiveSubmissions] = useState([]);
const [loadingResults, setLoadingResults] = useState(true);
useEffect(() => {
  const fetchMySubmissions = async () => {
    if (!user?.studentId) {
      setMySubmissions([]);
      setObjectiveQuestions([]);
      setMyObjectiveSubmissions([]);
      setLoadingResults(false);
      return;
    }

    try {
      setLoadingResults(true);

const [codingData, objectiveQuestionData, objectiveSubmissionData] =
  await Promise.all([
    getSubmissionsByStudentId(user.studentId),
    getObjectiveQuestions(),
    getObjectiveSubmissions(),
  ]);

const filteredObjectiveSubmissions = (objectiveSubmissionData || []).filter(
  (item) => {
    const sameStudentId =
      String(item.studentId || '').trim() === String(user?.studentId || '').trim();

    const sameName =
      String(item.studentName || '').trim() === String(user?.name || '').trim();

    return sameStudentId || sameName;
  }
);

setMySubmissions(codingData || []);
setObjectiveQuestions(objectiveQuestionData || []);
setMyObjectiveSubmissions(filteredObjectiveSubmissions);

    } catch (err) {
      console.error('내 제출 결과 조회 실패:', err);
      setMySubmissions([]);
      setObjectiveQuestions([]);
      setMyObjectiveSubmissions([]);
    } finally {
      setLoadingResults(false);
    }
  };

  fetchMySubmissions();
}, [user?.studentId]);
  const { problems } = useProblem();

 const difficultyLabelMap = {
   easy: '쉬움',
   medium: '보통',
   hard: '어려움',
  쉬움: '쉬움',
  보통: '보통',
  어려움: '어려움',
  };

const problemMap = useMemo(() => {
  const map = new Map();

  problems.forEach((problem) => {
    map.set(String(problem.id), problem);
  });

  return map;
}, [problems]);

const resultList = useMemo(() => {
  return mySubmissions.map((submission) => {
    const problem = problemMap.get(String(submission.examId));

    const isCorrect =
      submission.correct === true ||
      submission.isCorrect === true ||
      submission.status === 'accepted' ||
      String(submission.correct).toLowerCase() === 'true';

    const point = Number(
      problem?.point ??
      submission.point ??
      submission.maxPoint ??
      submission.earnedPoint ??
      0
    );

    const earnedPoint = Number(
      submission.earnedPoint ?? (isCorrect ? point : 0)
    );

    return {
      id: submission.id,
      examId: submission.examId,
      title: problem?.title || `코딩 문제 ${submission.examId}`,
      description: problem?.description || '',
      difficulty: problem?.difficulty || 'easy',
      submitted: true,
      isCorrect,
      point,
      earnedPoint,
      errorType: submission.status ?? null,
      summary: submission.aiSummary ?? '',
      wrongReason: submission.aiWrongReason ?? '',
      solutionDirection: submission.aiSolutionDirection ?? '',
      improvement: submission.aiImprovement ?? '',
      submitTime: submission.submitTime ?? null,
    };
  });
}, [mySubmissions, problemMap]);

const objectiveQuestionMap = useMemo(() => {
  const map = new Map();

  objectiveQuestions.forEach((question) => {
    map.set(String(question.id), question);
  });

  return map;
}, [objectiveQuestions]);

const objectiveResultList = useMemo(() => {
  return myObjectiveSubmissions.map((submission) => {
    const question = objectiveQuestionMap.get(String(submission.questionId));

    const isCorrect =
      submission.correct === true ||
      submission.isCorrect === true ||
      String(submission.correct).toLowerCase() === 'true';

    const point = Number(question?.point ?? submission.point ?? 0);
    const earnedPoint = Number(
      submission.earnedPoint ?? (isCorrect ? point : 0)
    );

    return {
      id: submission.id,
      questionId: submission.questionId,
      title: question?.title || `객관식 문제 ${submission.questionId}`,
      description: question?.description || '',
      difficulty: question?.difficulty || 'easy',
      point,
      earnedPoint,
      isCorrect,
      selectedAnswer: submission.selectedAnswer,
      correctAnswer: submission.correctAnswer,
      explanation: question?.explanation || '',
      submitTime: submission.submitTime,
    };
  });
}, [myObjectiveSubmissions, objectiveQuestionMap]);

const stats = useMemo(() => {
  const codingTotal = resultList.length;
  const codingCorrect = resultList.filter((p) => p.isCorrect).length;

  const objectiveTotal = objectiveResultList.length;
  const objectiveCorrect = objectiveResultList.filter((p) => p.isCorrect).length;

  const total = codingTotal + objectiveTotal;
  const correct = codingCorrect + objectiveCorrect;

  const codingScore = resultList.reduce(
    (sum, p) => sum + Number(p.earnedPoint ?? 0),
    0
  );

  const objectiveScore = objectiveResultList.reduce(
    (sum, p) => sum + Number(p.earnedPoint ?? 0),
    0
  );

const codingMaxScore =
  problems.length > 0
    ? problems.reduce((sum, p) => sum + Number(p.point ?? 0), 0)
    : resultList.reduce((sum, p) => sum + Number(p.point ?? 0), 0);

  const objectiveMaxScore = objectiveQuestions.reduce(
    (sum, p) => sum + Number(p.point ?? 0),
    0
  );

  const totalScore = codingScore + objectiveScore;
  const maxScore = codingMaxScore + objectiveMaxScore;

  const allResults = [...resultList, ...objectiveResultList];

  const easy = allResults.filter(
    (p) => p.difficulty === 'easy' || p.difficulty === '쉬움'
  );
  const medium = allResults.filter(
    (p) => p.difficulty === 'medium' || p.difficulty === '보통'
  );
  const hard = allResults.filter(
    (p) => p.difficulty === 'hard' || p.difficulty === '어려움'
  );

  const rate = (arr) =>
    arr.length === 0
      ? 0
      : Math.round(
          (arr.filter((p) => p.isCorrect).length / arr.length) * 100
        );

  return {
    total,
    correct,

    codingTotal,
    codingCorrect,
    codingScore,
    codingMaxScore,

    objectiveTotal,
    objectiveCorrect,
    objectiveScore,
    objectiveMaxScore,

    totalScore,
    maxScore,

    scoreRate: maxScore === 0 ? 0 : Math.round((totalScore / maxScore) * 100),
    overallRate: total === 0 ? 0 : Math.round((correct / total) * 100),
    easyRate: rate(easy),
    mediumRate: rate(medium),
    hardRate: rate(hard),
  };
}, [resultList, objectiveResultList, problems, objectiveQuestions]);
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

if (loadingResults) {
  return (
    <div className="results-page">
      <div className="results-inner">
        <div className="results-empty">제출 결과를 불러오는 중입니다...</div>
      </div>
    </div>
  );
}

return (
  <div className="results-page">
    <div className="results-inner">
      <h2 className="results-title">결과 확인</h2>
      <p className="results-subtitle">제출한 문제와 AI 피드백을 확인할 수 있습니다.</p>

<div className="results-summary">
  <div className="results-stat-card">
    <div className="results-stat-value">{stats.correct}/{stats.total}</div>
    <div className="results-stat-label">전체 정답 / 제출</div>
  </div>

  <div className="results-stat-card">
    <div className="results-stat-value">
      {stats.codingScore}/{stats.codingMaxScore}
    </div>
    <div className="results-stat-label">코딩 점수</div>
  </div>

  <div className="results-stat-card">
    <div className="results-stat-value">
      {stats.objectiveScore}/{stats.objectiveMaxScore}
    </div>
    <div className="results-stat-label">객관식 점수</div>
  </div>

  <div className="results-stat-card">
    <div className="results-stat-value">
      {stats.totalScore}/{stats.maxScore}
    </div>
    <div className="results-stat-label">총점 / 만점</div>
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

<h3 className="results-section-title">코딩 문제 결과</h3>

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
  		난이도: {difficultyLabelMap[item.difficulty] || '쉬움'} ·
  		점수: {item.earnedPoint}/{item.point}점 ·
  		오류유형: {item.errorType || '없음'}
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

	      <h3 className="results-section-title objective-result-title">
        객관식 문제 결과
      </h3>

      <div className="results-list">
        {objectiveResultList.length === 0 ? (
          <div className="results-empty">아직 제출한 객관식 문제가 없습니다.</div>
        ) : (
          objectiveResultList.map((item) => (
            <div key={`objective-${item.id}`} className="result-card">
              <div className="result-card-header">
                <div>
                  <div className="result-problem-title">{item.title}</div>
                  <div className="result-meta">
                    난이도: {difficultyLabelMap[item.difficulty] || '쉬움'} ·
                    점수: {item.earnedPoint}/{item.point}점 ·
                    선택 답안: {item.selectedAnswer}번 ·
                    정답: {item.correctAnswer}번
                  </div>
                </div>

                <div className={`result-badge ${item.isCorrect ? 'correct' : 'wrong'}`}>
                  {item.isCorrect ? '정답' : '오답'}
                </div>
              </div>

              <div className="result-ai-box">
                <p><strong>문제 설명:</strong> {item.description || '-'}</p>
                <p><strong>해설:</strong> {item.explanation || '-'}</p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  </div>
);
}