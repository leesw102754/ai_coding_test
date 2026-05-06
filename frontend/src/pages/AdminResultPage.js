import { useEffect, useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LabelList,
} from 'recharts';
import {
  getAllSubmissions,
  getSubmissionDetail,
  getProblems,
  reanalyzeAllSubmissionsWithAi,
} from '../api/problemApi';
import './AdminResultPage.css';

const AI_ERROR_LABELS = {
  accepted: '정답',
  logic: '논리 오류',
  runtime: '런타임 오류',
  index: '인덱스 오류',
  compile: '컴파일 오류',
  ai_error: 'AI 분석 오류',
  wrong: '오답',
  unknown: '기타',
};

const AI_ERROR_GUIDE = {
  logic: '조건문, 반복문, 출력 형식 검토가 필요합니다.',
  index: '배열/문자열 인덱스 범위와 빈 입력 예외 처리가 필요합니다.',
  runtime: '0으로 나누기, 입력 형식, 예외 발생 가능성을 확인해야 합니다.',
  compile: '문법 오류, 클래스명, import, 세미콜론 누락 여부를 확인해야 합니다.',
  ai_error: 'AI 서버 실행 상태와 API 연결 상태를 확인해야 합니다.',
  wrong: '실패 테스트케이스 기준으로 알고리즘 흐름을 다시 점검해야 합니다.',
  unknown: '제출 상태 데이터가 명확하지 않아 상세 제출 정보를 확인해야 합니다.',
};

const normalizeSubmissionStatus = (item) => {
  const rawStatus = String(item?.status || '').trim().toLowerCase();

  if (rawStatus.includes('accept') || item?.correct === true || item?.isCorrect === true) {
    return 'accepted';
  }

  if (rawStatus.includes('logic')) return 'logic';
  if (rawStatus.includes('index')) return 'index';
  if (rawStatus.includes('runtime')) return 'runtime';
  if (rawStatus.includes('compile')) return 'compile';
  if (rawStatus.includes('ai_error')) return 'ai_error';
  if (rawStatus.includes('wrong') || rawStatus.includes('fail')) return 'wrong';
  if (item?.correct === false || item?.isCorrect === false) return 'wrong';

  return 'unknown';
};

export default function AdminResultPage() {

const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
const [search, setSearch] = useState('');
const [languageFilter, setLanguageFilter] = useState('all');
const [exams, setExams] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 10;

const fetchSubmissions = async () => {
  try {
    setLoadingList(true);
    const data = await getAllSubmissions();
    setSubmissions(data || []);
  } catch (err) {
    console.error('전체 제출 목록 조회 실패:', err);
  } finally {
    setLoadingList(false);
  }
};

useEffect(() => {
  fetchSubmissions();
}, []);

useEffect(() => {
  const fetchExams = async () => {
    try {
      const res = await getProblems();
      setExams(res.data || []);
    } catch (err) {
      console.error('문제 목록 조회 실패:', err);
      setExams([]);
    }
  };

  fetchExams();
}, []);

  const handleSelectSubmission = async (id) => {
    try {
      setSelectedId(id);
      setLoadingDetail(true);
      const detail = await getSubmissionDetail(id);
      setSelectedSubmission(detail);
    } catch (err) {
      console.error('제출 상세 조회 실패:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

const handleReanalyzeAllWithAi = async () => {
  const confirmed = window.confirm(
    'AI 서버가 켜져 있어야 합니다.\n현재 저장된 제출 코드를 AI로 다시 분석하시겠습니까?'
  );

  if (!confirmed) return;

  try {
    setIsReanalyzing(true);

    const result = await reanalyzeAllSubmissionsWithAi();

    alert(
      `AI 피드백 재생성 완료\n성공: ${result.successCount}건\n실패: ${result.failCount}건`
    );

    await fetchSubmissions();

    if (selectedId) {
      const detail = await getSubmissionDetail(selectedId);
      setSelectedSubmission(detail);
    }
  } catch (err) {
    console.error('AI 피드백 재생성 실패:', err);

    const message =
      err.response?.data?.message ||
      'AI 피드백 재생성 중 오류가 발생했습니다. AI 서버가 켜져 있는지 확인하세요.';

    alert(message);
  } finally {
    setIsReanalyzing(false);
  }
};

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const matchesSearch =
        item.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        item.studentId?.toLowerCase().includes(search.toLowerCase()) ||
        String(item.examId).includes(search);

      const matchesLanguage =
        languageFilter === 'all' || item.language === languageFilter;

      return matchesSearch && matchesLanguage;
    });
  }, [submissions, search, languageFilter]);

const totalSubmissionPages = Math.max(
  1,
  Math.ceil(filteredSubmissions.length / pageSize)
);

const paginatedSubmissions = useMemo(() => {
  const startIndex = (currentPage - 1) * pageSize;
  return filteredSubmissions.slice(startIndex, startIndex + pageSize);
}, [filteredSubmissions, currentPage]);

useEffect(() => {
  setCurrentPage(1);
}, [search, languageFilter]);

const examPointMap = useMemo(() => {
  const map = new Map();

  exams.forEach((exam) => {
    map.set(String(exam.id), Number(exam.point ?? 0));
  });

  return map;
}, [exams]);

const examTitleMap = useMemo(() => {
  const map = new Map();

  exams.forEach((exam, index) => {
    map.set(
      String(exam.id),
      exam.title && exam.title.trim() !== ''
        ? exam.title
        : `문제 ${index + 1}`
    );
  });

  return map;
}, [exams]);

const maxTotalScore = useMemo(() => {
  return exams.reduce((sum, exam) => sum + Number(exam.point ?? 0), 0);
}, [exams]);

const getSubmissionPointInfo = (submission) => {
  const maxPoint = examPointMap.get(String(submission?.examId)) ?? 0;
  const earnedPoint =
    normalizeSubmissionStatus(submission) === 'accepted' ? maxPoint : 0;

  return {
    earnedPoint,
    maxPoint,
  };
};

const studentScoreData = useMemo(() => {
  const latestSubmissionMap = new Map();

  submissions.forEach((item) => {
    if (!item.studentId || item.examId == null) return;

    const key = `${item.studentId}__${item.examId}`;
    const prev = latestSubmissionMap.get(key);

    const currentTime = new Date(item.submitTime || 0).getTime();
    const prevTime = new Date(prev?.submitTime || 0).getTime();

    if (!prev || currentTime >= prevTime) {
      latestSubmissionMap.set(key, item);
    }
  });

  const studentMap = new Map();

  latestSubmissionMap.forEach((item) => {
    const studentId = item.studentId || 'unknown';

    if (!studentMap.has(studentId)) {
      studentMap.set(studentId, {
        studentId,
        studentName: item.studentName || '-',
        submittedCount: 0,
        acceptedCount: 0,
        score: 0,
        maxScore: maxTotalScore,
      });
    }

    const row = studentMap.get(studentId);
    const point = examPointMap.get(String(item.examId)) ?? 0;

    row.submittedCount += 1;

    if (normalizeSubmissionStatus(item) === 'accepted') {
      row.acceptedCount += 1;
      row.score += point;
    }
  });

  return Array.from(studentMap.values())
    .map((row) => ({
      ...row,
      scoreRate:
        row.maxScore === 0 ? 0 : Math.round((row.score / row.maxScore) * 100),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return String(a.studentName).localeCompare(String(b.studentName), 'ko');
    });
}, [submissions, examPointMap, maxTotalScore]);

  const stats = useMemo(() => {
    const uniqueStudents = new Set(
      submissions.map((s) => s.studentId).filter(Boolean)
    ).size;

    const languageCount = submissions.reduce((acc, cur) => {
      const lang = cur.language || 'unknown';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});

    const languageChartData = Object.entries(languageCount).map(([name, value]) => ({
      name,
      value,
    }));

    const timeBucketCount = submissions.reduce((acc, cur) => {
      if (!cur.submitTime) return acc;

      const date = new Date(cur.submitTime);
      if (Number.isNaN(date.getTime())) return acc;

      const hour = String(date.getHours()).padStart(2, '0');
      const startMinute = Math.floor(date.getMinutes() / 10) * 10;
      const endMinute = startMinute + 9;

      const start = String(startMinute).padStart(2, '0');
      const end = String(endMinute).padStart(2, '0');

      const bucket = `${hour}:${start}~${hour}:${end}`;

      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});

    const hourlyChartData = Object.keys(timeBucketCount)
      .sort()
      .map((hour) => ({
        hour,
        count: timeBucketCount[hour],
      }));

    return {
      totalSubmissions: submissions.length,
      uniqueStudents,
      languageChartData,
      hourlyChartData,
    };
  }, [submissions]);

const feedbackStatusData = useMemo(() => {
  const counter = submissions.reduce(
    (acc, cur) => {
      const status = normalizeSubmissionStatus(cur);

      if (status === 'accepted') {
        acc.accepted += 1;
      } else {
        acc.notAccepted += 1;
      }

      return acc;
    },
    { accepted: 0, notAccepted: 0 }
  );

  return [
    { name: '정답', value: counter.accepted },
    { name: '오답/기타', value: counter.notAccepted },
  ].filter((item) => item.value > 0);
}, [submissions]);

  const problemAccuracyData = useMemo(() => {
    const grouped = submissions.reduce((acc, cur) => {
      const examId = cur.examId;
      if (examId == null) return acc;

      if (!acc[examId]) {
        acc[examId] = {
          examId,
          total: 0,
          correct: 0,
        };
      }

      acc[examId].total += 1;

const status = normalizeSubmissionStatus(cur);
if (status === 'accepted') {
  acc[examId].correct += 1;
}

      return acc;
    }, {});

    return Object.values(grouped)
      .map((item) => ({
        examId: item.examId,
        total: item.total,
        correct: item.correct,
        rate: item.total === 0 ? 0 : Math.round((item.correct / item.total) * 100),
        label: `${item.examId}번`,
      }))
      .sort((a, b) => Number(a.examId) - Number(b.examId));
  }, [submissions]);

  const aiWeaknessAnalysis = useMemo(() => {
  const counts = {
    accepted: 0,
    logic: 0,
    runtime: 0,
    index: 0,
    compile: 0,
    ai_error: 0,
    wrong: 0,
    unknown: 0,
  };

  submissions.forEach((item) => {
    const status = normalizeSubmissionStatus(item);
    counts[status] = (counts[status] || 0) + 1;
  });

  const errorEntries = Object.entries(counts)
    .filter(([key, value]) => key !== 'accepted' && value > 0)
    .sort((a, b) => b[1] - a[1]);

  const weakType = errorEntries.length > 0 ? errorEntries[0][0] : null;
  const weakCount = errorEntries.length > 0 ? errorEntries[0][1] : 0;
  const totalWrong = errorEntries.reduce((sum, [, value]) => sum + value, 0);

  if (submissions.length === 0) {
    return {
      counts,
      weakType: null,
      weakTypeLabel: '없음',
      weakCount: 0,
      totalWrong: 0,
      summary: '아직 제출 데이터가 없어 AI 취약 유형 분석을 대기 중입니다.',
      guide: '학생 제출이 발생하면 오류 유형별로 자동 분석되어 가장 많이 발생한 취약 유형을 표시합니다.',
    };
  }

  return {
    counts,
    weakType,
    weakTypeLabel: weakType ? AI_ERROR_LABELS[weakType] : '없음',
    weakCount,
    totalWrong,
    summary:
      totalWrong === 0
        ? '현재 제출 기준으로 주요 오류가 발견되지 않았습니다.'
        : `전체 오답 ${totalWrong}건 중 ${AI_ERROR_LABELS[weakType]}가 ${weakCount}건으로 가장 많이 발생했습니다.`,
    guide:
      totalWrong === 0
        ? '현재 정답 비율이 높습니다. 다음 단계에서는 난이도 높은 테스트케이스를 추가해 검증하면 좋습니다.'
        : AI_ERROR_GUIDE[weakType] || '상세 제출 데이터를 기준으로 추가 확인이 필요합니다.',
  };
}, [submissions]);

const languageAccuracyData = useMemo(() => {
  const grouped = new Map();

  submissions.forEach((item) => {
    const language = item.language || 'unknown';

    if (!grouped.has(language)) {
      grouped.set(language, {
        language,
        total: 0,
        accepted: 0,
        wrong: 0,
        rate: 0,
      });
    }

    const row = grouped.get(language);
    row.total += 1;

    if (normalizeSubmissionStatus(item) === 'accepted') {
      row.accepted += 1;
    } else {
      row.wrong += 1;
    }
  });

  return Array.from(grouped.values())
    .map((row) => ({
      ...row,
      rate: row.total === 0 ? 0 : Math.round((row.accepted / row.total) * 100),
    }))
    .sort((a, b) => {
      if (b.rate !== a.rate) return b.rate - a.rate;
      return b.total - a.total;
    });
}, [submissions]);

const problemErrorTypeData = useMemo(() => {
  const grouped = new Map();

  submissions.forEach((item) => {
    if (item.examId == null) return;

    const examKey = String(item.examId);

    if (!grouped.has(examKey)) {
      grouped.set(examKey, {
        examId: item.examId,
        title: examTitleMap.get(examKey) || `문제 ${item.examId}`,
        total: 0,
        accepted: 0,
        wrong: 0,
        correctRate: 0,
        errorCounts: {},
        mainErrorKey: 'none',
        mainErrorLabel: '오답 없음',
        mainErrorCount: 0,
      });
    }

    const row = grouped.get(examKey);
    const status = normalizeSubmissionStatus(item);

    row.total += 1;

    if (status === 'accepted') {
      row.accepted += 1;
    } else {
      row.wrong += 1;
      row.errorCounts[status] = (row.errorCounts[status] || 0) + 1;
    }
  });

  return Array.from(grouped.values())
    .map((row) => {
      const errorEntries = Object.entries(row.errorCounts).sort(
        (a, b) => b[1] - a[1]
      );

      const mainErrorKey = errorEntries[0]?.[0] || 'none';
      const mainErrorCount = errorEntries[0]?.[1] || 0;

      return {
        ...row,
        correctRate:
          row.total === 0 ? 0 : Math.round((row.accepted / row.total) * 100),
        mainErrorKey,
        mainErrorCount,
        mainErrorLabel:
          mainErrorCount > 0
            ? AI_ERROR_LABELS[mainErrorKey] || mainErrorKey
            : '오답 없음',
      };
    })
    .sort((a, b) => {
      if (b.wrong !== a.wrong) return b.wrong - a.wrong;
      return a.correctRate - b.correctRate;
    });
}, [submissions, examTitleMap]);

const advancedSummaryData = useMemo(() => {
  const topStudent = studentScoreData[0];
  const hardestProblem = problemErrorTypeData.find((item) => item.wrong > 0);
  const bestLanguage = languageAccuracyData[0];

  return {
topStudent:
  topStudent && topStudent.score > 0
    ? `${topStudent.studentName} / ${topStudent.score}점`
    : '최고 점수 없음',
    hardestProblem: hardestProblem
      ? `${hardestProblem.title} / 오답 ${hardestProblem.wrong}건`
      : '오답 데이터 없음',
bestLanguage:
  bestLanguage && bestLanguage.accepted > 0
    ? `${bestLanguage.language} / ${bestLanguage.rate}%`
    : '정답 데이터 없음',
  };
}, [studentScoreData, problemErrorTypeData, languageAccuracyData]);

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('ko-KR');
  };

const selectedPointInfo = selectedSubmission
  ? getSubmissionPointInfo(selectedSubmission)
  : null;

return (
  <div className="admin-result-page">
    <div className="admin-result-header">
      <div>
        <h1>전체 결과 관리</h1>
        <p>전체 제출 현황과 상세 피드백을 한눈에 확인할 수 있습니다.</p>
      </div>

      <button
        type="button"
        className="ai-reanalyze-button"
        onClick={handleReanalyzeAllWithAi}
        disabled={isReanalyzing || submissions.length === 0}
      >
        {isReanalyzing ? 'AI 피드백 생성 중...' : 'AI 피드백 일괄 생성'}
      </button>
    </div>

    <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">전체 제출 수</span>
          <strong className="summary-value">{stats.totalSubmissions}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">제출 학생 수</span>
          <strong className="summary-value">{stats.uniqueStudents}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">선택된 제출</span>
          <strong className="summary-value">
            {selectedSubmission ? `#${selectedSubmission.id}` : '-'}
          </strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">선택된 언어</span>
          <strong className="summary-value">
            {selectedSubmission?.language || '-'}
          </strong>
        </div>
      </div>

      <div className="ai-analysis-card">
        <div className="ai-analysis-main">
          <span className="ai-analysis-badge">AI Analysis</span>
          <h3>AI 취약 유형 분석</h3>
          <p>{aiWeaknessAnalysis.summary}</p>
          <p className="ai-analysis-guide">{aiWeaknessAnalysis.guide}</p>
        </div>

        <div className="ai-weak-box">
          <span>가장 많은 오류 유형</span>
          <strong>{aiWeaknessAnalysis.weakTypeLabel}</strong>
          <small>
            {aiWeaknessAnalysis.totalWrong === 0
              ? '오답 데이터 없음'
              : `${aiWeaknessAnalysis.weakCount}건 발생`}
          </small>
        </div>

        <div className="ai-status-chip-list">
          {['accepted', 'logic', 'runtime', 'index', 'compile', 'ai_error', 'wrong', 'unknown'].map((key) => (
            <span key={key} className={`ai-status-chip ${key}`}>
              {AI_ERROR_LABELS[key]} {aiWeaknessAnalysis.counts[key]}건
            </span>
          ))}
        </div>
      </div>

<div className="student-score-card">
  <div className="student-score-card-header">
    <div>
      <h3>학생별 점수 현황</h3>
      <p>학생별 최신 제출 기준으로 총점과 정답 수를 확인합니다.</p>
    </div>
    <span>현재 시험 만점: {maxTotalScore}점</span>
  </div>

  {studentScoreData.length === 0 ? (
    <div className="student-score-empty">
      아직 학생 제출 데이터가 없습니다.
    </div>
  ) : (
    <div className="student-score-table-wrap">
      <table className="student-score-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>학번</th>
            <th>점수</th>
            <th>달성률</th>
            <th>정답 / 제출</th>
          </tr>
        </thead>
        <tbody>
          {studentScoreData.map((row) => (
            <tr key={row.studentId}>
              <td>{row.studentName}</td>
              <td>{row.studentId}</td>
              <td>
                <strong>{row.score}</strong> / {row.maxScore}점
              </td>
              <td>{row.scoreRate}%</td>
              <td>
                {row.acceptedCount} / {row.submittedCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

<div className="advanced-summary-grid">
  <div className="advanced-summary-card">
    <span>최고 점수 학생</span>
    <strong>{advancedSummaryData.topStudent}</strong>
    <p>학생별 최신 제출 기준으로 계산됩니다.</p>
  </div>

  <div className="advanced-summary-card">
    <span>최다 오답 문제</span>
    <strong>{advancedSummaryData.hardestProblem}</strong>
    <p>오답 수가 가장 많은 문제를 표시합니다.</p>
  </div>

  <div className="advanced-summary-card">
    <span>최고 정답률 언어</span>
    <strong>{advancedSummaryData.bestLanguage}</strong>
    <p>언어별 제출 결과를 기준으로 계산합니다.</p>
  </div>
</div>

<div className="analysis-table-grid">
  <div className="analysis-table-card">
    <div className="analysis-table-header">
      <div>
        <h3>문제별 오류 유형 분석</h3>
        <p>문제별로 어떤 오류가 많이 발생했는지 확인합니다.</p>
      </div>
    </div>

    {problemErrorTypeData.length === 0 ? (
      <div className="analysis-empty">제출 데이터가 없습니다.</div>
    ) : (
      <div className="analysis-table-wrap">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>문제</th>
              <th>제출</th>
              <th>정답</th>
              <th>오답</th>
              <th>주요 오류</th>
              <th>정답률</th>
            </tr>
          </thead>
          <tbody>
            {problemErrorTypeData.slice(0, 8).map((row) => (
              <tr key={row.examId}>
                <td>{row.title}</td>
                <td>{row.total}</td>
                <td>{row.accepted}</td>
                <td>{row.wrong}</td>
                <td>
                  {row.mainErrorLabel}
                  {row.mainErrorCount > 0 ? ` ${row.mainErrorCount}건` : ''}
                </td>
                <td>{row.correctRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>

  <div className="analysis-table-card">
    <div className="analysis-table-header">
      <div>
        <h3>언어별 정답률</h3>
        <p>언어별 제출 수와 정답률을 확인합니다.</p>
      </div>
    </div>

    {languageAccuracyData.length === 0 ? (
      <div className="analysis-empty">제출 데이터가 없습니다.</div>
    ) : (
      <div className="analysis-table-wrap">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>언어</th>
              <th>제출</th>
              <th>정답</th>
              <th>오답</th>
              <th>정답률</th>
            </tr>
          </thead>
          <tbody>
            {languageAccuracyData.map((row) => (
              <tr key={row.language}>
                <td>{row.language}</td>
                <td>{row.total}</td>
                <td>{row.accepted}</td>
                <td>{row.wrong}</td>
                <td>{row.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>언어별 제출 비율</h3>
		<ResponsiveContainer width="100%" height={300}>
  		<PieChart margin={{ top: 24, right: 32, bottom: 24, left: 32 }}>
    		<Pie
      			data={stats.languageChartData}
      			dataKey="value"
      			nameKey="name"
      			outerRadius={78}
      			label
    		>
		{stats.languageChartData.map((entry, index) => {
  		const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];
 		 return <Cell key={index} fill={colors[index % colors.length]} />;
		})}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>시간대별 제출 수</h3>
<div className="time-chart-wrapper">
  <ResponsiveContainer width="100%" height={260}>
    <BarChart
      data={stats.hourlyChartData}
      barCategoryGap="20%"
      margin={{ top: 12, right: 20, bottom: 12, left: 0 }}
    >
  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
  <XAxis dataKey="hour" />
  <YAxis allowDecimals={false} />
  <Tooltip
    formatter={(value) => [`${value}건`, '제출 수']}
  />
  <Legend />
  <Bar
    dataKey="count"
    name="제출 수"
    fill="#3b82f6"
    barSize={40}
    radius={[6, 6, 0, 0]}
  />
    </BarChart>
  </ResponsiveContainer>
</div>
        </div>

        <div className="chart-card">
          <h3>제출 상태 비율</h3>
		<ResponsiveContainer width="100%" height={300}>
  		<PieChart margin={{ top: 24, right: 32, bottom: 24, left: 32 }}>
    		<Pie
      			data={feedbackStatusData}
      			dataKey="value"
      			nameKey="name"
      			outerRadius={78}
      			label
    		>
		{feedbackStatusData.map((entry, index) => (
  		<Cell key={index} fill={index === 0 ? '#22c55e' : '#ef4444'} />
		))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>문제별 정답률</h3>
          <ResponsiveContainer width="100%" height={260}>
<BarChart data={problemAccuracyData} barCategoryGap="45%">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} allowDecimals={false} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'rate') return [`${value}%`, '정답률'];
                  return [value, name];
                }}
              />
              <Legend />
		<Bar
  		dataKey="rate"
  		name="정답률"
  		fill="#22c55e"
  		barSize={40}
  		minPointSize={3}
  		radius={[6, 6, 0, 0]}
		>
  		<LabelList
    		dataKey="rate"
    		position="top"
  		  formatter={(value) => `${value}%`}
  		/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-result-main">
        <div className="submission-list-panel">
          <div className="panel-top">
            <h3>전체 제출 목록</h3>
            <div className="panel-filters">
              <input
                type="text"
                placeholder="학생명, 학번, 문제번호 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
              >
                <option value="all">전체 언어</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
              </select>
            </div>
          </div>

          <div className="submission-table-wrap">
            {loadingList ? (
              <div className="empty-box">목록을 불러오는 중입니다...</div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="empty-box">제출 데이터가 없습니다.</div>
            ) : (
              <table className="submission-table">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>문제</th>
                    <th>학번</th>
                    <th>이름</th>
                    <th>언어</th>
                    <th>정답 여부</th>
                    <th>제출 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubmissions.map((item, index) => {
                    const isCorrect = item.correct ?? item.isCorrect ?? false;

                    return (
                      <tr
                        key={item.id}
                        className={selectedId === item.id ? 'active' : ''}
                        onClick={() => handleSelectSubmission(item.id)}
                      >
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>{item.examId}</td>
                        <td>{item.studentId}</td>
                        <td>{item.studentName}</td>
                        <td>{item.language}</td>
                        <td style={{ color: isCorrect ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                          {isCorrect ? '✅ 정답' : '❌ 오답'}
                        </td>
                        <td>{formatDateTime(item.submitTime)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

	          {!loadingList && filteredSubmissions.length > 0 && (
            <div className="submission-pagination">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                이전
              </button>

              {Array.from({ length: totalSubmissionPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalSubmissionPages, prev + 1))
                }
                disabled={currentPage === totalSubmissionPages}
              >
                다음
              </button>

              <span className="pagination-info">
                {filteredSubmissions.length}개 중{' '}
                {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredSubmissions.length)}개 표시
              </span>
            </div>
          )}

        </div>

        <div className="submission-detail-panel">
          <h3>제출 상세</h3>

          {loadingDetail ? (
            <div className="empty-box">상세 정보를 불러오는 중입니다...</div>
          ) : !selectedSubmission ? (
            <div className="empty-box">왼쪽 목록에서 제출 하나를 선택하세요.</div>
          ) : (
            <div className="detail-content">
              <div className="detail-card">
                <p><strong>제출 ID:</strong> {selectedSubmission.id}</p>
                <p><strong>문제 번호:</strong> {selectedSubmission.examId}</p>
                <p><strong>학번:</strong> {selectedSubmission.studentId}</p>
                <p><strong>이름:</strong> {selectedSubmission.studentName}</p>
                <p><strong>언어:</strong> {selectedSubmission.language}</p>
		<p>
 		 <strong>점수:</strong>{' '}
 		 {selectedPointInfo?.earnedPoint ?? 0}/{selectedPointInfo?.maxPoint ?? 0}점
		</p>
                <p><strong>제출 시간:</strong> {formatDateTime(selectedSubmission.submitTime)}</p>
              </div>

              <div className="detail-card">
                <h4>제출 코드</h4>
                <pre className="code-block">{selectedSubmission.code}</pre>
              </div>

              <div className="detail-card">
                <h4>AI 피드백</h4>
                <p><strong>오류 유형:</strong> {selectedSubmission.status || '-'}</p>
                <p><strong>요약:</strong> {selectedSubmission.aiSummary || '-'}</p>
                <p><strong>오류 원인:</strong> {selectedSubmission.aiWrongReason || '-'}</p>
                <p><strong>해결 방향:</strong> {selectedSubmission.aiSolutionDirection || '-'}</p>
                <p><strong>개선 피드백:</strong> {selectedSubmission.aiImprovement || '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}