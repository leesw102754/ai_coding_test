import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getSubmissionsByStudentId,
  getProblems,
  getObjectiveQuestions,
  getObjectiveQuestionsByCategoryId,
  getObjectiveSubmissionsByStudentId,
} from '../api/problemApi';
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
  const [searchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('categoryId') || '';
  const [categoryProblems, setCategoryProblems] = useState([]);

  const { user } = useAuth();

const savedUser = useMemo(() => {
  try {
    return JSON.parse(sessionStorage.getItem('user') || '{}');
  } catch (err) {
    return {};
  }
}, []);

const effectiveStudentId =
  user?.studentId ||
  user?.loginId ||
  user?.username ||
  user?.id ||
  savedUser.studentId ||
  savedUser.loginId ||
  savedUser.username ||
  savedUser.id ||
  null;

const effectiveStudentName =
  user?.name ||
  user?.studentName ||
  user?.username ||
  savedUser.name ||
  savedUser.studentName ||
  savedUser.username ||
  '-';

const [mySubmissions, setMySubmissions] = useState([]);
const [objectiveQuestions, setObjectiveQuestions] = useState([]);
const [myObjectiveSubmissions, setMyObjectiveSubmissions] = useState([]);
const [loadingResults, setLoadingResults] = useState(true);
const [resultTypeFilter, setResultTypeFilter] = useState('all');

useEffect(() => {
  const fetchMySubmissions = async () => {
  if (!effectiveStudentId) {
    setMySubmissions([]);
    setObjectiveQuestions([]);
    setMyObjectiveSubmissions([]);
    setCategoryProblems([]);
    setLoadingResults(false);
    return;
  }

  try {
    setLoadingResults(true);

const [
  codingData,
  problemRes,
  objectiveQuestionData,
  objectiveSubmissionData,
] = await Promise.all([
  getSubmissionsByStudentId(effectiveStudentId),
  getProblems(),

  selectedCategoryId
    ? getObjectiveQuestionsByCategoryId(selectedCategoryId)
    : getObjectiveQuestions(),

  getObjectiveSubmissionsByStudentId(effectiveStudentId),
]);

    const allProblems = problemRes?.data || [];

const scopedProblems = selectedCategoryId
  ? allProblems.filter(
      (problem) => String(problem.categoryId) === String(selectedCategoryId)
    )
  : allProblems;

const scopedExamIdSet = new Set(
  scopedProblems.map((problem) => String(problem.id))
);

const filteredCodingSubmissions = selectedCategoryId
  ? (codingData || []).filter((submission) =>
      scopedExamIdSet.has(String(submission.examId))
    )
  : codingData || [];

const objectiveQuestionsInScope = objectiveQuestionData || [];

const objectiveQuestionIdSet = new Set(
  objectiveQuestionsInScope.map((question) => String(question.id))
);

const filteredObjectiveSubmissions = selectedCategoryId
  ? (objectiveSubmissionData || []).filter((submission) =>
      objectiveQuestionIdSet.has(String(submission.questionId))
    )
  : objectiveSubmissionData || [];

setCategoryProblems(scopedProblems);
setMySubmissions(filteredCodingSubmissions);
setObjectiveQuestions(objectiveQuestionsInScope);
setMyObjectiveSubmissions(filteredObjectiveSubmissions);

  } catch (err) {
    console.error('내 제출 결과 조회 실패:', err);
    setMySubmissions([]);
    setObjectiveQuestions([]);
    setMyObjectiveSubmissions([]);
    setCategoryProblems([]);
  } finally {
    setLoadingResults(false);
  }
};

  fetchMySubmissions();
}, [effectiveStudentId, effectiveStudentName, selectedCategoryId]);  

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

  categoryProblems.forEach((problem) => {
    map.set(String(problem.id), problem);
  });

  return map;
}, [categoryProblems]);

const scopedProblems = useMemo(() => {
  return categoryProblems;
}, [categoryProblems]);

const resultList = useMemo(() => {
  return mySubmissions
    .map((submission) => {
      const problem = problemMap.get(String(submission.examId));

      const submissionCategoryId =
        submission.categoryId ??
        problem?.categoryId ??
        '';

      const isCorrect =
        submission.correct === true ||
        submission.isCorrect === true ||
        String(submission.status || '').toLowerCase() === 'accepted' ||
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
  categoryId: submissionCategoryId,
  title: problem?.title || `코딩 문제 ${submission.examId}`,
  description: problem?.description || '',
  difficulty: problem?.difficulty || 'easy',
  submitted: true,
  isCorrect,
  point,
  earnedPoint,
  language: submission.language || '',
  submittedCode:
    submission.code ||
    submission.submittedCode ||
    submission.studentCode ||
    submission.sourceCode ||
    '',
  errorType: submission.status ?? null,
  summary: submission.aiSummary ?? '',
  wrongReason: submission.aiWrongReason ?? '',
  solutionDirection: submission.aiSolutionDirection ?? '',
  improvement: submission.aiImprovement ?? '',
  submitTime: submission.submitTime ?? null,
};
    })
    .filter((item) =>
      selectedCategoryId
        ? String(item.categoryId) === String(selectedCategoryId)
        : true
    );
}, [mySubmissions, problemMap, selectedCategoryId]);

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

    const point = Number(
      question?.point ??
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
      questionId: submission.questionId,

      title:
        question?.title ||
        submission.title ||
        submission.questionTitle ||
        `객관식 문제 ${submission.questionId}`,

      description:
        question?.description ||
        submission.description ||
        submission.questionDescription ||
        submission.objectiveQuestionDescription ||
        '',

      difficulty:
        question?.difficulty ||
        submission.difficulty ||
        'easy',

      point,
      earnedPoint,
      isCorrect,

      selectedAnswer: submission.selectedAnswer,

      correctAnswer:
        submission.correctAnswer ||
        question?.correctAnswer,

      explanation:
        question?.explanation ||
        submission.explanation ||
        submission.answerExplanation ||
        submission.objectiveExplanation ||
        '',

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
  scopedProblems.length > 0
    ? scopedProblems.reduce((sum, p) => sum + Number(p.point ?? 0), 0)
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
}, [resultList, objectiveResultList, scopedProblems, objectiveQuestions]);
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

const showCodingResults =
  resultTypeFilter === 'all' || resultTypeFilter === 'coding';

const showObjectiveResults =
  resultTypeFilter === 'all' || resultTypeFilter === 'objective';

const handlePrintResults = () => {
  window.print();
};

const handleDownloadResultsText = () => {
  const lines = [
    '결과 확인',
    `학생: ${effectiveStudentName || '-'} (${effectiveStudentId || '-'})`,
    selectedCategoryId ? `시험 폴더 ID: ${selectedCategoryId}` : '시험 폴더 ID: 전체',
    '',
    '[점수 요약]',
    `전체 정답/제출: ${stats.correct}/${stats.total}`,
    `코딩 점수: ${stats.codingScore}/${stats.codingMaxScore}`,
    `객관식 점수: ${stats.objectiveScore}/${stats.objectiveMaxScore}`,
    `총점: ${stats.totalScore}/${stats.maxScore}`,
    '',
    '[코딩 문제 결과]',
...(resultList.length === 0
  ? ['제출한 코딩 문제가 없습니다.']
  : resultList.flatMap((item, index) => {
      const codeLines = item.submittedCode
        ? item.submittedCode.split('\n').map((line) => `   ${line}`)
        : ['   제출 코드가 없습니다.'];

      return [
        `${index + 1}. ${item.title}`,
        `   결과: ${item.isCorrect ? '정답' : '오답'}`,
        `   점수: ${item.earnedPoint}/${item.point}`,
        `   제출 언어: ${item.language || '-'}`,
        `   오류유형: ${item.errorType || '없음'}`,
        `   요약: ${item.summary || '-'}`,
        `   오류 원인: ${item.wrongReason || '-'}`,
        `   해결 방향: ${item.solutionDirection || '-'}`,
        `   개선 피드백: ${item.improvement || '-'}`,
        '',
        '   제출 코드:',
        '   ----------------------------------------',
        ...codeLines,
        '   ----------------------------------------',
        '',
      ];
    })),
    '',
    '[객관식 문제 결과]',
    ...(objectiveResultList.length === 0
      ? ['제출한 객관식 문제가 없습니다.']
      : objectiveResultList.flatMap((item, index) => [
          `${index + 1}. ${item.title}`,
          `   결과: ${item.isCorrect ? '정답' : '오답'}`,
          `   점수: ${item.earnedPoint}/${item.point}`,
          `   선택 답안: ${item.selectedAnswer}번`,
          `   정답: ${item.correctAnswer}번`,
          `   문제 설명: ${item.description || '-'}`,
          `   해설: ${item.explanation || '-'}`,
        ])),
  ];

  const blob = new Blob([lines.join('\n')], {
    type: 'text/plain;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `result-${effectiveStudentId || 'student'}-${selectedCategoryId || 'all'}.txt`;
  link.click();

  URL.revokeObjectURL(url);
};

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
      <div className="results-title-row">
  <div>
    <h2 className="results-title">결과 확인</h2>
    <p className="results-subtitle">
      제출한 문제와 AI 피드백을 확인할 수 있습니다.
    </p>
  </div>

  <div className="results-action-buttons">
    <button
      type="button"
      className="results-action-btn"
      onClick={handlePrintResults}
    >
      인쇄
    </button>

    <button
      type="button"
      className="results-action-btn primary"
      onClick={handleDownloadResultsText}
    >
      TXT 다운로드
    </button>
  </div>
</div>

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

<div className="results-filter-box">
  <div>
    <h3 className="results-section-title">결과 유형 선택</h3>
    <p>전체 결과, 코딩 문제 결과, 객관식 문제 결과를 나눠서 확인할 수 있습니다.</p>
  </div>

  <div className="results-filter-buttons">
    <button
      type="button"
      className={`results-filter-btn ${resultTypeFilter === 'all' ? 'active' : ''}`}
      onClick={() => setResultTypeFilter('all')}
    >
      전체
    </button>

    <button
      type="button"
      className={`results-filter-btn ${resultTypeFilter === 'coding' ? 'active' : ''}`}
      onClick={() => setResultTypeFilter('coding')}
    >
      코딩 문제
    </button>

    <button
      type="button"
      className={`results-filter-btn ${resultTypeFilter === 'objective' ? 'active' : ''}`}
      onClick={() => setResultTypeFilter('objective')}
    >
      객관식 문제
    </button>
  </div>
</div>

{showCodingResults && (
  <>
    <h3 className="results-section-title">코딩 문제 결과</h3>

    <div className="results-list">
      {resultList.length === 0 ? (
        <div className="results-empty">아직 제출한 코딩 문제가 없습니다.</div>
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

<div className="submitted-code-box">
  <div className="submitted-code-title">
    제출 코드 {item.language ? `(${item.language})` : ''}
  </div>

  <pre className="submitted-code-block">
    {item.submittedCode || '제출 코드가 없습니다.'}
  </pre>
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
  </>
)}

{showObjectiveResults && (
  <>
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
  </>
)}
    </div>
  </div>
);
}