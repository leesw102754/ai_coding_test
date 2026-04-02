{
  "problem_title": "합계",
  "problem_description": "합 구하기",
  "language": "cpp",
  "student_code": "#include <iostream>\nusing namespace std;int main(){int arr[3]={1,2,3},sum=0;for(int i=0;i<2;i++)sum+=arr[i];cout<<sum;}",
  "test_result": "Wrong Answer",
  "failed_cases": [
    {
      "input": "",
      "expected_output": "6",
      "actual_output": "3",
      "reason": "루프 오류"
    }
  ],
  "judge_message": "논리 오류"
}