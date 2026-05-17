import { useEffect, useState } from 'react';
import {
  getProblems,
  getCategories,
  deleteExam,
  updateExam,
  updateExamOrder,
  getTestCasesByExamId,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  getObjectiveQuestionsByCategoryId,
  updateObjectiveQuestion,
  deleteObjectiveQuestion,
  updateObjectiveQuestionOrder,
} from '../api/problemApi';
import './AdminExamManagePage.css';
import { toast } from 'react-toastify';

const emptyNewTestCase = {
  input: '',
  expectedOutput: '',
  description: '',
};

const emptyObjectiveForm = {
  title: '',
  description: '',
  choice1: '',
  choice2: '',
  choice3: '',
  choice4: '',
  correctAnswer: '',
  explanation: '',
  difficulty: 'easy',
  point: 10,
};

const sortProblemsByDisplayOrder = (items = []) => {
  return [...items].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return Number(a.id ?? 0) - Number(b.id ?? 0);
  });
};

export default function AdminExamManagePage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    constraints: '',
    difficulty: 'easy',
    point: 20,
  });

const sortObjectiveQuestionsByDisplayOrder = (items = []) => {
  return [...items].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return Number(a.id ?? 0) - Number(b.id ?? 0);
  });
};

const [testCases, setTestCases] = useState([]);
const [testCaseLoading, setTestCaseLoading] = useState(false);
const [testCaseSavingId, setTestCaseSavingId] = useState(null);
const [newTestCase, setNewTestCase] = useState(emptyNewTestCase);
const [editingTestCaseId, setEditingTestCaseId] = useState(null);

const [search, setSearch] = useState('');
const [difficultyFilter, setDifficultyFilter] = useState('all');
const [categories, setCategories] = useState([]);
const [selectedCategoryId, setSelectedCategoryId] = useState('');

const [objectiveQuestions, setObjectiveQuestions] = useState([]);
const [objectiveLoading, setObjectiveLoading] = useState(false);
const [selectedObjectiveQuestionId, setSelectedObjectiveQuestionId] = useState(null);
const [isObjectiveEditing, setIsObjectiveEditing] = useState(false);
const [objectiveEditForm, setObjectiveEditForm] = useState(emptyObjectiveForm);

const isOrderModeAvailable =
  search.trim() === '' &&
  difficultyFilter === 'all' &&
  selectedCategoryId !== '';

const filteredProblems = problems.filter((problem) => {
  if (!selectedCategoryId) {
    return false;
  }

  const keyword = search.toLowerCase();

  const matchesSearch =
    problem.title?.toLowerCase().includes(keyword) ||
    problem.description?.toLowerCase().includes(keyword);

  const matchesDifficulty =
    difficultyFilter === 'all' ||
    (problem.difficulty || 'easy') === difficultyFilter;

  const matchesCategory =
    selectedCategoryId === 'all' ||
    String(problem.categoryId) === String(selectedCategoryId);

  return matchesSearch && matchesDifficulty && matchesCategory;
});

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await getProblems();
	setProblems(sortProblemsByDisplayOrder(res.data || []));
    } catch (err) {
      console.error('문제 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

const fetchCategories = async () => {
  try {
    const data = await getCategories();
    setCategories(data || []);
  } catch (err) {
    console.error('시험 폴더 조회 실패:', err);
    setCategories([]);
  }
};

const fetchObjectiveQuestions = async (categoryId) => {
  if (!categoryId || categoryId === 'all') {
    setObjectiveQuestions([]);
    setSelectedObjectiveQuestionId(null);
    setIsObjectiveEditing(false);
    setObjectiveEditForm(emptyObjectiveForm);
    return;
  }

  try {
    setObjectiveLoading(true);
    const data = await getObjectiveQuestionsByCategoryId(categoryId);
    setObjectiveQuestions(sortObjectiveQuestionsByDisplayOrder(data || []));
  } catch (err) {
    console.error('객관식 문제 조회 실패:', err);
    toast.error('객관식 문제를 불러오지 못했습니다.');
    setObjectiveQuestions([]);
  } finally {
    setObjectiveLoading(false);
  }
};

  const fetchTestCases = async (examId) => {
    if (!examId) {
      setTestCases([]);
      return;
    }

    try {
      setTestCaseLoading(true);
      const data = await getTestCasesByExamId(examId);
      setTestCases(data || []);
    } catch (err) {
      console.error('테스트케이스 조회 실패:', err);
      toast.error('테스트케이스를 불러오지 못했습니다.');
      setTestCases([]);
    } finally {
      setTestCaseLoading(false);
    }
  };

useEffect(() => {
  fetchProblems();
  fetchCategories();
}, []);

const handleSelectProblem = (problem) => {
  const isSameProblem =
    String(selectedProblem?.id) === String(problem.id);

  const hasEditingState =
    isEditing || editingTestCaseId !== null;

  if (isSameProblem) {
    if (hasEditingState) {
      const ok = window.confirm(
        '수정 중인 내용이 사라질 수 있습니다.\n문제 선택을 취소하시겠습니까?'
      );

      if (!ok) return;
    }

    setSelectedProblem(null);
    setIsEditing(false);

    setEditForm({
      title: '',
      description: '',
      constraints: '',
      difficulty: 'easy',
      point: 20,
    });

    setTestCases([]);
    setNewTestCase(emptyNewTestCase);
    setEditingTestCaseId(null);

    return;
  }

  if (hasEditingState) {
    const ok = window.confirm(
      '수정 중인 내용이 사라질 수 있습니다.\n다른 문제로 이동하시겠습니까?'
    );

    if (!ok) return;
  }

  setSelectedProblem(problem);

  setEditForm({
    title: problem.title || '',
    description: problem.description || '',
    constraints: problem.constraints || '',
    difficulty: problem.difficulty || 'easy',
    point: problem.point ?? 20,
  });

  setIsEditing(false);
  setNewTestCase(emptyNewTestCase);
  setEditingTestCaseId(null);
  fetchTestCases(problem.id);
};

  const handleDelete = async (id) => {
    const ok = window.confirm('정말 이 문제를 삭제하시겠습니까?');
    if (!ok) return;

    try {
      await deleteExam(id);

      setProblems((prev) => prev.filter((p) => p.id !== id));

      if (selectedProblem?.id === id) {
        setSelectedProblem(null);
        setIsEditing(false);
        setTestCases([]);
      }

      toast.success('문제가 삭제되었습니다.');
    } catch (err) {
      console.error('문제 삭제 실패:', err);
      toast.error('문제 삭제에 실패했습니다.');
    }
  };

const handleMoveProblem = async (problemId, direction) => {
  if (!isOrderModeAvailable) {
    toast.warning('문제 순서 변경은 검색/난이도 필터를 해제한 상태에서 가능합니다.');
    return;
  }

  const targetProblems = sortProblemsByDisplayOrder(
    selectedCategoryId === 'all'
      ? problems
      : problems.filter(
          (problem) => String(problem.categoryId) === String(selectedCategoryId)
        )
  );

  const currentIndex = targetProblems.findIndex(
    (problem) => String(problem.id) === String(problemId)
  );

  if (currentIndex === -1) return;

  const nextIndex = currentIndex + direction;

  if (nextIndex < 0 || nextIndex >= targetProblems.length) return;

  const reorderedTarget = [...targetProblems];

  const temp = reorderedTarget[currentIndex];
  reorderedTarget[currentIndex] = reorderedTarget[nextIndex];
  reorderedTarget[nextIndex] = temp;

  const orderedTarget = reorderedTarget.map((problem, index) => ({
    ...problem,
    displayOrder: index + 1,
  }));

  const orderMap = new Map(
    orderedTarget.map((problem) => [
      String(problem.id),
      problem.displayOrder,
    ])
  );

  const nextProblems = sortProblemsByDisplayOrder(
    problems.map((problem) =>
      orderMap.has(String(problem.id))
        ? {
            ...problem,
            displayOrder: orderMap.get(String(problem.id)),
          }
        : problem
    )
  );

  setProblems(nextProblems);

  setSelectedProblem((prev) => {
    if (!prev) return prev;

    const updated = nextProblems.find(
      (problem) => String(problem.id) === String(prev.id)
    );

    return updated || prev;
  });

  try {
    await updateExamOrder(
      orderedTarget.map((problem) => ({
        id: problem.id,
        displayOrder: problem.displayOrder,
      }))
    );

    toast.success('문제 순서가 저장되었습니다.');
  } catch (err) {
    console.error('문제 순서 변경 실패:', err);
    toast.error('문제 순서 저장에 실패했습니다. 다시 불러옵니다.');
    fetchProblems();
  }
};

  const handleEditClick = () => {
    if (!selectedProblem) return;
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!selectedProblem) return;

    setEditForm({
      title: selectedProblem.title || '',
      description: selectedProblem.description || '',
      constraints: selectedProblem.constraints || '',
      difficulty: selectedProblem.difficulty || 'easy',
      point: selectedProblem.point ?? 20,
    });

    setIsEditing(false);
setEditingTestCaseId(null);
setNewTestCase(emptyNewTestCase);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!selectedProblem) return;

    if (!editForm.title.trim() || !editForm.description.trim()) {
      toast.error('제목과 설명은 필수입니다.');
      return;
    }

    const parsedPoint = Number(editForm.point);

    if (!Number.isInteger(parsedPoint) || parsedPoint <= 0) {
      toast.error('배점은 1점 이상의 숫자로 입력하세요.');
      return;
    }

    try {
      await updateExam(selectedProblem.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        constraints: editForm.constraints,
        difficulty: editForm.difficulty,
        point: parsedPoint,
      });

      const updatedProblem = {
        ...selectedProblem,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        constraints: editForm.constraints,
        difficulty: editForm.difficulty,
        point: parsedPoint,
      };

      setProblems((prev) =>
        prev.map((p) => (p.id === selectedProblem.id ? updatedProblem : p))
      );

     setSelectedProblem(updatedProblem);
	setIsEditing(false);
	setEditingTestCaseId(null);
	setNewTestCase(emptyNewTestCase);

	toast.success('문제가 수정되었습니다.');
    } catch (err) {
      console.error('문제 수정 실패:', err);
      toast.error('문제 수정에 실패했습니다.');
    }
  };

  const handleTestCaseChange = (index, field, value) => {
    setTestCases((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc))
    );
  };

  const handleNewTestCaseChange = (field, value) => {
    setNewTestCase((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateTestCase = async () => {
    if (!selectedProblem) return;

    if (!newTestCase.input.trim() || !newTestCase.expectedOutput.trim()) {
      toast.error('입력값과 기대 출력은 필수입니다.');
      return;
    }

    try {
      setTestCaseSavingId('new');

      const saved = await createTestCase({
        examId: selectedProblem.id,
        input: newTestCase.input.trim(),
        expectedOutput: newTestCase.expectedOutput.trim(),
        description: newTestCase.description.trim(),
        source: 'manual',
      });

      setTestCases((prev) => [...prev, saved]);
      setNewTestCase(emptyNewTestCase);
      toast.success('테스트케이스가 추가되었습니다.');
    } catch (err) {
      console.error('테스트케이스 추가 실패:', err);
      toast.error('테스트케이스 추가에 실패했습니다.');
    } finally {
      setTestCaseSavingId(null);
    }
  };

  const handleUpdateTestCase = async (testCase) => {
    if (!testCase?.id) return;

    if (
      !String(testCase.input || '').trim() ||
      !String(testCase.expectedOutput || '').trim()
    ) {
      toast.error('입력값과 기대 출력은 필수입니다.');
      return;
    }

    try {
      setTestCaseSavingId(testCase.id);

      const updated = await updateTestCase(testCase.id, {
        input: String(testCase.input || '').trim(),
        expectedOutput: String(testCase.expectedOutput || '').trim(),
        description: String(testCase.description || '').trim(),
        source: testCase.source || 'manual',
      });

      setTestCases((prev) =>
        prev.map((tc) => (tc.id === testCase.id ? updated : tc))
      );

      toast.success('테스트케이스가 수정되었습니다.');
      setEditingTestCaseId(null);

    } catch (err) {
      console.error('테스트케이스 수정 실패:', err);
      toast.error('테스트케이스 수정에 실패했습니다.');
    } finally {
      setTestCaseSavingId(null);
    }
  };

  const handleDeleteTestCase = async (testCaseId) => {
    const ok = window.confirm('정말 이 테스트케이스를 삭제하시겠습니까?');
    if (!ok) return;

    try {
      setTestCaseSavingId(testCaseId);
      await deleteTestCase(testCaseId);

      setTestCases((prev) => prev.filter((tc) => tc.id !== testCaseId));
      toast.success('테스트케이스가 삭제되었습니다.');
    } catch (err) {
      console.error('테스트케이스 삭제 실패:', err);
      toast.error('테스트케이스 삭제에 실패했습니다.');
    } finally {
      setTestCaseSavingId(null);
    }
  };

const handleSelectObjectiveQuestion = (question) => {
  const isSameQuestion =
    String(selectedObjectiveQuestionId) === String(question.id);

  if (isSameQuestion) {
    if (isObjectiveEditing) {
      const ok = window.confirm(
        '수정 중인 객관식 문제가 있습니다.\n수정 내용을 버리고 선택을 취소하시겠습니까?'
      );

      if (!ok) return;
    }

    setSelectedObjectiveQuestionId(null);
    setIsObjectiveEditing(false);
    setObjectiveEditForm(emptyObjectiveForm);

    return;
  }

  if (isObjectiveEditing) {
    const ok = window.confirm(
      '수정 중인 객관식 문제가 있습니다.\n수정 내용을 버리고 다른 문제로 이동하시겠습니까?'
    );

    if (!ok) return;
  }

  setSelectedObjectiveQuestionId(question.id);
  setIsObjectiveEditing(false);

  setObjectiveEditForm({
    title: question.title || '',
    description: question.description || '',
    choice1: question.choice1 || '',
    choice2: question.choice2 || '',
    choice3: question.choice3 || '',
    choice4: question.choice4 || '',
    correctAnswer: String(question.correctAnswer || ''),
    explanation: question.explanation || '',
    difficulty: question.difficulty || 'easy',
    point: question.point ?? 10,
  });
};
const handleObjectiveFormChange = (field, value) => {
  setObjectiveEditForm((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const handleCancelObjectiveEdit = () => {
  const current = objectiveQuestions.find(
    (question) => String(question.id) === String(selectedObjectiveQuestionId)
  );

  if (current) {
    handleSelectObjectiveQuestion(current);
  } else {
    setSelectedObjectiveQuestionId(null);
    setObjectiveEditForm(emptyObjectiveForm);
  }

  setIsObjectiveEditing(false);
};

const handleUpdateObjectiveQuestion = async () => {
  if (!selectedObjectiveQuestionId) return;

  if (
    !objectiveEditForm.title.trim() ||
    !objectiveEditForm.description.trim() ||
    !objectiveEditForm.choice1.trim() ||
    !objectiveEditForm.choice2.trim() ||
    !objectiveEditForm.choice3.trim() ||
    !objectiveEditForm.choice4.trim() ||
    !objectiveEditForm.correctAnswer
  ) {
    toast.error('제목, 설명, 보기 4개, 정답은 필수입니다.');
    return;
  }

  const parsedCorrectAnswer = Number(objectiveEditForm.correctAnswer);
  const parsedPoint = Number(objectiveEditForm.point);

  if (parsedCorrectAnswer < 1 || parsedCorrectAnswer > 4) {
    toast.error('정답 번호는 1~4 중 하나여야 합니다.');
    return;
  }

  if (!Number.isInteger(parsedPoint) || parsedPoint <= 0) {
    toast.error('점수는 1점 이상이어야 합니다.');
    return;
  }

  try {
    const payload = {
      categoryId: Number(selectedCategoryId),
      title: objectiveEditForm.title.trim(),
      description: objectiveEditForm.description.trim(),
      choice1: objectiveEditForm.choice1.trim(),
      choice2: objectiveEditForm.choice2.trim(),
      choice3: objectiveEditForm.choice3.trim(),
      choice4: objectiveEditForm.choice4.trim(),
      correctAnswer: parsedCorrectAnswer,
      explanation: objectiveEditForm.explanation.trim(),
      difficulty: objectiveEditForm.difficulty,
      point: parsedPoint,
      source: 'manual',
    };

    const updated = await updateObjectiveQuestion(
      selectedObjectiveQuestionId,
      payload
    );

    setObjectiveQuestions((prev) =>
  prev.map((question) =>
    String(question.id) === String(selectedObjectiveQuestionId)
      ? updated
      : question
  )
);

setObjectiveEditForm({
  title: updated.title || '',
  description: updated.description || '',
  choice1: updated.choice1 || '',
  choice2: updated.choice2 || '',
  choice3: updated.choice3 || '',
  choice4: updated.choice4 || '',
  correctAnswer: String(updated.correctAnswer || ''),
  explanation: updated.explanation || '',
  difficulty: updated.difficulty || 'easy',
  point: updated.point ?? 10,
});

setIsObjectiveEditing(false);
toast.success('객관식 문제가 수정되었습니다.');
  } catch (err) {
    console.error('객관식 문제 수정 실패:', err);
    toast.error(
      err.response?.data?.message ||
        err.response?.data?.detail ||
        '객관식 문제 수정에 실패했습니다.'
    );
  }
};

const handleMoveObjectiveQuestion = async (questionId, direction) => {
  if (!selectedCategoryId || selectedCategoryId === 'all') {
    toast.warning('객관식 순서 변경은 특정 시험 폴더를 선택했을 때 가능합니다.');
    return;
  }

  if (isObjectiveEditing) {
    toast.warning('객관식 수정 중에는 순서 변경을 할 수 없습니다.');
    return;
  }

  const orderedQuestions = sortObjectiveQuestionsByDisplayOrder(objectiveQuestions);

  const currentIndex = orderedQuestions.findIndex(
    (question) => String(question.id) === String(questionId)
  );

  if (currentIndex === -1) return;

  const nextIndex = currentIndex + direction;

  if (nextIndex < 0 || nextIndex >= orderedQuestions.length) return;

  const reordered = [...orderedQuestions];

  const temp = reordered[currentIndex];
  reordered[currentIndex] = reordered[nextIndex];
  reordered[nextIndex] = temp;

  const nextQuestions = reordered.map((question, index) => ({
    ...question,
    displayOrder: index + 1,
  }));

  setObjectiveQuestions(nextQuestions);

  setSelectedObjectiveQuestionId((prev) => prev);

  try {
    await updateObjectiveQuestionOrder(
      nextQuestions.map((question) => ({
        id: question.id,
        displayOrder: question.displayOrder,
      }))
    );

    toast.success('객관식 문제 순서가 저장되었습니다.');
  } catch (err) {
    console.error('객관식 문제 순서 변경 실패:', err);
    toast.error('객관식 문제 순서 저장에 실패했습니다. 다시 불러옵니다.');
    fetchObjectiveQuestions(selectedCategoryId);
  }
};

const handleDeleteObjectiveQuestion = async (questionId) => {
  const ok = window.confirm('이 객관식 문제를 삭제하시겠습니까?');
  if (!ok) return;

  try {
    await deleteObjectiveQuestion(questionId);

    setObjectiveQuestions((prev) =>
      prev.filter((question) => String(question.id) !== String(questionId))
    );

    if (String(selectedObjectiveQuestionId) === String(questionId)) {
      setSelectedObjectiveQuestionId(null);
      setIsObjectiveEditing(false);
      setObjectiveEditForm(emptyObjectiveForm);
    }

    toast.success('객관식 문제가 삭제되었습니다.');
  } catch (err) {
    console.error('객관식 문제 삭제 실패:', err);
    toast.error('객관식 문제 삭제에 실패했습니다.');
  }
};

  return (
    <div className="admin-exam-page">
      <div className="admin-exam-header">
        <div>
          <h1>전체 문제 관리</h1>
          <p>등록된 문제를 조회하고 수정하거나 삭제할 수 있습니다.</p>
        </div>
      </div>

      <div className="admin-exam-layout">
        <section className="admin-exam-list-panel">
          <div className="admin-exam-title-row">
            <h2>문제 목록</h2>
            <span className="admin-exam-count-badge">
              {filteredProblems.length}개
            </span>
          </div>

<p className="admin-exam-order-help">
  문제 순서 변경은 검색/난이도 필터를 해제한 상태에서 가능합니다. 전체 또는 특정 시험 폴더 기준으로 순서를 변경할 수 있습니다.
</p>

          <div className="admin-exam-toolbar">
            <input
              type="text"
              className="admin-exam-search"
              placeholder="문제 제목 또는 설명 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

<select
  className="admin-exam-category-select"
  value={selectedCategoryId}
onChange={(e) => {
  const nextCategoryId = e.target.value;

  setSelectedCategoryId(nextCategoryId);
  setSelectedProblem(null);
  setIsEditing(false);
  setTestCases([]);
  setEditingTestCaseId(null);

  setSelectedObjectiveQuestionId(null);
  setIsObjectiveEditing(false);
  setObjectiveEditForm(emptyObjectiveForm);

  fetchObjectiveQuestions(nextCategoryId);
}}
>
  <option value="">시험 폴더를 선택하세요</option>
<option value="all">전체 시험 폴더</option>
  {categories.map((category) => (
    <option key={category.id} value={category.id}>
      {category.title}
    </option>
  ))}
</select>

            <div className="admin-exam-filter-group">
              {['all', 'easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`admin-exam-filter-btn ${
                    difficultyFilter === level ? 'active' : ''
                  }`}
                  onClick={() => setDifficultyFilter(level)}
                >
                  {level === 'all'
                    ? '전체'
                    : level === 'easy'
                    ? '쉬움'
                    : level === 'medium'
                    ? '보통'
                    : '어려움'}
                </button>
              ))}
            </div>
          </div>

{loading ? (
  <div className="admin-exam-empty-box">
    문제 목록을 불러오는 중입니다...
  </div>
) : !selectedCategoryId ? (
  <div className="admin-exam-empty-box">
    시험 폴더를 먼저 선택하세요.
  </div>
) : problems.length === 0 ? (
  <div className="admin-exam-empty-box">
    등록된 문제가 없습니다.
  </div>
) : filteredProblems.length === 0 ? (
  <div className="admin-exam-empty-box">
    선택한 시험 폴더에 등록된 코딩 문제가 없습니다.
  </div>
) : (
            <div className="admin-exam-list">
              {filteredProblems.map((problem, index) => (
                <div
                  key={problem.id}
                  className={`admin-exam-card ${
                    selectedProblem?.id === problem.id ? 'active' : ''
                  }`}
                  onClick={() => handleSelectProblem(problem)}
                >
                  <div className="admin-exam-card-top">
                    <div className="admin-exam-card-meta-left">
                      <span className="admin-exam-id">
                        문제 #{index + 1}
                      </span>

                      <span className="admin-exam-point">
                        배점 {problem.point ?? 0}점
                      </span>

                      <span
                        className={`admin-exam-difficulty ${
                          problem.difficulty || 'easy'
                        }`}
                      >
                        {problem.difficulty === 'medium'
                          ? '보통'
                          : problem.difficulty === 'hard'
                          ? '어려움'
                          : '쉬움'}
                      </span>
                    </div>

                    <div
                      className="admin-exam-order-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="admin-exam-order-btn"
                        onClick={() => handleMoveProblem(problem.id, -1)}
                        disabled={!isOrderModeAvailable || index === 0}
                        title="위로 이동"
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        className="admin-exam-order-btn"
                        onClick={() => handleMoveProblem(problem.id, 1)}
                        disabled={
                          !isOrderModeAvailable ||
                          index === filteredProblems.length - 1
                        }
                        title="아래로 이동"
                      >
                        ↓
                      </button>
                    </div>
                  </div>

                  <h3 className="admin-exam-card-title">
                    {problem.title}
                  </h3>

                  <p className="admin-exam-card-desc">
                    {problem.description || '설명이 없습니다.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-exam-detail-panel">
          {!selectedProblem ? (
            <div className="admin-exam-empty-box">
              왼쪽에서 관리할 문제를 선택하세요.
            </div>
          ) : (
            <>
              <div className="admin-exam-title-row">
                <h2>문제 상세</h2>

                <div className="admin-exam-detail-actions">
                  {!isEditing ? (
                    <>
                      <button
                        type="button"
                        className="admin-exam-btn-edit"
                        onClick={handleEditClick}
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        className="admin-exam-btn-delete"
                        onClick={() => handleDelete(selectedProblem.id)}
                      >
                        삭제
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="admin-exam-btn-save"
                        onClick={handleUpdate}
                      >
                        저장
                      </button>

                      <button
                        type="button"
                        className="admin-exam-btn-cancel"
                        onClick={handleCancelEdit}
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="admin-exam-form">
                <label className="admin-exam-form-group">
                  <span>문제 제목</span>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </label>

                <label className="admin-exam-form-group">
                  <span>배점</span>
                  <input
                    type="number"
                    name="point"
                    min="1"
                    value={editForm.point}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </label>

                <label className="admin-exam-form-group">
                  <span>문제 설명</span>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={10}
                  />
                </label>

                <label className="admin-exam-form-group">
                  <span>제한 사항</span>
                  <textarea
                    name="constraints"
                    value={editForm.constraints}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={5}
                  />
                </label>
                <label className="admin-exam-form-group">
                  <span>난이도</span>
                  <select
                    name="difficulty"
                    value={editForm.difficulty}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="admin-exam-select"
                  >
                    <option value="easy">쉬움</option>
                    <option value="medium">보통</option>
                    <option value="hard">어려움</option>
                  </select>
                </label>
              </div>

              <div className="admin-exam-testcase-section">
                <div className="admin-exam-testcase-title-row">
                  <div>
                    <h3>테스트케이스 관리</h3>
                    <p>
                      선택한 코딩 문제의 입력값, 기대 출력, 설명을 확인하고
                      수정할 수 있습니다.
                    </p>
                  </div>

                  <span className="admin-exam-count-badge">
                    {testCases.length}개
                  </span>
                </div>

                <div className="admin-exam-testcase-new-box">
                  <h4>새 테스트케이스 추가</h4>

                  <div className="admin-exam-testcase-grid">
                    <label className="admin-exam-form-group">
                      <span>입력값</span>
                      <textarea
                        value={newTestCase.input}
                        onChange={(e) =>
                          handleNewTestCaseChange('input', e.target.value)
                        }
                        rows={3}
                        placeholder="예: 3 5"
			disabled={!isEditing}
                      />
                    </label>

                    <label className="admin-exam-form-group">
                      <span>기대 출력</span>
                      <textarea
                        value={newTestCase.expectedOutput}
                        onChange={(e) =>
                          handleNewTestCaseChange(
                            'expectedOutput',
                            e.target.value
                          )
                        }
                        rows={3}
                        placeholder="예: 8"
			disabled={!isEditing}
                      />
                    </label>
                  </div>

                  <label className="admin-exam-form-group">
                    <span>설명</span>
                    <input
                      type="text"
                      value={newTestCase.description}
                      onChange={(e) =>
                        handleNewTestCaseChange('description', e.target.value)
                      }
                      placeholder="예: 기본 덧셈 테스트"
			disabled={!isEditing}
                    />
                  </label>

<button
  type="button"
  className="admin-exam-btn-save testcase-action-btn"
  onClick={handleCreateTestCase}
  disabled={!isEditing || testCaseSavingId === 'new'}
>
  {!isEditing
    ? '문제 수정 후 추가 가능'
    : testCaseSavingId === 'new'
    ? '추가 중...'
    : '테스트케이스 추가'}
</button>
                </div>

                {testCaseLoading ? (
                  <div className="admin-exam-empty-box testcase-empty">
                    테스트케이스를 불러오는 중입니다...
                  </div>
                ) : testCases.length === 0 ? (
                  <div className="admin-exam-empty-box testcase-empty">
                    등록된 테스트케이스가 없습니다.
                  </div>
                ) : (
                  <div className="admin-exam-testcase-list">
                    {testCases.map((testCase, index) => (
                      <div
                        key={testCase.id || index}
                        className="admin-exam-testcase-card"
                      >
                        <div className="admin-exam-testcase-card-header">
                          <strong>테스트케이스 #{index + 1}</strong>
                          <span>{testCase.source || 'manual'}</span>
                        </div>

                        <div className="admin-exam-testcase-grid">
                          <label className="admin-exam-form-group">
                            <span>입력값</span>
                            <textarea
  				value={testCase.input || ''}
  				onChange={(e) =>
    				handleTestCaseChange(
     				 index,
      				'input',
      				e.target.value
    				)
 				 }
  				rows={3}
  				disabled={
  				!isEditing ||
  				String(editingTestCaseId) !== String(testCase.id)
				}
				/>
                          </label>

                          <label className="admin-exam-form-group">
                            <span>기대 출력</span>
				<textarea
  				value={testCase.expectedOutput || ''}
  				onChange={(e) =>
    				handleTestCaseChange(
      				index,
      				'expectedOutput',
      				e.target.value
   				 )
  				}
  				rows={3}
  				disabled={
  				!isEditing ||
  				String(editingTestCaseId) !== String(testCase.id)
				}
				/>
                          </label>
                        </div>

                        <label className="admin-exam-form-group">
                          <span>설명</span>
				<input
  				type="text"
 				 value={testCase.description || ''}
  				onChange={(e) =>
    				handleTestCaseChange(
      				index,
     				 'description',
      				e.target.value
    				)
  				}
  				disabled={
  				!isEditing ||
  				String(editingTestCaseId) !== String(testCase.id)
				}
				/>
                        </label>

<div className="admin-exam-testcase-actions">
  {isEditing && String(editingTestCaseId) === String(testCase.id) ? (
    <>
      <button
        type="button"
        className="admin-exam-btn-save testcase-action-btn"
        onClick={() => handleUpdateTestCase(testCase)}
        disabled={testCaseSavingId === testCase.id}
      >
        {testCaseSavingId === testCase.id ? '저장 중...' : '저장'}
      </button>

      <button
        type="button"
        className="admin-exam-btn-cancel testcase-action-btn"
        onClick={() => setEditingTestCaseId(null)}
        disabled={testCaseSavingId === testCase.id}
      >
        취소
      </button>
    </>
  ) : (
    <>
<button
  type="button"
  className="admin-exam-btn-edit testcase-action-btn"
  onClick={() => setEditingTestCaseId(testCase.id)}
  disabled={!isEditing}
>
  수정
</button>

<button
  type="button"
  className="admin-exam-btn-delete testcase-action-btn"
  onClick={() => handleDeleteTestCase(testCase.id)}
  disabled={!isEditing || testCaseSavingId === testCase.id}
>
  삭제
</button>
    </>
  )}
</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="admin-exam-objective-section">
            <div className="admin-exam-testcase-title-row">
              <div>
                <h3>객관식 문제 관리</h3>
                <p>
                  선택한 시험 폴더의 객관식 문제를 확인하고 수정할 수 있습니다.
                </p>
              </div>

              <span className="admin-exam-count-badge">
                {objectiveQuestions.length}개
              </span>
            </div>

{!selectedCategoryId ? (
  <div className="admin-exam-empty-box objective-empty">
    객관식 문제를 관리하려면 왼쪽에서 시험 폴더를 선택하세요.
  </div>
) : selectedCategoryId === 'all' ? (
  <div className="admin-exam-empty-box objective-empty">
    객관식 문제 관리는 특정 시험 폴더를 선택했을 때 가능합니다.
  </div>
) : objectiveLoading ? (
              <div className="admin-exam-empty-box objective-empty">
                객관식 문제를 불러오는 중입니다...
              </div>
            ) : objectiveQuestions.length === 0 ? (
              <div className="admin-exam-empty-box objective-empty">
                선택한 시험 폴더에 등록된 객관식 문제가 없습니다.
              </div>
            ) : (
              <div className="admin-exam-objective-layout">
                <div className="admin-exam-objective-list">
                  {objectiveQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`admin-exam-objective-card ${
                        String(selectedObjectiveQuestionId) === String(question.id)
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => handleSelectObjectiveQuestion(question)}
                    >
                      <div className="admin-exam-objective-card-top">
  <strong>객관식 #{index + 1}</strong>

  <div
    className="admin-exam-order-actions"
    onClick={(e) => e.stopPropagation()}
  >
    <button
      type="button"
      className="admin-exam-order-btn"
      onClick={() => handleMoveObjectiveQuestion(question.id, -1)}
      disabled={isObjectiveEditing || index === 0}
      title="위로 이동"
    >
      ↑
    </button>

    <button
      type="button"
      className="admin-exam-order-btn"
      onClick={() => handleMoveObjectiveQuestion(question.id, 1)}
      disabled={isObjectiveEditing || index === objectiveQuestions.length - 1}
      title="아래로 이동"
    >
      ↓
    </button>
  </div>

  <span>{question.point ?? 0}점</span>
</div>

<p>{question.title}</p>
                    </div>
                  ))}
                </div>

                <div className="admin-exam-objective-detail">
                  {!selectedObjectiveQuestionId ? (
                    <div className="admin-exam-empty-box objective-empty">
                      왼쪽에서 수정할 객관식 문제를 선택하세요.
                    </div>
                  ) : (
                    <>
                      <div className="admin-exam-objective-detail-header">
                        <h4>객관식 문제 상세</h4>

                        <div className="admin-exam-detail-actions">
                          {!isObjectiveEditing ? (
                            <>
                              <button
                                type="button"
                                className="admin-exam-btn-edit"
                                onClick={() => setIsObjectiveEditing(true)}
                              >
                                수정
                              </button>

                              <button
                                type="button"
                                className="admin-exam-btn-delete"
                                onClick={() =>
                                  handleDeleteObjectiveQuestion(
                                    selectedObjectiveQuestionId
                                  )
                                }
                              >
                                삭제
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="admin-exam-btn-save"
                                onClick={handleUpdateObjectiveQuestion}
                              >
                                저장
                              </button>

                              <button
                                type="button"
                                className="admin-exam-btn-cancel"
                                onClick={handleCancelObjectiveEdit}
                              >
                                취소
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="admin-exam-form">
                        <label className="admin-exam-form-group">
                          <span>문제 제목</span>
                          <input
                            type="text"
                            value={objectiveEditForm.title}
                            onChange={(e) =>
                              handleObjectiveFormChange('title', e.target.value)
                            }
                            disabled={!isObjectiveEditing}
                          />
                        </label>

                        <label className="admin-exam-form-group">
                          <span>문제 설명</span>
                          <textarea
                            value={objectiveEditForm.description}
                            onChange={(e) =>
                              handleObjectiveFormChange(
                                'description',
                                e.target.value
                              )
                            }
                            rows={4}
                            disabled={!isObjectiveEditing}
                          />
                        </label>

                        <div className="admin-exam-objective-choice-grid">
                          {[1, 2, 3, 4].map((num) => (
                            <label
                              key={num}
                              className="admin-exam-form-group"
                            >
                              <span>보기 {num}</span>
                              <input
                                type="text"
                                value={objectiveEditForm[`choice${num}`]}
                                onChange={(e) =>
                                  handleObjectiveFormChange(
                                    `choice${num}`,
                                    e.target.value
                                  )
                                }
                                disabled={!isObjectiveEditing}
                              />
                            </label>
                          ))}
                        </div>

                        <div className="admin-exam-objective-small-grid">
                          <label className="admin-exam-form-group">
                            <span>정답 번호</span>
                            <select
                              value={objectiveEditForm.correctAnswer}
                              onChange={(e) =>
                                handleObjectiveFormChange(
                                  'correctAnswer',
                                  e.target.value
                                )
                              }
                              disabled={!isObjectiveEditing}
                              className="admin-exam-select"
                            >
                              <option value="">정답 선택</option>
                              <option value="1">1번</option>
                              <option value="2">2번</option>
                              <option value="3">3번</option>
                              <option value="4">4번</option>
                            </select>
                          </label>

                          <label className="admin-exam-form-group">
                            <span>난이도</span>
                            <select
                              value={objectiveEditForm.difficulty}
                              onChange={(e) =>
                                handleObjectiveFormChange(
                                  'difficulty',
                                  e.target.value
                                )
                              }
                              disabled={!isObjectiveEditing}
                              className="admin-exam-select"
                            >
                              <option value="easy">쉬움</option>
                              <option value="medium">보통</option>
                              <option value="hard">어려움</option>
                            </select>
                          </label>

                          <label className="admin-exam-form-group">
                            <span>점수</span>
                            <input
                              type="number"
                              min="1"
                              value={objectiveEditForm.point}
                              onChange={(e) =>
                                handleObjectiveFormChange('point', e.target.value)
                              }
                              disabled={!isObjectiveEditing}
                            />
                          </label>
                        </div>

                        <label className="admin-exam-form-group">
                          <span>해설</span>
                          <textarea
                            value={objectiveEditForm.explanation}
                            onChange={(e) =>
                              handleObjectiveFormChange(
                                'explanation',
                                e.target.value
                              )
                            }
                            rows={4}
                            disabled={!isObjectiveEditing}
                          />
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}