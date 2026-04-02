{
  "problem_title": "테이블 조회",
  "problem_description": "없는 테이블 조회",
  "language": "sql",
  "student_code": "SELECT * FROM unknown_table;",
  "test_result": "Runtime Error",
  "failed_cases": [
    {
      "input": "",
      "expected_output": "데이터 출력",
      "actual_output": "Error",
      "reason": "테이블 없음"
    }
  ],
  "judge_message": "런타임 오류"
}