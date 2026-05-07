import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useProblem } from '../context/ProblemContext';
import { useTheme } from '../context/ThemeContext';
import './ProblemPage.css';
import { useAuth } from '../context/AuthContext';
import {
  submitExam,
  getTestCasesByExamId,
  getSubmissionsByStudentId,
  getAllSubmissions,
  runExamTestCases,
} from '../api/problemApi';
import LoadingOverlay from '../components/LoadingOverlay';
import { toast } from 'react-toastify';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
];

export default function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCategoryId = location.state?.fromCategoryId;
  const { problems } = useProblem();
  const { theme } = useTheme();
  const { user } = useAuth();

  const problem = problems.find((p) => p.id === parseInt(id, 10));

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [exitConfirm, setExitConfirm] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [submitResult, setSubmitResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [testCases, setTestCases] = useState([]);
  const [testCaseLoading, setTestCaseLoading] = useState(false);

  const timerRef = useRef(null);
  const warningRef = useRef(false);
  const submitLockRef = useRef(false);

  const [showResultModal, setShowResultModal] = useState(false);
  const [submissionSummary, setSubmissionSummary] = useState(null);

useEffect(() => {
  const checkAlreadySubmitted = async () => {
    if (!id || !user?.studentId) return;

    try {
      const data = await getSubmissionsByStudentId(user.studentId);

      const alreadySubmitted = (data || []).some(
        (item) => String(item.examId) === String(id)
      );

if (alreadySubmitted) {
  setHasSubmitted(true);
  submitLockRef.current = true;
  toast.error('이미 제출한 문제입니다.');

  if (fromCategoryId) {
    navigate(`/exam/${fromCategoryId}`, { replace: true });
  } else {
    navigate('/', { replace: true });
  }
}
    } catch (err) {
      console.error('제출 여부 확인 실패:', err);
    }
  };

  checkAlreadySubmitted();
}, [id, user?.studentId, navigate, fromCategoryId]);

  useEffect(() => {
    const fetchTestCases = async () => {
      if (!id) return;

      try {
        setTestCaseLoading(true);
        const data = await getTestCasesByExamId(id);
        setTestCases(data || []);
      } catch (err) {
        console.error('테스트케이스 조회 실패:', err);
        setTestCases([]);
      } finally {
        setTestCaseLoading(false);
      }
    };

    fetchTestCases();
  }, [id]);

  useEffect(() => {
    if (problem) {
      const saved = localStorage.getItem(`codetest-code-${problem.id}-${language}`);
      setCode(saved || problem.starterCode?.[language] || '');
    }
  }, [problem, language]);

  useEffect(() => {
    if (problem) {
      localStorage.setItem(`codetest-code-${problem.id}-${language}`, code);
    }
  }, [code, problem, language]);

  useEffect(() => {
    if (examStarted) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [examStarted]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }, []);

  useEffect(() => {
    const handleFSChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(isFull);

      if (examStarted && !isFull && !warningRef.current) {
        warningRef.current = true;
        setWarningCount((c) => c + 1);
        setWarningVisible(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    document.addEventListener('mozfullscreenchange', handleFSChange);
    document.addEventListener('MSFullscreenChange', handleFSChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
      document.removeEventListener('mozfullscreenchange', handleFSChange);
      document.removeEventListener('MSFullscreenChange', handleFSChange);
    };
  }, [examStarted]);

  useEffect(() => {
    if (!examStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount((c) => c + 1);
        setWarningVisible(true);
      }
    };

    const handleBlur = () => {
      setWarningCount((c) => c + 1);
      setWarningVisible(true);
    };

    const handleKeyDown = (e) => {
      if (
        (e.altKey && e.key === 'Tab') ||
        (e.altKey && e.key === 'F4') ||
        (e.ctrlKey && (e.key === 'w' || e.key === 'W')) ||
        (e.metaKey && (e.key === 'w' || e.key === 'W'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setWarningCount((c) => c + 1);
        setWarningVisible(true);
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [examStarted]);

  const startExam = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText('');
      }
    } catch (err) {
      console.warn('클립보드 초기화 실패:', err);
    }

    if (problem) {
      LANGUAGES.forEach((lang) => {
        localStorage.removeItem(`codetest-code-${problem.id}-${lang.id}`);
      });

      setCode(problem.starterCode?.[language] || '');
    }

    setExamStarted(true);
    setTimer(0);
    enterFullscreen();
    toast.info('시험을 시작했습니다. 클립보드가 초기화되었습니다.');
  };

  const handleWarningClose = () => {
    warningRef.current = false;
    setWarningVisible(false);
    enterFullscreen();
  };

  const handleExitExam = () => {
    setExitConfirm(true);
  };

  const confirmExit = () => {
    setExamStarted(false);
    setExitConfirm(false);
    setWarningVisible(false);
    setWarningCount(0);
    clearInterval(timerRef.current);
    exitFullscreen();
    navigate('/');
  };

  const cancelExit = () => {
    setExitConfirm(false);
  };

  const getEditableCodeArea = (source = '') => {
    const match = source.match(
      /(?:\/\/|#)\s*-{5,}\s*([\s\S]*?)\s*(?:\/\/|#)\s*-{5,}/
    );

    return match ? match[1].trim() : source.trim();
  };

  const hasWrittenSolution = (source = '') => {
    const editableCode = getEditableCodeArea(source);

    const codeWithoutComments = editableCode
      .split('\n')
      .map((line) =>
        line
          .replace(/\/\/.*$/g, '')
          .replace(/#.*$/g, '')
          .trim()
      )
      .join('');

    return codeWithoutComments.length > 0;
  };

  const runCode = async () => {
  if (!hasWrittenSolution(code)) {
    const message =
      '실행할 코드가 없습니다. // ---------- 또는 # ---------- 사이에 풀이 코드를 작성해 주세요.';

    setOutput(message);
    setTestResults([]);
    toast.warning(message);
    return;
  }

  setIsRunning(true);
  setOutput('');
  setTestResults([]);

  try {
    const res = await runExamTestCases(problem.id, {
      language,
      code,
    });

    const failedCases = res.failedCases || [];

    if (res.status === 'accepted') {
      setOutput('공개 테스트케이스를 모두 통과했습니다.');

      setTestResults(
        testCases.map((tc, i) => ({
          id: i + 1,
          input: tc.input,
          expected: tc.expectedOutput || tc.expected,
          actual: tc.expectedOutput || tc.expected,
          passed: true,
          reason: '통과',
        }))
      );

      return;
    }

    setOutput(
      `테스트케이스 실행 결과: ${res.status}\n` +
        (res.stderr ? `오류 메시지:\n${res.stderr}` : '')
    );

    setTestResults(
      testCases.map((tc, i) => {
        const failed = failedCases.find(
          (fc) =>
            String(fc.input || '').trim() === String(tc.input || '').trim()
        );

        return {
          id: i + 1,
          input: tc.input,
          expected: tc.expectedOutput || tc.expected,
          actual: failed ? failed.actual_output || failed.actualOutput || '' : '-',
          passed: failed ? false : 'unknown',
          reason: failed ? failed.reason : '채점 중단 이후 미확인',
        };
      })
    );
  } catch (err) {
    console.error(err);

    const message =
      err.response?.data?.message ||
      '테스트케이스 실행 중 오류가 발생했습니다. 백엔드 서버와 실행 환경을 확인하세요.';

    setOutput(message);
    toast.error(message);
  } finally {
    setIsRunning(false);
  }
};


// handleSubmit 함수만 아래로 교체

const handleSubmit = async () => {
  if (hasSubmitted || submitLockRef.current) {
    toast.error('이미 제출한 문제입니다.');
    return;
  }

  if (!hasWrittenSolution(code)) {
    const message =
      '제출할 코드가 없습니다. // ---------- 또는 # ---------- 사이에 풀이 코드를 작성해 주세요.';

    setOutput(message);
    toast.error(message);
    return;
  }

  submitLockRef.current = true;
  setIsRunning(true);
  setIsSubmitting(true);
  setSubmitResult(null);

  try {
    const savedUser = JSON.parse(sessionStorage.getItem('user') || '{}');

    const studentId = user?.studentId || savedUser.studentId;

    const studentName =
      user?.name ||
      user?.studentName ||
      savedUser.name ||
      savedUser.studentName;

    const res = await submitExam({
      examId: problem.id,
      studentId,
      studentName,
      language,
      code,
    });

    if (res.duplicated) {
      setHasSubmitted(true);
      setOutput(res.message || '이미 제출한 문제입니다.');
      toast.error(res.message || '이미 제출한 문제입니다.');
      return;
    }

    const ai =
      res.ai_feedback ||
      res.aiFeedback ||
      res.submission?.aiFeedback ||
      null;

    setSubmitResult({
      success: true,
      message: res.message || '제출 완료',
      submission: res.submission,
      aiFeedback: ai,
    });

    sessionStorage.setItem(
      `result-${problem.id}`,
      JSON.stringify({
        isCorrect: ai?.error_type === 'accepted',
        errorType: ai?.error_type,
        summary: ai?.summary,
        wrongReason: ai?.wrong_reason,
        solutionDirection: ai?.solution_direction,
        improvement: ai?.improvement_feedback,
      })
    );

    sessionStorage.setItem(`solved-${problem.id}`, 'true');

    setHasSubmitted(true);
    setOutput('제출이 완료되었습니다. 아래 결과를 확인하세요.');

    // =========================
    // 전체 제출 기반 랭킹 계산
    // =========================

    const allSubmissions = await getAllSubmissions();

    const latestSubmissionMap = new Map();

    (allSubmissions || []).forEach((item) => {
      if (!item.studentId || item.examId == null) return;

      const key = `${item.studentId}__${item.examId}`;
      const prev = latestSubmissionMap.get(key);

      const currentTime = new Date(item.submitTime || 0).getTime();
      const prevTime = new Date(prev?.submitTime || 0).getTime();

      if (!prev || currentTime >= prevTime) {
        latestSubmissionMap.set(key, item);
      }
    });

    const totalProblemCount = problems.length;

    const maxScore = problems.reduce(
      (sum, p) => sum + Number(p.point ?? 0),
      0
    );

    const studentMap = new Map();

    latestSubmissionMap.forEach((item) => {
      const sid = item.studentId;

      if (!studentMap.has(sid)) {
        studentMap.set(sid, {
          studentId: sid,
          studentName: item.studentName || '-',
          score: 0,
          correctCount: 0,
          totalProblems: totalProblemCount,
        });
      }

      const row = studentMap.get(sid);

      const isCorrect =
        item.correct === true ||
        item.isCorrect === true ||
        String(item.status || '').toLowerCase().includes('accept');

      if (isCorrect) {
        row.correctCount += 1;

        const examProblem = problems.find(
          (p) => String(p.id) === String(item.examId)
        );

        row.score += Number(examProblem?.point ?? 0);
      }
    });

    const sortedRankings = Array.from(studentMap.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return String(a.studentName).localeCompare(String(b.studentName), 'ko');
    });

    const rankings = [];

    sortedRankings.forEach((item, index) => {
      const prevRank = rankings[index - 1];

      const rank =
        index > 0 && sortedRankings[index - 1].score === item.score
          ? prevRank.rank
          : index + 1;

      rankings.push({
        ...item,
        rank,
      });
    });

    const myRank = rankings.find(
      (item) => String(item.studentId) === String(studentId)
    );

    const myScore = myRank?.score ?? 0;
    const myCorrectCount = myRank?.correctCount ?? 0;

    setSubmissionSummary({
      rankings,
      myRank,

      earnedScore: myScore,
      maxScore,

      correctCount: myCorrectCount,
      totalProblems: totalProblemCount,

      totalFeedback:
        ai?.summary ||
        res.totalFeedback ||
        '피드백이 없습니다.',

      aiFeedback: ai,

      testResults: res.testResults || [],
    });

    setShowResultModal(true);
  } catch (err) {
    console.error(err);

    submitLockRef.current = false;

    setSubmitResult({
      success: false,
      message:
        err.response?.data?.message ||
        '제출 실패',
    });
  } finally {
    setIsRunning(false);
    setIsSubmitting(false);
  }
};
  if (!problem) {
    return (
      <div className="problem-not-found">
        <h2>문제를 찾을 수 없습니다.</h2>
        <button onClick={() => navigate('/')}>목록으로 돌아가기</button>
      </div>
    );
  }

  const diffMap = {
    easy: { label: '쉬움', cls: 'tag-easy' },
    medium: { label: '보통', cls: 'tag-medium' },
    hard: { label: '어려움', cls: 'tag-hard' },
    쉬움: { label: '쉬움', cls: 'tag-easy' },
    보통: { label: '보통', cls: 'tag-medium' },
    어려움: { label: '어려움', cls: 'tag-hard' },
  };

  const closeResultModal = () => {
  setShowResultModal(false);

  setExamStarted(false);

  clearInterval(timerRef.current);

  exitFullscreen();

  navigate('/');
};

  return (
    <div className={`problem-page ${examStarted ? 'exam-mode' : ''}`}>
      {isSubmitting && (
        <LoadingOverlay text="코드를 제출하고 AI가 분석 중입니다..." />
      )}

      {warningVisible && (
        <div className="exam-warning-overlay">
          <div className="exam-warning-box">
            <div className="warning-icon">⚠️</div>
            <h2>부정행위 경고</h2>
            <p>
              다른 창이나 탭으로 이동이 감지되었습니다.
              <br />
              시험 중에는 다른 창으로 이동할 수 없습니다.
              <br />
              <strong>경고 횟수: {warningCount}회</strong>
            </p>
            <button onClick={handleWarningClose}>확인 (전체화면으로 복귀)</button>
          </div>
        </div>
      )}

      {exitConfirm && (
        <div className="exam-warning-overlay">
          <div className="exam-warning-box">
            <div className="warning-icon">🚪</div>
            <h2>시험 종료</h2>
            <p>
              시험을 종료하시겠습니까?
              <br />
              작성한 코드는 저장됩니다.
            </p>
            <div className="confirm-buttons">
              <button className="btn-cancel" onClick={cancelExit}>
                계속 풀기
              </button>
              <button className="btn-exit" onClick={confirmExit}>
                시험 종료
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="exam-header">
        <div className="exam-header-left">
          {!examStarted ? (
            <button className="btn-back" onClick={() => navigate('/')}>
              목록
            </button>
          ) : (
            <button className="btn-back exam-exit" onClick={handleExitExam}>
              시험 종료
            </button>
          )}

          <div className="exam-problem-info">
            <span className="exam-number">{problem.number}</span>
            <span className="exam-title">{problem.title}</span>
            <span className={`difficulty-badge ${diffMap[problem.difficulty]?.cls || 'tag-easy'}`}>
              {diffMap[problem.difficulty]?.label || '쉬움'}
            </span>
          </div>
        </div>

        <div className="exam-header-right">
          {examStarted && (
            <>
              <div className="exam-timer">{formatTime(timer)}</div>
              {warningCount > 0 && (
                <div className="warning-badge">⚠️ 경고 {warningCount}회</div>
              )}
            </>
          )}

          {!examStarted && (
            <button className="btn-start-exam" onClick={startExam}>
              시험 시작
            </button>
          )}
        </div>
      </div>

      {!examStarted && (
        <div className="pre-exam-banner">
          <div className="pre-exam-content">
            <div className="pre-exam-icon">🔒</div>
            <h3>시험을 시작하면 전체화면으로 전환됩니다</h3>
            <p>시험 중 다른 창 이동, 탭 전환이 감지되면 경고가 발생합니다.</p>
            <button className="btn-start-exam-large" onClick={startExam}>
              시험 시작하기
            </button>
          </div>
        </div>
      )}

      <div className={`editor-layout ${!examStarted ? 'blurred' : ''}`}>
        <div className="left-panel">
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              문제 설명
            </button>

            <button
              className={`panel-tab ${activeTab === 'testcases' ? 'active' : ''}`}
              onClick={() => setActiveTab('testcases')}
            >
              테스트 케이스
            </button>
          </div>

          <div className="panel-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <div className="problem-meta">
                  <span className="meta-item">시간 제한: {problem.timeLimit}ms</span>

                  <div className="meta-tags">
                    {(problem.tags || []).map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="description-text">
                  {(problem.description || '').split('\n').map((line, i) => {
                    if (line.startsWith('```')) return null;

                    if (line.startsWith('**')) {
                      return (
                        <h4 key={i} className="desc-heading">
                          {line.replace(/\*\*/g, '')}
                        </h4>
                      );
                    }

                    if (line.startsWith('- ')) {
                      return (
                        <li key={i} className="desc-li">
                          {line.slice(2)}
                        </li>
                      );
                    }

                    if (line.trim() === '') return <br key={i} />;

                    return (
                      <p key={i} className="desc-p">
                        {line}
                      </p>
                    );
                  })}
                </div>
		{problem.constraints && problem.constraints.trim() && (
  		<div className="constraint-box">
    		<h4 className="desc-heading">제한사항</h4>
    		{(problem.constraints || '').split('\n').map((line, i) => {
      		if (line.trim() === '') return <br key={i} />;

      		return (
        		<p key={i} className="desc-p">
          		{line}
        		</p>
      		);
    		})}
  		</div>
		)}
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="testcases-content">
                {testCaseLoading ? (
                  <div className="empty-state">
                    테스트케이스를 불러오는 중입니다...
                  </div>
                ) : testCases.length === 0 ? (
                  <div className="empty-state">
                    등록된 테스트케이스가 없습니다.
                  </div>
                ) : (
                  testCases.map((tc, i) => {
                    const expectedValue = tc.expectedOutput || tc.expected || tc.output || '';

                    return (
                      <div key={tc.id || i} className="testcase-card">
                        <div className="testcase-header">
                          <span className="testcase-num">테스트 {i + 1}</span>

                          {testResults[i] && (
                            <span
                              className={`testcase-result ${
                                testResults[i].passed === true
                                  ? 'passed'
                                  : testResults[i].passed === false
                                  ? 'failed'
				  : testResults[i].passed === 'preview'
				  ? 'preview'
				  : 'pending'
                              }`}
                            >
                              {testResults[i].passed === true
                                ? '✓ 통과'
                                : testResults[i].passed === false
                                ? '✗ 실패'
				: testResults[i].passed === 'preview'
				? '서버 채점 전'
				: testResults[i].passed === 'unknown'
				? '미확인'
				: '대기'}
                            </span>
                          )}
                        </div>

                        <div className="testcase-row">
                          <span className="tc-label">입력</span>
                          <code className="tc-value">{tc.input}</code>
                        </div>

                        <div className="testcase-row">
                          <span className="tc-label">기대값</span>
                          <code className="tc-value">{expectedValue}</code>
                        </div>

                        {tc.description && (
                          <div className="testcase-row">
                            <span className="tc-label">설명</span>
                            <code className="tc-value">{tc.description}</code>
                          </div>
                        )}

                        {testResults[i] && (
                          <div className="testcase-row">
                            <span className="tc-label">실제값</span>
                            <code className={`tc-value ${testResults[i].passed === false ? 'tc-error' : ''}`}>
                              {testResults[i].actual}
                            </code>
                          </div>
                        )}

                        {testResults[i]?.reason && (
                          <div className="testcase-row">
                            <span className="tc-label">설명</span>
                            <code className={`tc-value ${testResults[i].passed === false ? 'tc-error' : ''}`}>
                              {testResults[i].reason}
                            </code>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        <div className="right-panel">
          <div className="editor-toolbar">
            <div className="lang-selector">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  className={`lang-btn ${language === lang.id ? 'active' : ''}`}
                  onClick={() => setLanguage(lang.id)}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="editor-actions">
              <button
                className="btn-reset"
                onClick={() => {
                  localStorage.removeItem(`codetest-code-${problem.id}-${language}`);
                  setCode(problem.starterCode?.[language] || '');
                  setOutput('현재 언어 코드가 초기화되었습니다.');
                  setTestResults([]);
                }}
              >
                초기화
              </button>
            </div>
          </div>

          <div className="editor-container">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                tabSize: 2,
                wordWrap: 'on',
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          <div className="output-panel">
            <div className="output-header">
              <span className="output-title">결과</span>

              {submitResult && (
                <span className={`submit-result ${submitResult.success ? 'success' : 'fail'}`}>
                  {submitResult.success ? '✓ 제출 완료' : '✗ 제출 실패'}
                </span>
              )}
            </div>

            <div className="output-content">
              {output ? (
                <pre className="output-text">{output}</pre>
              ) : (
                <span className="output-placeholder">
                  실행 또는 제출 결과가 여기에 표시됩니다.
                </span>
              )}

              {submitResult && (
                <>
                  <div className={`submit-message ${submitResult.success ? 'success' : 'fail'}`}>
                    {submitResult.message}
                  </div>

                  {submitResult.submission && (
                    <div className="result-info-box">
                      <p><strong>제출 번호:</strong> {submitResult.submission.id}</p>
                      <p><strong>언어:</strong> {submitResult.submission.language}</p>
                      <p><strong>제출자:</strong> {submitResult.submission.studentName}</p>
                      <p><strong>제출 시간:</strong> {submitResult.submission.submitTime}</p>
                    </div>
                  )}

                  {submitResult.aiFeedback && (
                    <div className="ai-feedback-box">
                      <h4>AI 피드백</h4>
                      <p><strong>오류 유형:</strong> {submitResult.aiFeedback.error_type}</p>
                      <p><strong>요약:</strong> {submitResult.aiFeedback.summary}</p>
                      <p><strong>오류 원인:</strong> {submitResult.aiFeedback.wrong_reason}</p>
                      <p><strong>해결 방향:</strong> {submitResult.aiFeedback.solution_direction}</p>
                      <p><strong>개선 피드백:</strong> {submitResult.aiFeedback.improvement_feedback}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="action-bar">
            <button
              className="btn-run"
              onClick={runCode}
              disabled={isRunning || !examStarted}
            >
              {isRunning ? '실행 중...' : '실행'}
            </button>

<button
  className="btn-submit"
  onClick={handleSubmit}
  disabled={isRunning || isSubmitting || !examStarted || !hasWrittenSolution(code) || hasSubmitted}
>
  {hasSubmitted ? '제출 완료' : '제출'}
</button>
          </div>
        </div>
      </div>

      {showResultModal && submissionSummary && (
  <div className="submit-result-overlay">
    <div className={`submit-result-modal ${theme}`}>

      <div className="submit-result-header">
        <h2>제출 결과</h2>

        <button
          className="submit-result-close"
          onClick={closeResultModal}
        >
          ✕
        </button>
      </div>

      <div className="submit-result-top-grid">

        <div className="submit-result-card">
          <span>내 점수</span>
          <strong>
            {submissionSummary.earnedScore}
            /
            {submissionSummary.maxScore}
          </strong>
        </div>

        <div className="submit-result-card">
          <span>정답 수</span>

          <strong>
            {submissionSummary.correctCount}
            /
            {submissionSummary.totalProblems}
          </strong>
        </div>

        <div className="submit-result-card">
          <span>내 순위</span>

          <strong>
            {submissionSummary.myRank?.rank || '-'}등
          </strong>
        </div>

      </div>

      <div className="submit-feedback-box">
        <h3>전체 피드백</h3>

        <p>
          {submissionSummary.totalFeedback}
        </p>
      </div>

      <div className="submit-ranking-section">

        <h3>점수 랭킹</h3>

        <table className="submit-ranking-table">

          <thead>
            <tr>
              <th>순위</th>
              <th>학번</th>
              <th>점수</th>
              <th>정답</th>
            </tr>
          </thead>

          <tbody>

            {submissionSummary.rankings.map((item) => (
              <tr
                key={item.studentId}
                className={
                  String(item.studentId) ===
                  String(user?.studentId)
                    ? 'my-ranking-row'
                    : ''
                }
              >
                <td>{item.rank}</td>

                <td>{item.studentId}</td>

                <td>{item.score}</td>

                <td>
                  {item.correctCount}
                  /
                  {item.totalProblems}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {submissionSummary.aiFeedback && (
        <div className="ai-feedback-box modal-feedback">

          <h3>AI 상세 피드백</h3>

          <p>
            <strong>오류 유형:</strong>
            {' '}
            {submissionSummary.aiFeedback.error_type}
          </p>

          <p>
            <strong>요약:</strong>
            {' '}
            {submissionSummary.aiFeedback.summary}
          </p>

          <p>
            <strong>오류 원인:</strong>
            {' '}
            {submissionSummary.aiFeedback.wrong_reason}
          </p>

          <p>
            <strong>해결 방향:</strong>
            {' '}
            {submissionSummary.aiFeedback.solution_direction}
          </p>

          <p>
            <strong>개선 피드백:</strong>
            {' '}
            {submissionSummary.aiFeedback.improvement_feedback}
          </p>

        </div>
      )}

    </div>
  </div>
)}
    </div>
  );
}
