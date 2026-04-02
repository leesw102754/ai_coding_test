def solution(arr):
    return arr[3]

print(solution([10, 20]))


{
  "problem_title": "배열 접근",
  "problem_description": "배열의 4번째 요소 출력",
  "language": "python",
  "student_code": "def solution(arr):\n    return arr[3]\n\nprint(solution([10, 20]))",
  "test_result": "Index Error",
  "failed_cases": [
    {
      "input": "[10, 20]",
      "expected_output": "네 번째 값",
      "actual_output": "IndexError",
      "reason": "배열 길이 부족"
    }
  ],
  "judge_message": "인덱스 에러 발생"
}