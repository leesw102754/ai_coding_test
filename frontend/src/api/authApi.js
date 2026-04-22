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