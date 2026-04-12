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
} from 'recharts';
import { getAllSubmissions, getSubmissionDetail } from '../api/problemApi';
import './AdminResultPage.css';

export default function AdminResultPage() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');

  useEffect(() => {
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

    fetchSubmissions();
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

  const stats = useMemo(() => {
    const uniqueStudents = new Set(submissions.map((s) => s.studentId)).size;

    const languageCount = submissions.reduce((acc, cur) => {
      const lang = cur.language || 'unknown';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});

    const languageChartData = Object.entries(languageCount).map(([name, value]) => ({
      name,
      value,
    }));

    const hourlyCount = submissions.reduce((acc, cur) => {
      const date = new Date(cur.submitTime);
      const hour = `${String(date.getHours()).padStart(2, '0')}시`;
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const hourlyChartData = Object.keys(hourlyCount)
      .sort()
      .map((hour) => ({
        hour,
        count: hourlyCount[hour],
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
        const type = cur.ai_feedback?.error_type;
        if (type === 'accepted') acc.accepted += 1;
        else acc.notAccepted += 1;
        return acc;
      },
      { accepted: 0, notAccepted: 0 }
    );

    return [
      { name: '정답', value: counter.accepted },
      { name: '오답/기타', value: counter.notAccepted },
    ];
  }, [submissions]);

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleString('ko-KR');
  };

  return (
    <div className="admin-result-page">
      <div className="admin-result-header">
        <div>
          <h1>전체 결과 관리</h1>
          <p>전체 제출 현황과 상세 피드백을 한눈에 확인할 수 있습니다.</p>
        </div>
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

      <div className="chart-grid">
        <div className="chart-card">
          <h3>언어별 제출 비율</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={stats.languageChartData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {stats.languageChartData.map((entry, index) => (
                  <Cell key={index} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>시간대별 제출 수</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.hourlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="제출 수" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>제출 상태 비율</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={feedbackStatusData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {feedbackStatusData.map((entry, index) => (
                  <Cell key={index} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
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
                    <th>ID</th>
                    <th>문제</th>
                    <th>학번</th>
                    <th>이름</th>
                    <th>언어</th>
                    <th>제출 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((item) => (
                    <tr
                      key={item.id}
                      className={selectedId === item.id ? 'active' : ''}
                      onClick={() => handleSelectSubmission(item.id)}
                    >
                      <td>{item.id}</td>
                      <td>{item.examId}</td>
                      <td>{item.studentId}</td>
                      <td>{item.studentName}</td>
                      <td>{item.language}</td>
                      <td>{formatDateTime(item.submitTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
                <p><strong>제출 시간:</strong> {formatDateTime(selectedSubmission.submitTime)}</p>
              </div>

              <div className="detail-card">
                <h4>제출 코드</h4>
                <pre className="code-block">{selectedSubmission.code}</pre>
              </div>

              <div className="detail-card">
                <h4>AI 피드백</h4>
                <p><strong>오류 유형:</strong> {selectedSubmission.ai_feedback?.error_type || '-'}</p>
                <p><strong>요약:</strong> {selectedSubmission.ai_feedback?.summary || '-'}</p>
                <p><strong>오류 원인:</strong> {selectedSubmission.ai_feedback?.wrong_reason || '-'}</p>
                <p><strong>해결 방향:</strong> {selectedSubmission.ai_feedback?.solution_direction || '-'}</p>
                <p><strong>개선 피드백:</strong> {selectedSubmission.ai_feedback?.improvement_feedback || '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}