import { useEffect, useState } from 'react';
import {
  createObjectiveQuestion,
  deleteObjectiveQuestion,
  generateAiObjectiveQuestion,
  getCategories,
  createCategory,
  deleteCategory,
  getObjectiveQuestionsByCategoryId,
} from '../api/problemApi';
import './AdminObjectivePage.css';

export default function AdminObjectivePage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newCategoryTitle, setNewCategoryTitle] = useState('');

  const [aiPrompt, setAiPrompt] = useState('');
  const [source, setSource] = useState('manual');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [choice1, setChoice1] = useState('');
  const [choice2, setChoice2] = useState('');
  const [choice3, setChoice3] = useState('');
  const [choice4, setChoice4] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [point, setPoint] = useState(10);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState('');

const loadCategories = async (preferredId = '') => {
  try {
    const data = await getCategories();
    const list = data || [];

    setCategories(list);

    if (list.length === 0) {
      setSelectedCategoryId('');
      setQuestions([]);
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
    setQuestions([]);
  }
};

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
    `"${selectedCategory?.title || '선택한 폴더'}" 폴더를 삭제하시겠습니까?\n폴더 안의 코딩 문제, 객관식 문제, 테스트케이스, 제출 내역도 함께 삭제될 수 있습니다.`
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

  const loadQuestions = async (categoryId) => {
    if (!categoryId) {
      setQuestions([]);
      return;
    }

    try {
      const data = await getObjectiveQuestionsByCategoryId(categoryId);
      setQuestions(data || []);
    } catch (err) {
      console.error('객관식 문제 조회 실패:', err);
      setQuestions([]);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadQuestions(selectedCategoryId);
  }, [selectedCategoryId]);

  const resetForm = () => {
    setSource('manual');
    setAiPrompt('');
    setTitle('');
    setDescription('');
    setChoice1('');
    setChoice2('');
    setChoice3('');
    setChoice4('');
    setCorrectAnswer('');
    setExplanation('');
    setDifficulty('easy');
    setPoint(10);
  };

  const handleAiGenerate = async () => {
    if (!selectedCategoryId) {
      setMessage('시험 폴더를 먼저 선택하세요.');
      return;
    }

    if (!aiPrompt.trim()) {
      setMessage('AI 객관식 생성 요청을 입력하세요.');
      return;
    }

    try {
      setAiLoading(true);
      setMessage('');

      const result = await generateAiObjectiveQuestion({
        categoryId: Number(selectedCategoryId),
        topic: aiPrompt.trim(),
        difficulty,
        point: Number(point) || 10,
      });

      setTitle(result.title || '');
      setDescription(result.description || '');
      setChoice1(result.choice1 || '');
      setChoice2(result.choice2 || '');
      setChoice3(result.choice3 || '');
      setChoice4(result.choice4 || '');
      setCorrectAnswer(String(result.correctAnswer || ''));
      setExplanation(result.explanation || '');
      setDifficulty(result.difficulty || difficulty);
      setPoint(result.point || point);
      setSource('ai');

      setMessage('AI 객관식 문제가 생성되었습니다. 내용을 확인 후 등록하세요.');
    } catch (err) {
      console.error('AI 객관식 생성 실패:', err);
      setMessage(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          'AI 객관식 문제 생성에 실패했습니다.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      setMessage('시험 폴더를 먼저 선택하세요.');
      return;
    }

    if (
      !title.trim() ||
      !description.trim() ||
      !choice1.trim() ||
      !choice2.trim() ||
      !choice3.trim() ||
      !choice4.trim() ||
      !correctAnswer
    ) {
      setMessage('제목, 설명, 보기 4개, 정답을 모두 입력하세요.');
      return;
    }

    const parsedPoint = Number(point);

    if (!parsedPoint || parsedPoint <= 0) {
      setMessage('점수는 1점 이상이어야 합니다.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      await createObjectiveQuestion({
        categoryId: Number(selectedCategoryId),
        title: title.trim(),
        description: description.trim(),
        choice1: choice1.trim(),
        choice2: choice2.trim(),
        choice3: choice3.trim(),
        choice4: choice4.trim(),
        correctAnswer: Number(correctAnswer),
        explanation: explanation.trim(),
        difficulty,
        point: parsedPoint,
        source,
      });

      setMessage('객관식 문제가 등록되었습니다.');
      resetForm();
      await loadQuestions(selectedCategoryId);
    } catch (err) {
      console.error('객관식 문제 등록 실패:', err);
      setMessage(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          '객관식 문제 등록에 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('이 객관식 문제를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await deleteObjectiveQuestion(id);
      setMessage('객관식 문제가 삭제되었습니다.');
      await loadQuestions(selectedCategoryId);
    } catch (err) {
      console.error('객관식 문제 삭제 실패:', err);
      setMessage('객관식 문제 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="adminobjectivepage">
      <div className="adminobjectivepage-inner">
        <h2 className="adminobjectivepage-title">객관식 문제 등록</h2>
        <p className="adminobjectivepage-subtitle">
          시험 폴더에 객관식 문제를 수동 또는 AI로 생성할 수 있습니다.
        </p>

        <form className="adminobjectivepage-form" onSubmit={handleSubmit}>
<div className="adminobjectivepage-category-box">
  <div className="adminobjectivepage-form-group">
    <label className="adminobjectivepage-label">시험 폴더</label>
    <div className="adminobjectivepage-category-row">
      <select
        className="adminobjectivepage-select"
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
        className="adminobjectivepage-delete-category-btn"
        onClick={handleDeleteCategory}
        disabled={!selectedCategoryId}
      >
        폴더 삭제
      </button>
    </div>
  </div>

  <div className="adminobjectivepage-form-group">
    <label className="adminobjectivepage-label">새 시험 폴더 생성</label>
    <div className="adminobjectivepage-category-row">
      <input
        type="text"
        className="adminobjectivepage-input"
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
        className="adminobjectivepage-create-category-btn"
        onClick={handleCreateCategory}
      >
        폴더 생성
      </button>
    </div>
  </div>
</div>

          <div className="adminobjectivepage-ai-box">
            <label className="adminobjectivepage-label">AI 객관식 생성 요청</label>
            <textarea
              className="adminobjectivepage-textarea"
              placeholder="예: 자료구조 스택과 큐에 대한 쉬운 객관식 문제 만들어줘"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
            />
            <button
              type="button"
              className="adminobjectivepage-ai-btn"
              onClick={handleAiGenerate}
              disabled={aiLoading}
            >
              {aiLoading ? 'AI 생성 중...' : 'AI 객관식 생성'}
            </button>
          </div>

          <div className="adminobjectivepage-form-group">
            <label className="adminobjectivepage-label">문제 제목</label>
            <input
              type="text"
              className="adminobjectivepage-input"
              placeholder="예: 스택의 특징"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (source === 'ai') setSource('ai_edited');
              }}
            />
          </div>

          <div className="adminobjectivepage-form-group">
            <label className="adminobjectivepage-label">문제 설명</label>
            <textarea
              className="adminobjectivepage-textarea"
              placeholder="예: 다음 중 스택 자료구조의 특징으로 옳은 것은?"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (source === 'ai') setSource('ai_edited');
              }}
              rows={5}
            />
          </div>

          <div className="adminobjectivepage-options-wrap">
            <div className="adminobjectivepage-form-group">
              <label className="adminobjectivepage-label">보기 1</label>
              <input
                type="text"
                className="adminobjectivepage-input"
                value={choice1}
                onChange={(e) => setChoice1(e.target.value)}
              />
            </div>

            <div className="adminobjectivepage-form-group">
              <label className="adminobjectivepage-label">보기 2</label>
              <input
                type="text"
                className="adminobjectivepage-input"
                value={choice2}
                onChange={(e) => setChoice2(e.target.value)}
              />
            </div>

            <div className="adminobjectivepage-form-group">
              <label className="adminobjectivepage-label">보기 3</label>
              <input
                type="text"
                className="adminobjectivepage-input"
                value={choice3}
                onChange={(e) => setChoice3(e.target.value)}
              />
            </div>

            <div className="adminobjectivepage-form-group">
              <label className="adminobjectivepage-label">보기 4</label>
              <input
                type="text"
                className="adminobjectivepage-input"
                value={choice4}
                onChange={(e) => setChoice4(e.target.value)}
              />
            </div>
          </div>

          <div className="adminobjectivepage-meta-grid">
            <div className="adminobjectivepage-form-group">
              <label className="adminobjectivepage-label">정답 선택</label>
              <select
                className="adminobjectivepage-select"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              >
                <option value="">정답을 선택하세요</option>
                <option value="1">보기 1</option>
                <option value="2">보기 2</option>
                <option value="3">보기 3</option>
                <option value="4">보기 4</option>
              </select>
            </div>

            <div className="adminobjectivepage-form-group">
              <label className="adminobjectivepage-label">난이도</label>
              <select
                className="adminobjectivepage-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">쉬움</option>
                <option value="medium">보통</option>
                <option value="hard">어려움</option>
              </select>
            </div>

            <div className="adminobjectivepage-form-group">
              <label className="adminobjectivepage-label">점수</label>
              <input
                type="number"
                className="adminobjectivepage-input"
                value={point}
                min="1"
                onChange={(e) => setPoint(e.target.value)}
              />
            </div>
          </div>

          <div className="adminobjectivepage-form-group">
            <label className="adminobjectivepage-label">해설</label>
            <textarea
              className="adminobjectivepage-textarea"
              placeholder="예: 스택은 마지막에 들어온 데이터가 먼저 나가는 LIFO 구조입니다."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={4}
            />
          </div>

          {message && <div className="adminobjectivepage-message">{message}</div>}

          <button
            className="adminobjectivepage-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? '등록 중...' : '객관식 문제 등록'}
          </button>
        </form>

        <div className="adminobjectivepage-list-section">
          <h3>등록된 객관식 문제</h3>

          {questions.length === 0 ? (
            <p className="adminobjectivepage-empty">등록된 객관식 문제가 없습니다.</p>
          ) : (
            <div className="adminobjectivepage-list">
              {questions.map((question, index) => (
                <div key={question.id} className="adminobjectivepage-question-card">
                  <div>
                    <strong>
                      {index + 1}. {question.title}
                    </strong>
                    <p>{question.description}</p>
                    <span>
                      정답: 보기 {question.correctAnswer} / {question.point}점 /{' '}
                      {question.difficulty}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="adminobjectivepage-delete-btn"
                    onClick={() => handleDelete(question.id)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}