import { useEffect, useState } from 'react';
import { getProblems, deleteExam, updateExam } from '../api/problemApi';
import './AdminExamManagePage.css';

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
  });

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const filteredProblems = problems.filter((problem) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      problem.title?.toLowerCase().includes(keyword) ||
      problem.description?.toLowerCase().includes(keyword);

    const matchesDifficulty =
      difficultyFilter === 'all' ||
      (problem.difficulty || 'easy') === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await getProblems();
      setProblems(res.data || []);
    } catch (err) {
      console.error('문제 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleSelectProblem = (problem) => {
  setSelectedProblem(problem);
  setEditForm({
    title: problem.title || '',
    description: problem.description || '',
    constraints: problem.constraints || '',
    difficulty: problem.difficulty || 'easy',
  });
  setIsEditing(false);
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
      }

      alert('문제가 삭제되었습니다.');
    } catch (err) {
      console.error('문제 삭제 실패:', err);
      alert('문제 삭제에 실패했습니다.');
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
  });
  setIsEditing(false);
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
      alert('제목과 설명은 필수입니다.');
      return;
    }

    try {
      await updateExam(selectedProblem.id, {
 	 title: editForm.title,
  	description: editForm.description,
 	 constraints: editForm.constraints,
  	difficulty: editForm.difficulty,
	});

	const updatedProblem = {
 	 ...selectedProblem,
 	 title: editForm.title,
 	 description: editForm.description,
	  constraints: editForm.constraints,
 	 difficulty: editForm.difficulty,
	};

      setProblems((prev) =>
        prev.map((p) => (p.id === selectedProblem.id ? updatedProblem : p))
      );

      setSelectedProblem(updatedProblem);
      setIsEditing(false);

      alert('문제가 수정되었습니다.');
    } catch (err) {
      console.error('문제 수정 실패:', err);
      alert('문제 수정에 실패했습니다.');
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

          <div className="admin-exam-toolbar">
            <input
              type="text"
              className="admin-exam-search"
              placeholder="문제 제목 또는 설명 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

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
          ) : problems.length === 0 ? (
            <div className="admin-exam-empty-box">
              등록된 문제가 없습니다.
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="admin-exam-empty-box">
              검색 또는 필터 결과가 없습니다.
            </div>
          ) : (
            <div className="admin-exam-list">
              {filteredProblems.map((problem) => (
                <div
                  key={problem.id}
                  className={`admin-exam-card ${
                    selectedProblem?.id === problem.id ? 'active' : ''
                  }`}
                  onClick={() => handleSelectProblem(problem)}
                >
                  <div className="admin-exam-card-top">
                    <span className="admin-exam-id">문제 #{problem.id}</span>

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

                  <h3 className="admin-exam-card-title">{problem.title}</h3>

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
            </>
          )}
        </section>
      </div>
    </div>
  );
}