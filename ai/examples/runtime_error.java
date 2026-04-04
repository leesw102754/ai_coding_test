{
  "problem_title": "나누기",
  "problem_description": "두 수를 나누는 프로그램",
  "language": "java",
  "student_code": "public class Main {\n    public static void main(String[] args) {\n        int a = 10;\n        int b = 0;\n        System.out.println(a / b);\n    }\n}",
  "test_result": "Runtime Error",
  "failed_cases": [
    {
      "input": "",
      "expected_output": "정상 출력",
      "actual_output": "ArithmeticException",
      "reason": "0으로 나눔"
    }
  ],
  "judge_message": "런타임 에러 발생"
}