{
  "problem_title": "합계",
  "problem_description": "합 구하기",
  "language": "c",
  "student_code": "#include <stdio.h>\nint main(){int arr[3]={1,2,3},sum=0;for(int i=0;i<2;i++){sum+=arr[i];}printf(\"%d\",sum);return 0;}",
  "test_result": "Wrong Answer",
  "failed_cases": [
    {
      "input": "",
      "expected_output": "6",
      "actual_output": "3",
      "reason": "반복 범위 오류"
    }
  ],
  "judge_message": "논리 오류"
}