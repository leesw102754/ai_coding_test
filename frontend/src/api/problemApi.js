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

export const getCategories = async () => {
  const res = await API.get('/categories');
  return res.data;
};

export const createCategory = async (data) => {
  const res = await API.post('/categories', data);
  return res.data;
};

export const deleteCategory = async (categoryId) => {
  const res = await API.delete(`/categories/${categoryId}`);
  return res.data;
};

export const getExamsByCategoryId = async (categoryId) => {
  const res = await API.get(`/exams/category/${categoryId}`);
  return res.data;
};

export const createObjectiveQuestion = async (data) => {
  const res = await API.post('/objective/questions', data);
  return res.data;
};

export const getObjectiveQuestions = async () => {
  const res = await API.get('/objective/questions');
  return res.data;
};

export const getObjectiveQuestionsByCategoryId = async (categoryId) => {
  const res = await API.get(`/objective/questions/category/${categoryId}`);
  return res.data;
};

export const deleteObjectiveQuestion = async (id) => {
  const res = await API.delete(`/objective/questions/${id}`);
  return res.data;
};

export const generateAiObjectiveQuestion = async (data) => {
  const res = await API.post('/objective/ai-generate', data);
  return res.data;
};

export const submitObjectiveAnswer = async (data) => {
  const res = await API.post('/objective/submissions', data);
  return res.data;
};

export const getObjectiveSubmissions = async () => {
  const res = await API.get('/objective/submissions');
  return res.data;
};

export const getObjectiveSubmissionsByStudentId = async (studentId) => {
  const res = await API.get(`/objective/submissions/student/${studentId}`);
  return res.data;
};

export const getObjectiveSubmissionsByCategoryId = async (categoryId) => {
  const res = await API.get(`/objective/submissions/category/${categoryId}`);
  return res.data;
};
