{
  "problem_title": "배열 접근",
  "problem_description": "배열 값 출력",
  "language": "c",
  "student_code": "#include <stdio.h>\nint main(){int arr[2]={1,2};printf(\"%d\",arr[3]);return 0;}",
  "test_result": "Index Error",
  "failed_cases": [
    {
      "input": "",
      "expected_output": "값 출력",
      "actual_output": "잘못된 값",
      "reason": "배열 범위 초과"
    }
  ],
  "judge_message": "인덱스 오류"
}