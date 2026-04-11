import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const getProblems = () => API.get('/exams'); // 너 API 맞춤

export const solveProblem = (id) =>
  API.patch(`/exams/${id}`, { solved: true });

export const submitExam = async (data) => {
  const res = await API.post('/submissions', data);
  return res.data;
};

// 관리자 문제 등록
export const createExam = async (data) => {
  const res = await API.post('/exams', data);
  return res.data;
};

// 테스트케이스 등록
export const createTestCase = async (data) => {
  const res = await API.post('/testcases', data);
  return res.data;
};

// 특정 문제의 테스트케이스 조회
export const getTestCasesByExamId = async (examId) => {
  const res = await API.get(`/exams/${examId}/testcases`);
  return res.data;
};