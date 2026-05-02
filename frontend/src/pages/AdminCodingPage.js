import { useState } from 'react';
import {
  createExam,
  createTestCase,
  recommendAiTestCases,
  generateAiProblemDraft,
} from '../api/problemApi';
import './AdminCodingPage.css';

export default function AdminCodingPage() {
  const [problemPrompt, setProblemPrompt] = useState('');
  const [problemSource, setProblemSource] = useState('manual');
  const [aiProblemLoading, setAiProblemLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');

  const [testInput, setTestInput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [testCases, setTestCases] = useState([]);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [point, setPoint] = useState(20);
  const dedupeTestCases = (cases) => {
    const seen = new Set();

    return cases.filter((tc) => {
      const input = (tc.input || '').trim();
      const expectedOutput = (tc.expectedOutput || '').trim();
      const key = `${input}__@@__${expectedOutput}`;

      if (!input || !expectedOutput) return false;
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  };

const handleAiProblemGenerate = async () => {
  if (!problemPrompt.trim()) {
    setMessage('AI 문제 생성을 위한 한 줄 요청을 입력하세요.');
    return;
  }

  try {
    setAiProblemLoading(true);
    setMessage('');

    const res = await generateAiProblemDraft({
      prompt: problemPrompt,
    });

    setTitle(res.title || '');
    setDescription(res.description || '');
    setDifficulty(res.difficulty || 'easy');
    setProblemSource('ai');

    const aiCases = (res.testCases || []).map((tc) => ({
      input: tc.input || '',
      expectedOutput: tc.expectedOutput || '',
      source: 'ai',
      description: tc.description || 'AI 생성 케이스',
    }));

    // 새 문제를 AI로 다시 생성하는 경우 기존 테스트케이스는 지우고 새 AI 케이스만 사용
    setTestCases(dedupeTestCases(aiCases));

    setMessage('AI 문제 초안과 테스트케이스를 불러왔습니다.');
  } catch (err) {
    console.error(err);
    setMessage(
      err.response?.data?.detail ||
        err.response?.data?.message ||
        'AI 문제 초안 생성에 실패했습니다.'
    );
  } finally {
    setAiProblemLoading(false);
  }
};

const handleAiRecommend = async () => {
  if (!title.trim() || !description.trim()) {
    setMessage('AI 추천을 받으려면 제목과 설명을 먼저 입력하세요.');
    return;
  }

  try {
    setAiLoading(true);
    setMessage('');

    const res = await recommendAiTestCases({
      title,
      description,
      difficulty,
    });

    const aiCases = (res.recommendedTestCases || [])
      .map((tc) => ({
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        source: 'ai',
        description: tc.description || 'AI 생성 케이스',
      }))
      .filter((tc) => tc.input.trim() && tc.expectedOutput.trim());

    if (aiCases.length === 0) {
      setMessage('AI가 테스트케이스를 생성하지 못했습니다.');
      return;
    }

    setTestCases((prev) => {
      const manualCases = prev.filter((tc) => tc.source !== 'ai');
      return dedupeTestCases([...manualCases, ...aiCases]);
    });

    setMessage(`AI 테스트케이스 ${aiCases.length}개를 추천받았습니다.`);
  } catch (err) {
    console.error(err);
    setMessage(
      err.response?.data?.detail ||
        err.response?.data?.message ||
        'AI 테스트케이스 추천에 실패했습니다.'
    );
  } finally {
    setAiLoading(false);
  }
};

const handleAddTestCase = () => {
  if (!testInput.trim() || !expectedOutput.trim()) {
    setMessage('테스트케이스 입력값과 기대 출력값을 모두 입력하세요.');
    return;
  }

  const newTestCase = {
    input: testInput,
    expectedOutput,
    source: 'manual',
    description: '수동 입력 케이스',
  };

  const duplicated = testCases.some(
    (tc) =>
      (tc.input || '').trim() === newTestCase.input.trim() &&
      (tc.expectedOutput || '').trim() === newTestCase.expectedOutput.trim()
  );

  if (duplicated) {
    setMessage('같은 입력값/기대 출력값의 테스트케이스가 이미 있습니다.');
    return;
  }

  setTestCases((prev) => [...prev, newTestCase]);
  setTestInput('');
  setExpectedOutput('');
  setMessage('수동 테스트케이스가 추가되었습니다.');
};

  const handleRemoveTestCase = (index) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage('제목과 설명을 입력하세요.');
      return;
    }

    if (testCases.length === 0) {
      setMessage('최소 1개 이상의 테스트케이스를 추가하세요.');
      return;
    }

const parsedPoint = Number(point);

if (!Number.isInteger(parsedPoint) || parsedPoint <= 0) {
  setMessage('점수는 1점 이상의 숫자로 입력하세요.');
  return;
}

try {
  setLoading(true);
  setMessage('');

  const createdExam = await createExam({
    title: title.trim(),
    description: description.trim(),
    difficulty,
    point: parsedPoint,
    source: problemSource,
  });

console.log('등록된 문제:', createdExam);

      const examId = createdExam.id;

      if (!examId) {
        throw new Error('문제 등록 후 examId를 받지 못했습니다.');
      }

      for (const tc of testCases) {
        await createTestCase({
          examId,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          source: tc.source,
          description: tc.description,
        });
      }

      setMessage('문제와 테스트케이스가 모두 등록되었습니다.');
      setProblemPrompt('');
      setProblemSource('manual');
	setTitle('');
	setDescription('');
	setDifficulty('easy');
	setPoint(20);
	setTestInput('');
	setExpectedOutput('');
	setTestCases([]);
    } catch (err) {
      console.error(err);
      setMessage('문제 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admincodingpage">
      <div className="admincodingpage-inner">
        <h2 className="admincodingpage-title">코드형 문제 등록</h2>
        <p className="admincodingpage-subtitle">
          코드 작성형 문제와 테스트케이스를 함께 등록할 수 있습니다.
        </p>

        <form className="admincodingpage-form" onSubmit={handleSubmit}>
          <div className="admincodingpage-form-group">
            <label className="admincodingpage-label">AI 문제 생성 요청</label>
            <input
              type="text"
              className="admincodingpage-input"
              placeholder="예: 두 정수의 합 문제 만들어줘"
              value={problemPrompt}
              onChange={(e) => setProblemPrompt(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="admincodingpage-add-btn"
              onClick={handleAiProblemGenerate}
              disabled={aiProblemLoading}
            >
              {aiProblemLoading ? 'AI 문제 생성 중...' : 'AI 문제 생성'}
            </button>
          </div>

          <div className="admincodingpage-form-group">
            <label className="admincodingpage-label">문제 제목</label>
            <input
              type="text"
              className="admincodingpage-input"
              placeholder="예: 두 수의 합 구하기"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (problemSource === 'ai') setProblemSource('ai_edited');
              }}
            />
          </div>

          <div className="admincodingpage-form-group">
            <label className="admincodingpage-label">문제 설명</label>
            <textarea
              className="admincodingpage-textarea"
              placeholder="예: 두 정수를 입력받아 합을 출력하시오"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                 if (problemSource === 'ai') setProblemSource('ai_edited');
              }}
              rows={8}
            />
          </div>

          <div className="admincodingpage-form-group">
            <label className="admincodingpage-label">난이도</label>
            <select
              className="admincodingpage-select"
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                if (problemSource === 'ai') setProblemSource('ai_edited');
              }}
            >
              <option value="easy">쉬움</option>
              <option value="medium">보통</option>
              <option value="hard">어려움</option>
            </select>
          </div>

<div className="admincodingpage-form-group">
  <label className="admincodingpage-label">점수</label>
<input
  type="number"
  min="1"
  className="admincodingpage-input"
  placeholder="예: 20"
  value={point}
  onChange={(e) => {
    setPoint(e.target.value);
    if (problemSource === 'ai') setProblemSource('ai_edited');
  }}
/>
</div>

          <div className="admincodingpage-form-group">
            <label className="admincodingpage-label">문제 생성 방식</label>
            <input
              type="text"
              className="admincodingpage-input"
              value={
  		problemSource === 'ai'
   		 ? 'AI 초안'
  		  : problemSource === 'ai_edited'
 		 ? 'AI 생성 후 수정됨'
		  : '수동 작성'
		}
              readOnly
            />
          </div>

          <div className="admincodingpage-testcase-section">
            <h3 className="admincodingpage-testcase-title">테스트케이스 추가</h3>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="admincodingpage-add-btn"
                onClick={handleAiRecommend}
                disabled={aiLoading}
              >
                {aiLoading ? 'AI 추천 생성 중...' : 'AI 테스트케이스 추천'}
              </button>
            </div>

            <div className="admincodingpage-form-group">
              <label className="admincodingpage-label">입력값</label>
              <textarea
                className="admincodingpage-textarea admincodingpage-testcase-textarea"
                placeholder={'예:\n1 2\n'}
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                rows={4}
              />
            </div>

            <div className="admincodingpage-form-group">
              <label className="admincodingpage-label">기대 출력값</label>
              <textarea
                className="admincodingpage-textarea admincodingpage-testcase-textarea"
                placeholder="예: 3"
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                rows={3}
              />
            </div>

            <button
              type="button"
              className="admincodingpage-add-btn"
              onClick={handleAddTestCase}
            >
              수동 테스트케이스 추가
            </button>

            {testCases.length > 0 && (
              <div className="admincodingpage-testcase-list">
                <h4 className="admincodingpage-testcase-list-title">
                  추가된 테스트케이스 목록
                </h4>

                {testCases.map((tc, index) => (
                  <div key={index} className="admincodingpage-testcase-item">
                    <div className="admincodingpage-testcase-item-row">
                      <strong>구분</strong>
                      <pre>{tc.source === 'ai' ? 'AI 추천' : '수동 입력'}</pre>
                    </div>

                    <div className="admincodingpage-testcase-item-row">
                      <strong>입력값</strong>
                      <pre>{tc.input}</pre>
                    </div>

                    <div className="admincodingpage-testcase-item-row">
                      <strong>기대 출력값</strong>
                      <pre>{tc.expectedOutput}</pre>
                    </div>

                    {tc.description ? (
                      <div className="admincodingpage-testcase-item-row">
                        <strong>설명</strong>
                        <pre>{tc.description}</pre>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      className="admincodingpage-remove-btn"
                      onClick={() => handleRemoveTestCase(index)}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {message && <div className="admincodingpage-message">{message}</div>}

          <button
            className="admincodingpage-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? '등록 중...' : '문제 등록'}
          </button>
        </form>
      </div>
    </div>
  );
}