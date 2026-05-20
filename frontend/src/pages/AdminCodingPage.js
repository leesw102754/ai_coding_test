import { useEffect, useState } from 'react';
import {
  createExam,
  createTestCase,
  recommendAiTestCases,
  generateAiProblemDraft,
  getCategories,
  createCategory,
  deleteCategory,
} from '../api/problemApi';
import './AdminCodingPage.css';

export default function AdminCodingPage() {
  const [problemPrompt, setProblemPrompt] = useState('');
  const [problemSource, setProblemSource] = useState('manual');
  const [aiProblemLoading, setAiProblemLoading] = useState(false);

const [bulkCodingTopic, setBulkCodingTopic] = useState('');
const [bulkCodingEasyCount, setBulkCodingEasyCount] = useState(3);
const [bulkCodingMediumCount, setBulkCodingMediumCount] = useState(1);
const [bulkCodingHardCount, setBulkCodingHardCount] = useState(1);

const [bulkCodingEasyPoint, setBulkCodingEasyPoint] = useState(10);
const [bulkCodingMediumPoint, setBulkCodingMediumPoint] = useState(20);
const [bulkCodingHardPoint, setBulkCodingHardPoint] = useState(30);

const [bulkCodingLoading, setBulkCodingLoading] = useState(false);
const [bulkCodingResult, setBulkCodingResult] = useState(null);

const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [constraints, setConstraints] = useState('');
const [difficulty, setDifficulty] = useState('easy');
const [categories, setCategories] = useState([]);
const [selectedCategoryId, setSelectedCategoryId] = useState('');
const [newCategoryTitle, setNewCategoryTitle] = useState('');

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

const loadCategories = async (preferredId = '') => {
  try {
    const data = await getCategories();
    const list = data || [];

    setCategories(list);

    if (list.length === 0) {
      setSelectedCategoryId('');
      return;
    }

    const preferredExists = preferredId
      ? list.some((category) => String(category.id) === String(preferredId))
      : false;

    if (preferredExists) {
      setSelectedCategoryId(String(preferredId));
      return;
    }

    const currentExists = selectedCategoryId
      ? list.some((category) => String(category.id) === String(selectedCategoryId))
      : false;

    if (!currentExists) {
      setSelectedCategoryId(String(list[0].id));
    }
  } catch (err) {
    console.error('카테고리 조회 실패:', err);
    setCategories([]);
    setSelectedCategoryId('');
  }
};

useEffect(() => {
  loadCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

const handleCreateCategory = async () => {
  if (!newCategoryTitle.trim()) {
    setMessage('생성할 시험 폴더명을 입력하세요.');
    return;
  }

  try {
    setMessage('');

    const created = await createCategory({
      title: newCategoryTitle.trim(),
    });

    setNewCategoryTitle('');
    await loadCategories(created?.id);

    setMessage('시험 폴더가 생성되었습니다.');
  } catch (err) {
    console.error('시험 폴더 생성 실패:', err);
    setMessage(
      err.response?.data?.message ||
        err.response?.data?.detail ||
        '시험 폴더 생성에 실패했습니다.'
    );
  }
};

const handleDeleteCategory = async () => {
  if (!selectedCategoryId) {
    setMessage('삭제할 시험 폴더를 선택하세요.');
    return;
  }

  const selectedCategory = categories.find(
    (category) => String(category.id) === String(selectedCategoryId)
  );

  const confirmed = window.confirm(
    `"${selectedCategory?.title || '선택한 폴더'}" 폴더를 삭제하시겠습니까?\n폴더 안의 문제, 테스트케이스, 제출 내역도 함께 삭제될 수 있습니다.`
  );

  if (!confirmed) return;

  try {
    setMessage('');

    await deleteCategory(selectedCategoryId);
    await loadCategories();

    setMessage('시험 폴더가 삭제되었습니다.');
  } catch (err) {
    console.error('시험 폴더 삭제 실패:', err);
    setMessage(
      err.response?.data?.message ||
        err.response?.data?.detail ||
        '시험 폴더 삭제에 실패했습니다.'
    );
  }
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
setConstraints(res.constraints || '');
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

const difficultyLabelMap = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

const handleBulkCodingGenerate = async () => {
  console.log('코딩 문제 대량 생성 버튼 클릭');

  if (!selectedCategoryId) {
    setMessage('시험 폴더를 먼저 선택하세요.');
    return;
  }

  if (!bulkCodingTopic.trim()) {
    setMessage('대량 생성할 코딩 문제 주제를 입력하세요.');
    return;
  }

  const easyCount = Number(bulkCodingEasyCount) || 0;
  const mediumCount = Number(bulkCodingMediumCount) || 0;
  const hardCount = Number(bulkCodingHardCount) || 0;

  const easyPoint = Number(bulkCodingEasyPoint) || 10;
  const mediumPoint = Number(bulkCodingMediumPoint) || 20;
  const hardPoint = Number(bulkCodingHardPoint) || 30;

  const totalCount = easyCount + mediumCount + hardCount;

  if (totalCount <= 0) {
    setMessage('생성할 문제 개수를 1개 이상 입력하세요.');
    return;
  }

  if (totalCount > 10) {
    setMessage('코딩 문제는 한 번에 최대 10개까지만 생성하세요.');
    return;
  }

  const confirmed = window.confirm(
    [
      '코딩 문제를 대량 생성하고 바로 저장합니다.',
      '',
      `주제: ${bulkCodingTopic.trim()}`,
      `쉬움: ${easyCount}개 / ${easyPoint}점`,
      `보통: ${mediumCount}개 / ${mediumPoint}점`,
      `어려움: ${hardCount}개 / ${hardPoint}점`,
      '',
      '계속 진행할까요?',
    ].join('\n')
  );

  if (!confirmed) {
    return;
  }

  const jobs = [
    ...Array.from({ length: easyCount }, () => ({
      difficulty: 'easy',
      point: easyPoint,
    })),
    ...Array.from({ length: mediumCount }, () => ({
      difficulty: 'medium',
      point: mediumPoint,
    })),
    ...Array.from({ length: hardCount }, () => ({
      difficulty: 'hard',
      point: hardPoint,
    })),
  ];

  let successCount = 0;
  let failCount = 0;
  const failMessages = [];

  try {
    setBulkCodingLoading(true);
    setBulkCodingResult(null);
    setMessage('코딩 문제 대량 생성을 시작합니다...');

    for (let i = 0; i < jobs.length; i += 1) {
      const job = jobs[i];
      const difficultyLabel =
        difficultyLabelMap[job.difficulty] || job.difficulty;

      try {
        setMessage(
          `AI 문제 생성 중... ${i + 1}/${jobs.length} (${difficultyLabel})`
        );

        const draft = await generateAiProblemDraft({
          prompt: [
            `${bulkCodingTopic.trim()} 주제로 코딩 시험 문제를 1개 생성해줘.`,
            `난이도는 ${difficultyLabel} 수준으로 해줘.`,
            `${i + 1}번째 문제이며, 이전 문제와 중복되지 않게 해줘.`,
            '문제 제목, 문제 설명, 제한사항, 테스트케이스를 포함해줘.',
            '테스트케이스는 최소 3개 이상 생성해줘.',
            '학생은 표준입력으로 값을 받고 표준출력으로 답을 출력하는 형태로 풀 수 있어야 해.',
          ].join(' '),
        });

        console.log('AI 생성 결과:', draft);

        if (!draft || !draft.title || !draft.description) {
          throw new Error('AI 생성 결과에 제목 또는 설명이 없습니다.');
        }

        const aiCases = dedupeTestCases(
          (draft.testCases || []).map((tc) => ({
            input: tc.input || '',
            expectedOutput: tc.expectedOutput || '',
            source: 'ai',
            description: tc.description || 'AI 생성 케이스',
          }))
        );

        if (aiCases.length === 0) {
          throw new Error('AI 생성 결과에 테스트케이스가 없습니다.');
        }

        setMessage(
          `문제 저장 중... ${i + 1}/${jobs.length} (${draft.title})`
        );

        const createdExam = await createExam({
          categoryId: Number(selectedCategoryId),
          title: draft.title.trim(),
          description: draft.description.trim(),
          constraints: draft.constraints || '',
          difficulty: job.difficulty,
          point: job.point,
          source: 'ai',
        });

        console.log('저장된 문제:', createdExam);

        const examId = createdExam?.id;

        if (!examId) {
          throw new Error('문제 저장 후 examId를 받지 못했습니다.');
        }

        for (const tc of aiCases) {
          await createTestCase({
            examId,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            source: tc.source,
            description: tc.description,
          });
        }

        successCount += 1;
      } catch (err) {
        console.error('코딩 문제 대량 생성 개별 실패:', err);

        failCount += 1;
        failMessages.push(
          `${i + 1}번째 문제 실패: ${
            err.response?.data?.message ||
            err.response?.data?.detail ||
            err.message ||
            '알 수 없는 오류'
          }`
        );
      }

      setMessage(
        `코딩 문제 대량 생성 중... ${i + 1}/${jobs.length} 처리 완료`
      );
    }

setBulkCodingResult({
  successCount,
  failCount,
  totalCount: jobs.length,
  failMessages,
});

setMessage(
  `코딩 문제 대량 생성 완료: 성공 ${successCount}개, 실패 ${failCount}개`
);
  } catch (err) {
    console.error('코딩 문제 대량 생성 전체 실패:', err);

    setMessage(
      err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        '코딩 문제 대량 생성 중 오류가 발생했습니다.'
    );
  } finally {
    setBulkCodingLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

if (!selectedCategoryId) {
  setMessage('문제를 등록할 시험 폴더를 먼저 선택하세요.');
  return;
}


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
  categoryId: Number(selectedCategoryId),
  title: title.trim(),
  description: description.trim(),
  constraints: constraints.trim(),
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
setConstraints('');
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
{bulkCodingLoading && (
  <div className="ai-loading-overlay">
    <div className="ai-loading-modal">
      <div className="ai-loading-spinner" />

      <h3>코딩 문제 대량 생성 중</h3>

      <p>
        AI가 코딩 문제와 테스트케이스를 생성하고 저장하는 중입니다.
      </p>

      <small>
        문제 수에 따라 시간이 걸릴 수 있습니다. 잠시만 기다려 주세요.
      </small>
    </div>
  </div>
)}
      <div className="admincodingpage-inner">
        <h2 className="admincodingpage-title">코드형 문제 등록</h2>
        <p className="admincodingpage-subtitle">
          코드 작성형 문제와 테스트케이스를 함께 등록할 수 있습니다.
        </p>

<div className="admincodingpage-category-box">
  <div className="admincodingpage-form-group">
    <label className="admincodingpage-label">시험 폴더</label>
    <div className="admincodingpage-category-row">
      <select
        className="admincodingpage-input"
        value={selectedCategoryId}
        onChange={(e) => setSelectedCategoryId(e.target.value)}
      >
        {categories.length === 0 ? (
          <option value="">등록된 폴더가 없습니다</option>
        ) : (
          categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))
        )}
      </select>

      <button
        type="button"
        className="admincodingpage-delete-category-btn"
        onClick={handleDeleteCategory}
        disabled={!selectedCategoryId}
      >
        폴더 삭제
      </button>
    </div>
  </div>

  <div className="admincodingpage-form-group">
    <label className="admincodingpage-label">새 시험 폴더 생성</label>
    <div className="admincodingpage-category-row">
      <input
        type="text"
        className="admincodingpage-input"
        placeholder="예: 2026년 1학기 중간고사"
        value={newCategoryTitle}
        onChange={(e) => setNewCategoryTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleCreateCategory();
          }
        }}
      />

      <button
        type="button"
        className="admincodingpage-create-category-btn"
        onClick={handleCreateCategory}
      >
        폴더 생성
      </button>
    </div>
  </div>
</div>

<div className="bulk-coding-box">
  <h3>코딩 문제 대량 AI 생성</h3>
  <p>
    주제와 난이도별 개수/점수를 입력하면 코딩 문제와 테스트케이스를 자동 생성해 저장합니다.
  </p>

  <div className="admincodingpage-form-group">
    <label className="admincodingpage-label">대량 생성 주제</label>
    <input
      type="text"
      className="admincodingpage-input"
      value={bulkCodingTopic}
      onChange={(e) => setBulkCodingTopic(e.target.value)}
      placeholder="예: 배열 기초, 문자열 처리, 반복문, 조건문"
    />
  </div>

  <div className="bulk-coding-grid">
    <div className="admincodingpage-form-group">
      <label className="admincodingpage-label">쉬움 개수</label>
      <input
        type="number"
        min="0"
        max="10"
        className="admincodingpage-input"
        value={bulkCodingEasyCount}
        onChange={(e) => setBulkCodingEasyCount(e.target.value)}
      />
    </div>

    <div className="admincodingpage-form-group">
      <label className="admincodingpage-label">쉬움 점수</label>
      <input
        type="number"
        min="1"
        className="admincodingpage-input"
        value={bulkCodingEasyPoint}
        onChange={(e) => setBulkCodingEasyPoint(e.target.value)}
      />
    </div>

    <div className="admincodingpage-form-group">
      <label className="admincodingpage-label">보통 개수</label>
      <input
        type="number"
        min="0"
        max="10"
        className="admincodingpage-input"
        value={bulkCodingMediumCount}
        onChange={(e) => setBulkCodingMediumCount(e.target.value)}
      />
    </div>

    <div className="admincodingpage-form-group">
      <label className="admincodingpage-label">보통 점수</label>
      <input
        type="number"
        min="1"
        className="admincodingpage-input"
        value={bulkCodingMediumPoint}
        onChange={(e) => setBulkCodingMediumPoint(e.target.value)}
      />
    </div>

    <div className="admincodingpage-form-group">
      <label className="admincodingpage-label">어려움 개수</label>
      <input
        type="number"
        min="0"
        max="10"
        className="admincodingpage-input"
        value={bulkCodingHardCount}
        onChange={(e) => setBulkCodingHardCount(e.target.value)}
      />
    </div>

    <div className="admincodingpage-form-group">
      <label className="admincodingpage-label">어려움 점수</label>
      <input
        type="number"
        min="1"
        className="admincodingpage-input"
        value={bulkCodingHardPoint}
        onChange={(e) => setBulkCodingHardPoint(e.target.value)}
      />
    </div>
  </div>

  <button
    type="button"
    className="bulk-coding-button"
    onClick={handleBulkCodingGenerate}
    disabled={bulkCodingLoading || aiProblemLoading || loading}
  >

{bulkCodingResult && (
  <div
    className={`bulk-coding-result ${
      bulkCodingResult.failCount > 0 ? 'has-error' : 'success'
    }`}
  >
    <strong>
      코딩 문제 대량 생성 완료
    </strong>

    <p>
      전체 {bulkCodingResult.totalCount}개 중 성공{' '}
      {bulkCodingResult.successCount}개, 실패 {bulkCodingResult.failCount}개
    </p>

    {bulkCodingResult.failMessages?.length > 0 && (
      <ul>
        {bulkCodingResult.failMessages.slice(0, 5).map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    )}
  </div>
)}

    {bulkCodingLoading ? '코딩 문제 대량 생성 중...' : '코딩 문제 대량 생성'}
  </button>
</div>

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
  <label className="admincodingpage-label">제한사항</label>
  <textarea
    className="admincodingpage-textarea admincodingpage-constraint-textarea"
    placeholder={'예:\n-1000000 ≤ A, B ≤ 1000000\n출력은 정수 하나만 출력한다.'}
    value={constraints}
    onChange={(e) => {
      setConstraints(e.target.value);
      if (problemSource === 'ai') setProblemSource('ai_edited');
    }}
    rows={4}
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