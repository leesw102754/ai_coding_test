import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const getProblems = () => API.get('/exams');

export const solveProblem = (id) =>
  API.patch(`/exams/${id}`, { solved: true });

export const submitExam = async (data) => {
  const res = await API.post('/submissions', data);
  return res.data;
};

export const createExam = async (data) => {
  const res = await API.post('/exams', data);
  return res.data;
};

export const createTestCase = async (data) => {
  const res = await API.post('/testcases', data);
  return res.data;
};

export const recommendAiTestCases = async (data) => {
  const res = await API.post('/ai/testcases/recommend', data);
  return res.data;
};

export const generateAiProblemDraft = async (data) => {
  const res = await API.post('/ai/problems/generate', data);
  return res.data;
};

export const getTestCasesByExamId = async (examId) => {
  const res = await API.get(`/exams/${examId}/testcases`);
  return res.data;
};

export const getAllSubmissions = async () => {
  const res = await API.get('/submissions');
  return res.data;
};

export const getSubmissionDetail = async (id) => {
  const res = await API.get(`/submissions/${id}`);
  return res.data;
};

export const deleteExam = async (id) => {
  const res = await API.delete(`/exams/${id}`);
  return res.data;
};

export const updateExam = async (id, data) => {
  const res = await API.patch(`/exams/${id}`, data);
  return res.data;
};

export const getSubmissionsByStudentId = async (studentId) => {
  const res = await API.get(`/submissions/student/${studentId}`);
  return res.data;
};

export const runExamTestCases = async (examId, data) => {
  const res = await API.post(`/exams/${examId}/run-tests`, data);
  return res.data;
};

export const reanalyzeSubmissionWithAi = async (submissionId) => {
  const res = await API.post(`/submissions/${submissionId}/reanalyze-ai`);
  return res.data;
};

export const reanalyzeAllSubmissionsWithAi = async () => {
  const res = await API.post('/submissions/reanalyze-ai');
  return res.data;
};

