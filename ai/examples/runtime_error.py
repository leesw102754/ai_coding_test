def solution(a, b):
    return a / b

print(solution(10, 0))

{
  "problem_title": "나누기 함수",
  "problem_description": "두 수를 나누는 함수",
  "language": "python",
  "student_code": "def solution(a, b):\n    return a / b\n\nprint(solution(10, 0))",
  "test_result": "Runtime Error",
  "failed_cases": [
    {
      "input": "10 0",
      "expected_output": "정상 출력",
      "actual_output": "ZeroDivisionError",
      "reason": "0으로 나눔"
    }
  ],
  "judge_message": "런타임 에러 발생"
}