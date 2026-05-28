import { useEffect, useMemo, useState } from 'react';
import {
  deleteAdminUser,
  deleteAdminUsersBulk,
  getAdminUsers,
  updateAdminUser,
} from '../api/authApi';
import './AdminUserManagePage.css';

export default function AdminUserManagePage() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    name: '',
    studentId: '',
    password: '',
  });
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setMessage('');

      const data = await getAdminUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('사용자 목록 조회 실패:', err);
      setMessage(err.response?.data?.message || '사용자 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      return (
        String(user.username || '').toLowerCase().includes(keyword) ||
        String(user.name || '').toLowerCase().includes(keyword) ||
        String(user.studentId || '').toLowerCase().includes(keyword) ||
        String(user.role || '').toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const studentUsers = filteredUsers.filter((user) => !isAdminUser(user));

  const isAllSelected =
    studentUsers.length > 0 &&
    studentUsers.every((user) => selectedIds.includes(user.id));

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(studentUsers.map((user) => user.id));
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      username: user.username || '',
      name: user.name || '',
      studentId: user.studentId || '',
      password: '',
    });
    setMessage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      username: '',
      name: '',
      studentId: '',
      password: '',
    });
  };

  const handleUpdate = async (id) => {
    if (!editForm.username.trim()) {
      alert('아이디를 입력하세요.');
      return;
    }

    if (!editForm.name.trim()) {
      alert('이름을 입력하세요.');
      return;
    }

    if (!editForm.studentId.trim()) {
      alert('학번을 입력하세요.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        username: editForm.username.trim(),
        name: editForm.name.trim(),
        studentId: editForm.studentId.trim(),
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const result = await updateAdminUser(id, payload);

      setMessage(result.message || '사용자 정보가 수정되었습니다.');
      cancelEdit();
      await loadUsers();
    } catch (err) {
      console.error('사용자 정보 수정 실패:', err);
      setMessage(err.response?.data?.message || '사용자 정보 수정 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (isAdminUser(user)) {
      alert('관리자 계정은 삭제할 수 없습니다.');
      return;
    }

    const ok = window.confirm(
      `${user.name || user.username} 계정을 삭제할까요?`
    );

    if (!ok) return;

    try {
      setLoading(true);

      const result = await deleteAdminUser(user.id);
      setMessage(result.message || '사용자가 삭제되었습니다.');
      setSelectedIds((prev) => prev.filter((id) => id !== user.id));

      await loadUsers();
    } catch (err) {
      console.error('사용자 삭제 실패:', err);
      setMessage(err.response?.data?.message || '사용자 삭제 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 학생을 선택하세요.');
      return;
    }

    const ok = window.confirm(
      `선택한 ${selectedIds.length}개 학생 계정을 삭제할까요?`
    );

    if (!ok) return;

    try {
      setLoading(true);

      const result = await deleteAdminUsersBulk(selectedIds);
      setMessage(result.message || '선택한 사용자가 삭제되었습니다.');
      setSelectedIds([]);

      await loadUsers();
    } catch (err) {
      console.error('사용자 일괄 삭제 실패:', err);
      setMessage(err.response?.data?.message || '사용자 일괄 삭제 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-user-page">
      <div className="admin-user-header">
        <div>
          <h2>학생 관리</h2>
          <p>
            회원가입한 학생 계정을 조회하고, 정보 수정 또는 삭제를 할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          className="admin-user-refresh-btn"
          onClick={loadUsers}
          disabled={loading}
        >
          새로고침
        </button>
      </div>

      <div className="admin-user-toolbar">
        <input
          type="text"
          placeholder="아이디, 이름, 학번, 역할 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          type="button"
          className="admin-user-danger-btn"
          onClick={handleBulkDelete}
          disabled={selectedIds.length === 0 || loading}
        >
          선택 삭제 {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
        </button>
      </div>

      {message && (
        <div className="admin-user-message">
          {message}
        </div>
      )}

      <div className="admin-user-summary">
        <div>
          <span>전체 회원</span>
          <strong>{users.length}</strong>
        </div>

        <div>
          <span>학생 계정</span>
          <strong>{users.filter((user) => !isAdminUser(user)).length}</strong>
        </div>

        <div>
          <span>관리자 계정</span>
          <strong>{users.filter((user) => isAdminUser(user)).length}</strong>
        </div>
      </div>

      <div className="admin-user-table-wrap">
        <table className="admin-user-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>아이디</th>
              <th>이름</th>
              <th>학번</th>
              <th>역할</th>
              <th>관리</th>
            </tr>
          </thead>

          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-user-empty">
                  사용자 목록을 불러오는 중입니다...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-user-empty">
                  표시할 사용자가 없습니다.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const admin = isAdminUser(user);
                const editing = editingId === user.id;

                return (
                  <tr key={user.id} className={admin ? 'admin-row' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        disabled={admin}
                        onChange={() => handleSelectOne(user.id)}
                      />
                    </td>

                    <td>{user.id}</td>

                    <td>
                      {editing ? (
                        <input
                          value={editForm.username}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              username: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        user.username
                      )}
                    </td>

                    <td>
                      {editing ? (
                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        user.name
                      )}
                    </td>

                    <td>
                      {editing ? (
                        <input
                          value={editForm.studentId}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              studentId: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        user.studentId
                      )}
                    </td>

                    <td>
                      <span className={`role-badge ${admin ? 'admin' : 'user'}`}>
                        {user.role}
                      </span>
                    </td>

                    <td>
                      {editing ? (
                        <div className="admin-user-actions">
                          <input
                            type="password"
                            placeholder="새 비밀번호 선택"
                            value={editForm.password}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                          />

                          <button
                            type="button"
                            className="admin-user-save-btn"
                            onClick={() => handleUpdate(user.id)}
                            disabled={loading}
                          >
                            저장
                          </button>

                          <button
                            type="button"
                            className="admin-user-cancel-btn"
                            onClick={cancelEdit}
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="admin-user-actions">
                          <button
                            type="button"
                            className="admin-user-edit-btn"
                            onClick={() => startEdit(user)}
                            disabled={admin}
                          >
                            수정
                          </button>

                          <button
                            type="button"
                            className="admin-user-delete-btn"
                            onClick={() => handleDelete(user)}
                            disabled={admin}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function isAdminUser(user) {
  return (
    String(user?.role || '').toUpperCase() === 'ADMIN' ||
    String(user?.username || '').toLowerCase() === 'admin'
  );
}
