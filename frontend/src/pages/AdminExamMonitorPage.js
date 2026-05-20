import { useEffect, useMemo, useState } from 'react';
import {
  getCategories,
  updateCategory,
  getExamWarnings,
  clearExamWarnings,
} from '../api/problemApi';
import './AdminExamMonitorPage.css';

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toLocalDateTimeValue = (date) => {
  const pad = (n) => String(n).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const getExamStatus = (category) => {
  if (!category?.startTime || !category?.endTime) {
    return {
      label: '시간 미설정',
      className: 'status-waiting',
    };
  }

  const now = new Date();
  const start = new Date(category.startTime);
  const end = new Date(category.endTime);

  if (now < start) {
    return {
      label: '시작 전',
      className: 'status-before',
    };
  }

  if (now > end) {
    return {
      label: '종료됨',
      className: 'status-ended',
    };
  }

  return {
    label: '진행 중',
    className: 'status-running',
  };
};

export default function AdminExamMonitorPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [warningLogs, setWarningLogs] = useState([]);
  const [durationInput, setDurationInput] = useState('60');

  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) => String(category.id) === String(selectedCategoryId)
    );
  }, [categories, selectedCategoryId]);

useEffect(() => {
  if (selectedCategory) {
    setDurationInput(String(selectedCategory.durationMinutes || 60));
  }
}, [selectedCategory]);

  const examStatus = getExamStatus(selectedCategory);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const normalCategories = (data || []).filter(
        (category) => !String(category.title || '').includes('튜토리얼')
      );

      setCategories(normalCategories);

      if (!selectedCategoryId && normalCategories.length > 0) {
        setSelectedCategoryId(String(normalCategories[0].id));
      }
    } catch (err) {
      console.error('시험 폴더 조회 실패:', err);
      alert('시험 폴더를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

useEffect(() => {
  let alive = true;

  const fetchWarnings = async () => {
    try {
      const data = await getExamWarnings();

      if (!alive) return;

      setWarningLogs(
        (data || []).map((item, index) => ({
          id: item.id || `${item.time || Date.now()}-${index}`,
          studentId: item.studentId || '-',
          studentName: item.studentName || '-',
          message: item.message || '학생이 시험 화면을 벗어났습니다.',
          time: item.time || new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error('이탈 알림 조회 실패:', err);
    }
  };

  fetchWarnings();

  const timer = setInterval(fetchWarnings, 2000);

  return () => {
    alive = false;
    clearInterval(timer);
  };
}, []);

const getValidatedDuration = () => {
  const duration = Number(durationInput);

  if (!Number.isInteger(duration) || duration <= 0) {
    alert('제한 시간은 1분 이상의 정수로 입력하세요.');
    return null;
  }

  if (duration > 300) {
    alert('제한 시간은 최대 300분까지 설정할 수 있습니다.');
    return null;
  }

  return duration;
};

const handleSaveDuration = async () => {
  if (!selectedCategory) {
    alert('시험 폴더를 선택하세요.');
    return;
  }

  const duration = getValidatedDuration();

  if (!duration) {
    return;
  }

  let newEndTime = selectedCategory.endTime;

  if (selectedCategory.startTime) {
    const start = new Date(selectedCategory.startTime);
    const end = new Date(start.getTime() + duration * 60 * 1000);
    newEndTime = toLocalDateTimeValue(end);
  }

  const status = getExamStatus(selectedCategory);

  if (
    status.label === '진행 중' &&
    !window.confirm(
      '진행 중인 시험의 제한 시간을 변경하면 종료 시간이 다시 계산됩니다. 계속할까요?'
    )
  ) {
    return;
  }

  try {
    setLoading(true);

    await updateCategory(selectedCategory.id, {
      title: selectedCategory.title,
      startTime: selectedCategory.startTime,
      endTime: newEndTime,
      durationMinutes: duration,
    });

    await fetchCategories();

    alert('제한 시간이 변경되었습니다.');
  } catch (err) {
    console.error('제한 시간 변경 실패:', err);
    alert('제한 시간 변경에 실패했습니다.');
  } finally {
    setLoading(false);
  }
};

  const handleStartNow = async () => {
    if (!selectedCategory) {
      alert('시험 폴더를 선택하세요.');
      return;
    }

    const duration = getValidatedDuration();

if (!duration) {
  return;
}
    const now = new Date();
    const end = new Date(now.getTime() + duration * 60 * 1000);

    if (!window.confirm(`${selectedCategory.title} 시험을 지금 시작할까요?`)) {
      return;
    }

    try {
      setLoading(true);

      await updateCategory(selectedCategory.id, {
        title: selectedCategory.title,
        startTime: toLocalDateTimeValue(now),
        endTime: toLocalDateTimeValue(end),
        durationMinutes: duration,
      });

      await fetchCategories();

      alert('시험이 시작 상태로 변경되었습니다.');
    } catch (err) {
      console.error('시험 시작 처리 실패:', err);
      alert('시험 시작 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndNow = async () => {
    if (!selectedCategory) {
      alert('시험 폴더를 선택하세요.');
      return;
    }

    const now = new Date();

    if (!window.confirm(`${selectedCategory.title} 시험을 지금 종료할까요?`)) {
      return;
    }

    try {
      setLoading(true);

      await updateCategory(selectedCategory.id, {
        title: selectedCategory.title,
        startTime: selectedCategory.startTime,
        endTime: toLocalDateTimeValue(now),
        durationMinutes: selectedCategory.durationMinutes || 60,
      });

      await fetchCategories();

      alert('시험이 종료 상태로 변경되었습니다.');
    } catch (err) {
      console.error('시험 종료 처리 실패:', err);
      alert('시험 종료 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBeforeTest = async () => {
    if (!selectedCategory) {
      alert('시험 폴더를 선택하세요.');
      return;
    }

const duration = getValidatedDuration();

if (!duration) {
  return;
}

const start = new Date(Date.now() + 10 * 60 * 1000);
const end = new Date(start.getTime() + duration * 60 * 1000);

    try {
      setLoading(true);

      await updateCategory(selectedCategory.id, {
        title: selectedCategory.title,
        startTime: toLocalDateTimeValue(start),
        endTime: toLocalDateTimeValue(end),
        durationMinutes: duration,
      });

      await fetchCategories();

      alert('시작 전 테스트 상태로 변경되었습니다.');
    } catch (err) {
      console.error('시작 전 테스트 처리 실패:', err);
      alert('시작 전 테스트 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-monitor-page">
      <div className="admin-monitor-header">
        <div>
          <h1>시험 운영 관리</h1>
          <p>시험 폴더별 시작/종료 통제와 학생 이탈 알림을 확인합니다.</p>
        </div>
      </div>

      <section className="monitor-card">
        <h2>시험 폴더 선택</h2>

        <select
          className="monitor-select"
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>

        {selectedCategory && (
          <div className="exam-info-grid">
            <div className="exam-info-item">
              <span>시험 폴더</span>
              <strong>{selectedCategory.title}</strong>
            </div>

            <div className="exam-info-item">
              <span>시작 시간</span>
              <strong>{formatDateTime(selectedCategory.startTime)}</strong>
            </div>

            <div className="exam-info-item">
              <span>종료 시간</span>
              <strong>{formatDateTime(selectedCategory.endTime)}</strong>
            </div>

            <div className="exam-info-item">
              <span>제한 시간</span>
              <strong>{selectedCategory.durationMinutes || 60}분</strong>
            </div>

            <div className="exam-info-item">
              <span>현재 상태</span>
              <strong className={`exam-status ${examStatus.className}`}>
                {examStatus.label}
              </strong>
            </div>
          </div>
        )}

<div className="duration-control-box">
  <label htmlFor="durationInput">제한 시간 변경</label>

  <div className="duration-input-row">
    <input
      id="durationInput"
      type="number"
      min="1"
      max="300"
      value={durationInput}
      onChange={(e) => setDurationInput(e.target.value)}
      disabled={loading}
    />
    <span>분</span>

    <button type="button" onClick={handleSaveDuration} disabled={loading}>
      제한 시간 저장
    </button>
  </div>

  <p>
    제한 시간을 변경하면 선택한 시험 폴더의 종료 시간이 시작 시간 기준으로 다시 계산됩니다.
  </p>
</div>

        <div className="monitor-actions">
          <button type="button" onClick={handleBeforeTest} disabled={loading}>
            시작 전 테스트 상태
          </button>

          <button type="button" onClick={handleStartNow} disabled={loading}>
            지금 시험 시작
          </button>

          <button
            type="button"
            className="danger"
            onClick={handleEndNow}
            disabled={loading}
          >
            지금 시험 종료
          </button>
        </div>
      </section>

      <section className="monitor-card">
        <div className="warning-header">
          <h2>실시간 부정행위 / 이탈 알림</h2>
<button
  type="button"
  onClick={async () => {
    try {
      await clearExamWarnings();
      setWarningLogs([]);
    } catch (err) {
      console.error('알림 비우기 실패:', err);
      alert('알림 비우기에 실패했습니다.');
    }
  }}
  className="clear-btn"
>
  알림 비우기
</button>
        </div>

        {warningLogs.length === 0 ? (
          <div className="empty-warning">
            아직 수신된 이탈 알림이 없습니다.
          </div>
        ) : (
          <div className="warning-list">
            {warningLogs.map((log) => (
              <div key={log.id} className="warning-item">
                <div>
                  <strong>{log.studentName}</strong>
                  <span>({log.studentId})</span>
                </div>

                <p>{log.message}</p>

                <small>{formatDateTime(log.time)}</small>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}