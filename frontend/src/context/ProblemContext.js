import { createContext, useContext, useEffect, useState } from 'react';
import { getProblems, solveProblem } from '../api/problemApi';

const ProblemContext = createContext();

export function ProblemProvider({ children }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

 const getStarterCode = (title) => ({
  javascript: `const input = require('fs').readFileSync(0, 'utf-8');

// ${title}

let result = input.trim();

// ----------

// ----------

console.log(result);
`,

  python: `import sys

# ${title}

input_data = sys.stdin.read()
result = input_data.strip()

# ----------

# ----------

print(result)
`,

  java: `import java.io.BufferedReader;
import java.io.InputStreamReader;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        // ${title}

        String input = br.readLine();
        String result = input.trim();

        // ----------

        // ----------

        System.out.println(result);
    }
}
`,

  c: `#include <stdio.h>

int main() {
    // ${title}

    int input = 0;
    scanf("%d", &input);
    int result = input;

    // ----------

    // ----------

    printf("%d\\n", result);
    return 0;
}
`,

  cpp: `#include <iostream>
using namespace std;

int main() {
    // ${title}

    int input = 0;
    cin >> input;
    int result = input;

    // ----------

    // ----------

    cout << result << endl;
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
  point: Number(p.point ?? 0),
  solved: false,
  timeLimit: p.timeLimit || 1000,

  tags: p.tags || ['이론', '기초'],
  starterCode: getStarterCode(p.title),

  testCases: p.testCases || [
    {
      input: '설명형 문제',
      expected: '서술형 답변',
    },
  ],

 constraints: p.constraints || '',
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