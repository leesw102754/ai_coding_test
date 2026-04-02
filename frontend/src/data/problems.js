export const problems = [
  {
    id: 1,
    number: '01',
    title: '두 수의 합',
    difficulty: 'easy',
    tags: ['배열', '해시맵'],
    timeLimit: 1000,
    description: `정수 배열 \`nums\`와 정수 \`target\`이 주어졌을 때, 두 수를 더해서 \`target\`이 되는 두 수의 인덱스를 반환하세요.

각 입력에는 정확히 하나의 해답이 존재하며, 동일한 원소를 두 번 사용할 수 없습니다.

**예시 1:**
\`\`\`
입력: nums = [2, 7, 11, 15], target = 9
출력: [0, 1]
설명: nums[0] + nums[1] = 2 + 7 = 9
\`\`\`

**예시 2:**
\`\`\`
입력: nums = [3, 2, 4], target = 6
출력: [1, 2]
\`\`\`

**제약 조건:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9`,
    testCases: [
      { input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]' },
      { input: 'nums = [3, 3], target = 6', expected: '[0, 1]' },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // 여기에 코드를 작성하세요
  
}`,
      python: `def two_sum(nums, target):
    # 여기에 코드를 작성하세요
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // 여기에 코드를 작성하세요
        return new int[]{};
    }
}`,
    },
    solved: false,
  },
  {
    id: 2,
    number: '02',
    title: '유효한 괄호',
    difficulty: 'easy',
    tags: ['스택', '문자열'],
    timeLimit: 1000,
    description: `괄호 문자만 포함된 문자열 \`s\`가 주어졌을 때, 입력 문자열이 유효한지 판단하세요.

유효한 문자열의 조건:
1. 열린 괄호는 동일한 유형의 괄호로 닫혀야 합니다.
2. 열린 괄호는 올바른 순서로 닫혀야 합니다.
3. 모든 닫힌 괄호에는 동일한 유형의 열린 괄호가 있어야 합니다.

**예시 1:**
\`\`\`
입력: s = "()"
출력: true
\`\`\`

**예시 2:**
\`\`\`
입력: s = "()[]{}"
출력: true
\`\`\`

**예시 3:**
\`\`\`
입력: s = "(]"
출력: false
\`\`\`

**제약 조건:**
- 1 <= s.length <= 10^4
- s는 괄호 문자 '(', ')', '{', '}', '[', ']'로만 구성됩니다.`,
    testCases: [
      { input: 's = "()"', expected: 'true' },
      { input: 's = "()[]{}"', expected: 'true' },
      { input: 's = "(]"', expected: 'false' },
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // 여기에 코드를 작성하세요
  
}`,
      python: `def is_valid(s):
    # 여기에 코드를 작성하세요
    pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        // 여기에 코드를 작성하세요
        return false;
    }
}`,
    },
    solved: false,
  },
  {
    id: 3,
    number: '03',
    title: '최대 부분 배열',
    difficulty: 'medium',
    tags: ['동적 프로그래밍', '분할 정복'],
    timeLimit: 2000,
    description: `정수 배열 \`nums\`가 주어졌을 때, 합이 가장 큰 연속 부분 배열(최소 하나의 원소 포함)을 찾고 그 합을 반환하세요.

**예시 1:**
\`\`\`
입력: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
출력: 6
설명: [4, -1, 2, 1]의 합이 6으로 가장 큽니다.
\`\`\`

**예시 2:**
\`\`\`
입력: nums = [1]
출력: 1
\`\`\`

**예시 3:**
\`\`\`
입력: nums = [5, 4, -1, 7, 8]
출력: 23
\`\`\`

**제약 조건:**
- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
    testCases: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', expected: '6' },
      { input: 'nums = [1]', expected: '1' },
      { input: 'nums = [5, 4, -1, 7, 8]', expected: '23' },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // 여기에 코드를 작성하세요
  
}`,
      python: `def max_sub_array(nums):
    # 여기에 코드를 작성하세요
    pass`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // 여기에 코드를 작성하세요
        return 0;
    }
}`,
    },
    solved: false,
  },
  {
    id: 4,
    number: '04',
    title: '이진 트리 최대 깊이',
    difficulty: 'easy',
    tags: ['트리', 'DFS', 'BFS'],
    timeLimit: 1000,
    description: `이진 트리의 루트 노드 \`root\`가 주어졌을 때, 최대 깊이를 반환하세요.

이진 트리의 최대 깊이는 루트 노드에서 가장 먼 리프 노드까지의 가장 긴 경로에 있는 노드의 수입니다.

**예시 1:**
\`\`\`
    3
   / \\
  9  20
    /  \\
   15   7

입력: root = [3, 9, 20, null, null, 15, 7]
출력: 3
\`\`\`

**예시 2:**
\`\`\`
입력: root = [1, null, 2]
출력: 2
\`\`\`

**제약 조건:**
- 트리의 노드 수는 [0, 10^4] 범위에 있습니다.
- -100 <= Node.val <= 100`,
    testCases: [
      { input: 'root = [3, 9, 20, null, null, 15, 7]', expected: '3' },
      { input: 'root = [1, null, 2]', expected: '2' },
      { input: 'root = []', expected: '0' },
    ],
    starterCode: {
      javascript: `/**
 * @param {TreeNode} root
 * @return {number}
 */
function maxDepth(root) {
  // 여기에 코드를 작성하세요
  
}`,
      python: `def max_depth(root):
    # 여기에 코드를 작성하세요
    pass`,
      java: `class Solution {
    public int maxDepth(TreeNode root) {
        // 여기에 코드를 작성하세요
        return 0;
    }
}`,
    },
    solved: false,
  },
  {
    id: 5,
    number: '05',
    title: '단어 검색',
    difficulty: 'medium',
    tags: ['배열', '백트래킹', 'DFS'],
    timeLimit: 2000,
    description: `m x n 격자 \`board\`와 문자열 \`word\`가 주어졌을 때, 격자에 단어가 존재하면 \`true\`를 반환하세요.

단어는 인접한 셀의 문자로 구성될 수 있으며, 인접한 셀은 수평 또는 수직으로 이웃합니다. 동일한 셀은 두 번 이상 사용할 수 없습니다.

**예시 1:**
\`\`\`
board = [["A","B","C","E"],
         ["S","F","C","S"],
         ["A","D","E","E"]]
word = "ABCCED"
출력: true
\`\`\`

**예시 2:**
\`\`\`
board = [["A","B","C","E"],
         ["S","F","C","S"],
         ["A","D","E","E"]]
word = "SEE"
출력: true
\`\`\`

**제약 조건:**
- m == board.length
- n = board[i].length
- 1 <= m, n <= 6
- 1 <= word.length <= 15`,
    testCases: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', expected: 'true' },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', expected: 'true' },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', expected: 'false' },
    ],
    starterCode: {
      javascript: `/**
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
function exist(board, word) {
  // 여기에 코드를 작성하세요
  
}`,
      python: `def exist(board, word):
    # 여기에 코드를 작성하세요
    pass`,
      java: `class Solution {
    public boolean exist(char[][] board, String word) {
        // 여기에 코드를 작성하세요
        return false;
    }
}`,
    },
    solved: false,
  },
  {
    id: 6,
    number: '06',
    title: '코인 변환',
    difficulty: 'medium',
    tags: ['동적 프로그래밍', '배열'],
    timeLimit: 2000,
    description: `서로 다른 동전의 금액을 나타내는 정수 배열 \`coins\`와 총 금액을 나타내는 정수 \`amount\`가 주어졌을 때, 해당 금액을 만들 수 있는 최소 동전 수를 반환하세요. 어떤 동전의 조합으로도 해당 금액을 만들 수 없으면 \`-1\`을 반환하세요.

각 종류의 동전은 무한히 사용할 수 있습니다.

**예시 1:**
\`\`\`
입력: coins = [1, 5, 10, 25], amount = 36
출력: 3
설명: 25 + 10 + 1 = 36
\`\`\`

**예시 2:**
\`\`\`
입력: coins = [2], amount = 3
출력: -1
\`\`\`

**제약 조건:**
- 1 <= coins.length <= 12
- 1 <= coins[i] <= 2^31 - 1
- 0 <= amount <= 10^4`,
    testCases: [
      { input: 'coins = [1, 5, 10, 25], amount = 36', expected: '3' },
      { input: 'coins = [2], amount = 3', expected: '-1' },
      { input: 'coins = [1], amount = 0', expected: '0' },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // 여기에 코드를 작성하세요
  
}`,
      python: `def coin_change(coins, amount):
    # 여기에 코드를 작성하세요
    pass`,
      java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        // 여기에 코드를 작성하세요
        return -1;
    }
}`,
    },
    solved: false,
  },
  {
    id: 7,
    number: '07',
    title: '최장 공통 부분 수열',
    difficulty: 'hard',
    tags: ['동적 프로그래밍', '문자열'],
    timeLimit: 3000,
    description: `두 문자열 \`text1\`과 \`text2\`가 주어졌을 때, 두 문자열의 최장 공통 부분 수열(LCS)의 길이를 반환하세요. 공통 부분 수열이 없으면 \`0\`을 반환하세요.

부분 수열은 원래 문자열에서 일부 문자를 삭제하여 만들 수 있는 새 문자열로, 나머지 문자의 순서는 변경되지 않습니다.

**예시 1:**
\`\`\`
입력: text1 = "abcde", text2 = "ace"
출력: 3
설명: 최장 공통 부분 수열은 "ace"이고 길이는 3입니다.
\`\`\`

**예시 2:**
\`\`\`
입력: text1 = "abc", text2 = "abc"
출력: 3
설명: 최장 공통 부분 수열은 "abc"이고 길이는 3입니다.
\`\`\`

**예시 3:**
\`\`\`
입력: text1 = "abc", text2 = "def"
출력: 0
\`\`\`

**제약 조건:**
- 1 <= text1.length, text2.length <= 1000
- text1과 text2는 소문자 영문자로만 구성됩니다.`,
    testCases: [
      { input: 'text1 = "abcde", text2 = "ace"', expected: '3' },
      { input: 'text1 = "abc", text2 = "abc"', expected: '3' },
      { input: 'text1 = "abc", text2 = "def"', expected: '0' },
    ],
    starterCode: {
      javascript: `/**
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 */
function longestCommonSubsequence(text1, text2) {
  // 여기에 코드를 작성하세요
  
}`,
      python: `def longest_common_subsequence(text1, text2):
    # 여기에 코드를 작성하세요
    pass`,
      java: `class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        // 여기에 코드를 작성하세요
        return 0;
    }
}`,
    },
    solved: false,
  },
];
