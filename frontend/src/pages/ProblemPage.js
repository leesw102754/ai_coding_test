import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useProblem } from '../context/ProblemContext';
import { useTheme } from '../context/ThemeContext';
import './ProblemPage.css';
import { submitExam } from '../api/problemApi';
import LoadingOverlay from '../components/LoadingOverlay';

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
  const { problems } = useProblem();
  const { theme } = useTheme();

  const problem = problems.find((p) => p.id === parseInt(id, 10));

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [exitConfirm, setExitConfirm] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [submitResult, setSubmitResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);
  const warningRef = useRef(false);

  useEffect(() => {
    const solved = sessionStorage.getItem(`solved-${id}`);

    if (solved === 'true') {
      alert('이미 제출한 문제입니다.');
      navigate('/');
    }
  }, [id, navigate]);

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

  const startExam = () => {
    if (problem) {
      LANGUAGES.forEach((lang) => {
        localStorage.removeItem(`codetest-code-${problem.id}-${lang.id}`);
      });

      setCode(problem.starterCode?.[language] || '');
    }

    setExamStarted(true);
    setTimer(0);
    enterFullscreen();
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

  // 로컬 실행 미리보기
  const runCode = () => {
    setIsRunning(true);
    setOutput('');
    setTestResults([]);

    setTimeout(() => {
      try {
        setOutput(
          `[${language.toUpperCase()}] 로컬 미리보기입니다.\n실제 테스트케이스 검증 및 채점은 제출 후 서버에서 처리됩니다.`
        );

        setTestResults(
          problem.testCases.map((tc, i) => ({
            id: i + 1,
            input: tc.input,
            expected: tc.expected,
            actual: '미리보기 완료 (실제 채점은 서버에서 처리)',
            passed: 'preview',
          }))
        );
      } catch (err) {
        setOutput(`실행 오류: ${err.message}`);
      }

      setIsRunning(false);
    }, 500);
  };

  // 실제 제출
  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('코드를 입력하세요.');
      return;
    }

    setIsRunning(true);
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const savedUser = JSON.parse(sessionStorage.getItem('user') || '{}');

	const res = await submitExam({
 	 examId: problem.id,
 	 studentId: savedUser.studentId,
 	 studentName: savedUser.name,
	  language,
 	 code,
	});

      setSubmitResult({
        success: true,
        message: res.message || '제출 완료',
        submission: res.submission,
        aiFeedback: res.ai_feedback,
      });

      const ai = res.ai_feedback;
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
      setOutput('제출이 완료되었습니다. 아래 AI 피드백을 확인하세요.');
    } catch (err) {
      console.error(err);

      setSubmitResult({
        success: false,
        message: err.response?.data?.message || '제출 실패',
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

  // 🔥 추가 (한글 대응)
  쉬움: { label: '쉬움', cls: 'tag-easy' },
  보통: { label: '보통', cls: 'tag-medium' },
  어려움: { label: '어려움', cls: 'tag-hard' },
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
              {warningCount > 0 && <div className="warning-badge">⚠️ 경고 {warningCount}회</div>}
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
                    {problem.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="description-text">
                  {problem.description.split('\n').map((line, i) => {
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
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="testcases-content">
                {problem.testCases.map((tc, i) => (
                  <div key={i} className="testcase-card">
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
                              ? 'passed'
                              : 'pending'
                          }`}
                        >
                          {testResults[i].passed === true
                            ? '✓ 통과'
                            : testResults[i].passed === false
                            ? '✗ 실패'
                            : testResults[i].passed === 'preview'
                            ? '✓ 완료'
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
                      <code className="tc-value">{tc.expected}</code>
                    </div>

                    {testResults[i] && (
                      <div className="testcase-row">
                        <span className="tc-label">실제값</span>
                        <code className={`tc-value ${testResults[i].passed === false ? 'tc-error' : ''}`}>
                          {testResults[i].actual}
                        </code>
                      </div>
                    )}
                  </div>
                ))}
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
                <span className="output-placeholder">실행 또는 제출 결과가 여기에 표시됩니다.</span>
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
            <button className="btn-run" onClick={runCode} disabled={isRunning || !examStarted}>
              {isRunning ? '실행 중...' : '실행'}
            </button>

            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={isRunning || !examStarted || !code.trim()}
            >
              제출
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}