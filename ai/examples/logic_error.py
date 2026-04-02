def solution(scores):
    total = 0
    for i in range(len(scores)):
        total += scores[i]
    average = total // len(scores)

    count = 0
    for s in scores:
        if s > average:
            count += 1
    return count

print(solution([70, 80, 90, 60, 75]))


{
  "problem_title": "평균 이상 학생 수",
  "problem_description": "평균 이상인 학생 수 구하기",
  "language": "python",
  "student_code": "def solution(scores):\n    total = 0\n    for i in range(len(scores)):\n        total += scores[i]\n    average = total // len(scores)\n\n    count = 0\n    for s in scores:\n        if s > average:\n            count += 1\n    return count\n\nprint(solution([70, 80, 90, 60, 75]))",
  "test_result": "Wrong Answer",
  "failed_cases": [
    {
      "input": "[70, 80, 90, 60, 75]",
      "expected_output": "3",
      "actual_output": "2",
      "reason": "평균과 같은 값 제외"
    }
  ],
  "judge_message": "논리 오류 발생"
}