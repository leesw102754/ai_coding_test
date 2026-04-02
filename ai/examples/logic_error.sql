{
  "problem_title": "평균 이상",
  "problem_description": "평균 이상 데이터 조회",
  "language": "sql",
  "student_code": "SELECT * FROM scores WHERE score > (SELECT AVG(score) FROM scores);",
  "test_result": "Wrong Answer",
  "failed_cases": [
    {
      "input": "",
      "expected_output": "평균 이상 포함",
      "actual_output": "평균 제외",
      "reason": ">= 대신 > 사용"
    }
  ],
  "judge_message": "논리 오류"
}