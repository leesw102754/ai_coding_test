import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// 로그인
export const login = async ({ username, password }) => {
  await new Promise(res => setTimeout(res, 500)); // fake delay

  const res = await API.post('/login', {
    username,
    password,
  });

  return res.data;
};

// 회원가입
export const signup = async ({ username, password, name, studentId }) => {
  const res = await API.post('/signup', {
    username,
    password,
    name,
    studentId,
  });

  return res.data;
};

// 아이디 중복 확인
export const checkUsername = async (username) => {
  const res = await API.get(`/check-username/${username}`);
  return res.data;
};

// 학번 중복 확인
export const checkStudentId = async (studentId) => {
  const res = await API.get(`/check-studentid/${studentId}`);
  return res.data;
};

// 관리자용 전체 사용자 조회
export const getAdminUsers = async () => {
  const res = await API.get('/admin/users');
  return res.data;
};

// 관리자용 사용자 정보 수정
export const updateAdminUser = async (id, data) => {
  const res = await API.patch(`/admin/users/${id}`, data);
  return res.data;
};

// 관리자용 특정 사용자 삭제
export const deleteAdminUser = async (id) => {
  const res = await API.delete(`/admin/users/${id}`);
  return res.data;
};

// 관리자용 선택 사용자 일괄 삭제
export const deleteAdminUsersBulk = async (ids) => {
  const res = await API.delete('/admin/users/bulk', {
    data: { ids },
  });

  return res.data;
};
