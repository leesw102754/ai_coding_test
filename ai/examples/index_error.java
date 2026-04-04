{
  "problem_title": "배열 접근",
  "problem_description": "배열 값 출력",
  "language": "java",
  "student_code": "public class Main {\n    public static void main(String[] args) {\n        int[] arr = {1, 2};\n        System.out.println(arr[3]);\n    }\n}",
  "test_result": "Index Error",
  "failed_cases": [
    {
      "input": "",
      "expected_output": "값 출력",
      "actual_output": "ArrayIndexOutOfBoundsException",
      "reason": "배열 범위 초과"
    }
  ],
  "judge_message": "인덱스 에러"
}