{
  "problem_title": "합계 계산",
  "problem_description": "배열 합 구하기",
  "language": "java",
  "student_code": "public class Main {\n    public static void main(String[] args) {\n        int[] arr = {1,2,3};\n        int sum = 0;\n        for(int i=0;i<arr.length-1;i++){\n            sum += arr[i];\n        }\n        System.out.println(sum);\n    }\n}",
  "test_result": "Wrong Answer",
  "failed_cases": [
    {
      "input": "",
      "expected_output": "6",
      "actual_output": "3",
      "reason": "마지막 값 누락"
    }
  ],
  "judge_message": "논리 오류"
}