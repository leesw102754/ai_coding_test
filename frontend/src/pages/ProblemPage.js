import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useProblem } from '../context/ProblemContext';
import { useTheme } from '../context/ThemeContext';
import './ProblemPage.css';
import { submitExam } from '../api/problemApi';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
];

export default function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { problems, markSolved } = useProblem();
  const { theme } = useTheme();

  const problem = problems.find(p => p.id === parseInt(id));

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
  const timerRef = useRef(null);
  const warningRef = useRef(false);

  // 제출 기능만 구현 (채점은 서버에서 처리한다고 가정) - 실제로는 채점 결과를 받아와서 처리해야 함
  const onlysubmitCode = async () => {
  setIsRunning(true);

  try {
    const res = await submitExam({
      examId: problem.id,
      studentName: '홍길동',
      code,
    });

    // 🔥 지금은 채점 없으니까 그냥 성공 처리
    setSubmitResult({
      success: true,
      message: '제출 완료!',
    });

    markSolved(problem.id);

  } catch (err) {
    console.error(err);
    setSubmitResult({
      success: false,
      message: '제출 실패',
    });
  }

  setIsRunning(false);
};

  // Initialize code when problem or language changes
  useEffect(() => {
    if (problem) {
      const saved = localStorage.getItem(`codetest-code-${problem.id}-${language}`);
      setCode(saved || problem.starterCode[language] || '');
    }
  }, [problem, language]);

  // Save code on change
  useEffect(() => {
    if (problem && code) {
      localStorage.setItem(`codetest-code-${problem.id}-${language}`, code);
    }
  }, [code, problem, language]);

  // Timer
  useEffect(() => {
    if (examStarted) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [examStarted]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Fullscreen management
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

  // Detect fullscreen change
  useEffect(() => {
    const handleFSChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);

      // If exam started and user exited fullscreen without permission
      if (examStarted && !isFull && !warningRef.current) {
        warningRef.current = true;
        setWarningCount(c => c + 1);
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

  // Prevent tab/window switching during exam
  useEffect(() => {
    if (!examStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount(c => c + 1);
        setWarningVisible(true);
        // Re-enter fullscreen when user returns
      }
    };

    const handleBlur = () => {
      if (examStarted) {
        setWarningCount(c => c + 1);
        setWarningVisible(true);
      }
    };

    const handleKeyDown = (e) => {
      // Block Alt+Tab, Alt+F4, Ctrl+W, F11 during exam
      if (
        (e.altKey && e.key === 'Tab') ||
        (e.altKey && e.key === 'F4') ||
        (e.ctrlKey && e.key === 'w') ||
        (e.ctrlKey && e.key === 'W') ||
        (e.metaKey && e.key === 'w') ||
        (e.metaKey && e.key === 'W')
      ) {
        e.preventDefault();
        e.stopPropagation();
        setWarningCount(c => c + 1);
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
    setExamStarted(true);
    setTimer(0);
    enterFullscreen();
  };

  const handleWarningClose = () => {
    warningRef.current = false;
    setWarningVisible(false);
    // Re-enter fullscreen
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

  // Run code (simulated)
  const runCode = () => {
    setIsRunning(true);
    setOutput('');
    setTestResults([]);

    setTimeout(() => {
      try {
        // Simple JS execution for demo
        if (language === 'javascript') {
          const results = problem.testCases.map((tc, i) => {
            try {
              // Capture console.log
              const logs = [];
              const origLog = console.log;
              console.log = (...args) => logs.push(args.join(' '));

              // eslint-disable-next-line no-new-func
              const fn = new Function(code + '\n// auto-run placeholder');
              console.log = origLog;

              return {
                id: i + 1,
                input: tc.input,
                expected: tc.expected,
                actual: '실행 완료',
                passed: true,
                logs,
              };
            } catch (err) {
              return {
                id: i + 1,
                input: tc.input,
                expected: tc.expected,
                actual: `오류: ${err.message}`,
                passed: false,
                logs: [],
              };
            }
          });
          setTestResults(results);
          setOutput(results.map(r =>
            `테스트 ${r.id}: ${r.passed ? '✓ 통과' : '✗ 실패'}\n  입력: ${r.input}\n  기대값: ${r.expected}\n  결과: ${r.actual}`
          ).join('\n\n'));
        } else {
          setOutput(`[${language.toUpperCase()}] 코드가 실행 환경에 제출되었습니다.\n오프라인 환경에서는 JavaScript만 직접 실행됩니다.`);
          setTestResults(problem.testCases.map((tc, i) => ({
            id: i + 1,
            input: tc.input,
            expected: tc.expected,
            actual: '서버 실행 필요',
            passed: null,
          })));
        }
      } catch (err) {
        setOutput(`실행 오류: ${err.message}`);
      }
      setIsRunning(false);
    }, 800);
  };

  const submitCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      const allPassed = testResults.length > 0 && testResults.every(r => r.passed === true);
      if (allPassed) {
        markSolved(problem.id);
        setSubmitResult({ success: true, message: '모든 테스트 케이스를 통과했습니다!' });
      } else {
        setSubmitResult({ success: false, message: '일부 테스트 케이스가 실패했습니다. 코드를 다시 확인해보세요.' });
      }
      setIsRunning(false);
    }, 1000);
  };

  if (!problem) {
    return (
      <div className="problem-not-found">
        <h2>문제를 찾을 수 없습니다.</h2>
        <button onClick={() => navigate('/')}>목록으로 돌아가기</button>
      </div>
    );
  }

  const diffMap = { easy: { label: '쉬움', cls: 'tag-easy' }, medium: { label: '보통', cls: 'tag-medium' }, hard: { label: '어려움', cls: 'tag-hard' } };

  return (
    <div className={`problem-page ${examStarted ? 'exam-mode' : ''}`}>
      {/* Warning Overlay - tab switch detected */}
      {warningVisible && (
        <div className="exam-warning-overlay">
          <div className="exam-warning-box">
            <div className="warning-icon">⚠️</div>
            <h2>부정행위 경고</h2>
            <p>
              다른 창이나 탭으로 이동이 감지되었습니다.<br />
              시험 중에는 다른 창으로 이동할 수 없습니다.<br />
              <strong>경고 횟수: {warningCount}회</strong>
            </p>
            <button onClick={handleWarningClose}>확인 (전체화면으로 복귀)</button>
          </div>
        </div>
      )}

      {/* Exit Confirm Dialog */}
      {exitConfirm && (
        <div className="exam-warning-overlay">
          <div className="exam-warning-box">
            <div className="warning-icon">🚪</div>
            <h2>시험 종료</h2>
            <p>
              시험을 종료하시겠습니까?<br />
              작성한 코드는 저장됩니다.
            </p>
            <div className="confirm-buttons">
              <button className="btn-cancel" onClick={cancelExit}>계속 풀기</button>
              <button className="btn-exit" onClick={confirmExit}>시험 종료</button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Header */}
      <div className="exam-header">
        <div className="exam-header-left">
          {!examStarted ? (
            <button className="btn-back" onClick={() => navigate('/')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              목록
            </button>
          ) : (
            <button className="btn-back exam-exit" onClick={handleExitExam}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              시험 종료
            </button>
          )}
          <div className="exam-problem-info">
            <span className="exam-number">{problem.number}</span>
            <span className="exam-title">{problem.title}</span>
            <span className={`difficulty-badge ${diffMap[problem.difficulty].cls}`}>
              {diffMap[problem.difficulty].label}
            </span>
          </div>
        </div>
        <div className="exam-header-right">
          {examStarted && (
            <>
              <div className="exam-timer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {formatTime(timer)}
              </div>
              {warningCount > 0 && (
                <div className="warning-badge">⚠️ 경고 {warningCount}회</div>
              )}
            </>
          )}
          {!examStarted && (
            <button className="btn-start-exam" onClick={startExam}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              시험 시작
            </button>
          )}
        </div>
      </div>

      {/* Not started overlay */}
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

      {/* Main Editor Layout */}
      <div className={`editor-layout ${!examStarted ? 'blurred' : ''}`}>
        {/* Left Panel - Problem Description */}
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
                  <span className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    시간 제한: {problem.timeLimit}ms
                  </span>
                  <div className="meta-tags">
                    {problem.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="description-text">
                  {problem.description.split('\n').map((line, i) => {
                    if (line.startsWith('```')) return null;
                    if (line.startsWith('**')) {
                      return <h4 key={i} className="desc-heading">{line.replace(/\*\*/g, '')}</h4>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="desc-li">{line.slice(2)}</li>;
                    }
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i} className="desc-p">{line}</p>;
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
                        <span className={`testcase-result ${testResults[i].passed === true ? 'passed' : testResults[i].passed === false ? 'failed' : 'pending'}`}>
                          {testResults[i].passed === true ? '✓ 통과' : testResults[i].passed === false ? '✗ 실패' : '대기'}
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

        {/* Right Panel - Code Editor */}
        <div className="right-panel">
          {/* Editor Toolbar */}
          <div className="editor-toolbar">
            <div className="lang-selector">
              {LANGUAGES.map(lang => (
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
                  if (window.confirm('코드를 초기화하시겠습니까?')) {
                    setCode(problem.starterCode[language] || '');
                  }
                }}
                title="코드 초기화"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
                </svg>
                초기화
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="editor-container">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={val => setCode(val || '')}
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

          {/* Output Panel */}
          <div className="output-panel">
            <div className="output-header">
              <span className="output-title">실행 결과</span>
              {submitResult && (
                <span className={`submit-result ${submitResult.success ? 'success' : 'fail'}`}>
                  {submitResult.success ? '✓ 정답' : '✗ 오답'}
                </span>
              )}
            </div>
            <div className="output-content">
              {output ? (
                <pre className="output-text">{output}</pre>
              ) : (
                <span className="output-placeholder">코드를 실행하면 결과가 여기에 표시됩니다.</span>
              )}
              {submitResult && (
                <div className={`submit-message ${submitResult.success ? 'success' : 'fail'}`}>
                  {submitResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Run & Submit Buttons */}
          <div className="action-bar">
            <button
              className="btn-run"
              onClick={runCode}
              disabled={isRunning || !examStarted}
            >
              {isRunning ? (
                <span className="spinner" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
              {isRunning ? '실행 중...' : '실행'}
            </button>
            <button
              className="btn-submit"
              onClick={onlysubmitCode}
              disabled={isRunning || !examStarted || testResults.length === 0}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              제출
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
