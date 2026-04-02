from app.analyzer import analyze_code
from app.schemas import CodeAnalysisRequest, FailedCase


sample_request_1 = CodeAnalysisRequest(
    problem_title="배열 접근",
    problem_description="배열의 4번째 요소 출력",
    language="python",
    student_code="def solution(arr):\n    return arr[3]\n\nprint(solution([10, 20]))",
    test_result="Index Error",
    failed_cases=[
        FailedCase(
            input="[10, 20]",
            expected_output="네 번째 값",
            actual_output="IndexError",
            reason="배열 길이 부족"
        )
    ],
    judge_message="인덱스 에러 발생"
)

sample_request_2 = CodeAnalysisRequest(
    problem_title="배열 접근",
    problem_description="배열 값 출력",
    language="c",
    student_code="#include <stdio.h>\nint main(){int arr[2]={1,2};printf(\"%d\",arr[3]);return 0;}",
    test_result="Index Error",
    failed_cases=[
        FailedCase(
            input="",
            expected_output="값 출력",
            actual_output="잘못된 값",
            reason="배열 범위 초과"
        )
    ],
    judge_message="인덱스 오류"
)

sample_request_3 = CodeAnalysisRequest(
    problem_title="배열",
    problem_description="값 출력",
    language="cpp",
    student_code="#include <iostream>\nusing namespace std;int main(){int arr[2]={1,2};cout<<arr[3];}",
    test_result="Index Error",
    failed_cases=[
        FailedCase(
            input="",
            expected_output="값",
            actual_output="오류",
            reason="범위 초과"
        )
    ],
    judge_message="인덱스 오류"
)

sample_request_4 = CodeAnalysisRequest(
    problem_title="배열 접근",
    problem_description="배열 값 출력",
    language="java",
    student_code="public class Main {\n    public static void main(String[] args) {\n        int[] arr = {1, 2};\n        System.out.println(arr[3]);\n    }\n}",
    test_result="Index Error",
    failed_cases=[
        FailedCase(
            input="",
            expected_output="값 출력",
            actual_output="ArrayIndexOutOfBoundsException",
            reason="배열 범위 초과"
        )
    ],
    judge_message="인덱스 에러"
)

sample_request_5 = CodeAnalysisRequest(
    problem_title="평균 이상",
    problem_description="평균 이상 데이터 조회",
    language="sql",
    student_code="SELECT * FROM scores WHERE score > (SELECT AVG(score) FROM scores);",
    test_result="Wrong Answer",
    failed_cases=[
        FailedCase(
            input="",
            expected_output="평균 이상 포함",
            actual_output="평균 제외",
            reason=">= 대신 > 사용"
        )
    ],
    judge_message="논리 오류"
)

sample_request_6 = CodeAnalysisRequest(
    problem_title="나눗셈",
    problem_description="두 수를 나누는 함수",
    language="python",
    student_code="def solution(a, b):\n    return a / b\n\nprint(solution(10, 0))",
    test_result="Runtime Error",
    failed_cases=[
        FailedCase(
            input="10 0",
            expected_output="정상 결과",
            actual_output="ZeroDivisionError",
            reason="0으로 나누기 발생"
        )
    ],
    judge_message="런타임 에러 발생"
)

def run_test_case(title: str, request: CodeAnalysisRequest):
    print(f"\n===== {title} =====")
    result = analyze_code(request)
    print(result.model_dump_json(indent=2, ensure_ascii=False))


if __name__ == "__main__":
    run_test_case("SAMPLE 1", sample_request_1)
    run_test_case("SAMPLE 2", sample_request_2)
    run_test_case("SAMPLE 3", sample_request_3)
    run_test_case("SAMPLE 4", sample_request_4)
    run_test_case("SAMPLE 5", sample_request_5)
    run_test_case("SAMPLE 6", sample_request_6)