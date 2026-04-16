import { createContext, useContext, useEffect, useState } from 'react';
import { getProblems, solveProblem } from '../api/problemApi';

const ProblemContext = createContext();

export function ProblemProvider({ children }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 추가된 부분 (핵심)
  const getStarterCode = (title) => ({
    javascript: `function solution(input) {
  // ${title}
  // 코드를 작성하세요

  return input;
}
`,

    python: `def solution(input):
    # ${title}
    # 코드를 작성하세요

    return input
`,

    java: `public class Main {
    public static String solution(String input) {
        // ${title}
        // 코드를 작성하세요

        return input;
    }

    public static void main(String[] args) {
        String input = "";
        System.out.println(solution(input));
    }
}
`,

    c: `#include <stdio.h>

int solution(int input) {
    // ${title}
    // 코드를 작성하세요

    return input;
}

int main() {
    int input = 0;
    printf("%d\\n", solution(input));
    return 0;
}
`,

    cpp: `#include <iostream>
using namespace std;

int solution(int input) {
    // ${title}
    // 코드를 작성하세요

    return input;
}

int main() {
    int input = 0;
    cout << solution(input) << endl;
    return 0;
}
`,
  });

  const transformProblem = (p, index = 0) => ({
    id: p.id,
    title: p.title,
    description: p.description,

    number: index + 1,
    difficulty: p.difficulty || 'easy',
    solved: false,
    timeLimit: p.timeLimit || 1000,

    tags: p.tags || ['이론', '기초'],

    // ✅ 여기 수정됨
    starterCode: getStarterCode(p.title),

    testCases: p.testCases || [
      {
        input: '설명형 문제',
        expected: '서술형 답변',
      },
    ],
  });

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await getProblems();

      const data = (res.data || []).map((p, i) => transformProblem(p, i));
      setProblems(data);
    } catch (err) {
      console.error('문제 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const markSolved = async (id) => {
    try {
      await solveProblem(id);

      setProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, solved: true } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const solvedCount = problems.filter((p) => p.solved).length;
  const totalCount = problems.length;

  const stats = {
    easy: problems.filter((p) => p.difficulty === 'easy').length,
    medium: problems.filter((p) => p.difficulty === 'medium').length,
    hard: problems.filter((p) => p.difficulty === 'hard').length,
    solved: solvedCount,
    total: totalCount,
  };

  return (
    <ProblemContext.Provider
      value={{
        problems,
        fetchProblems,
        markSolved,
        stats,
        loading,
      }}
    >
      {children}
    </ProblemContext.Provider>
  );
}

export function useProblem() {
  return useContext(ProblemContext);
}