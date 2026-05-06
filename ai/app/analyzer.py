import os
import json

from dotenv import load_dotenv
from openai import OpenAI

from app.schemas import (
    AnalyzeCodeRequest,
    AnalyzeCodeResponse,
    GenerateTestCasesRequest,
    GenerateTestCasesResponse,
    GenerateProblemDraftRequest,
    GenerateProblemDraftResponse,
    GenerateObjectiveQuestionRequest,
    GenerateObjectiveQuestionResponse,
)
from app.prompt_builder import (
    build_analysis_prompt,
    build_testcase_generation_prompt,
    build_problem_draft_prompt,
    build_objective_question_prompt,
)

load_dotenv()

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        return None

    return OpenAI(
        api_key=api_key,
        timeout=20.0
    )

ALLOWED_ERROR_TYPES = {
    "accepted",
    "logic",
    "runtime",
    "index",
    "compile",
}

ANALYSIS_JSON_SCHEMA = {
    "name": "code_analysis_result",
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "summary": {
                "type": "string",
                "description": "제출 코드의 전반적인 상태 요약"
            },
            "wrong_reason": {
                "type": "string",
                "description": "실패 원인"
            },
            "solution_direction": {
                "type": "string",
                "description": "수정 방향"
            },
            "improvement_feedback": {
                "type": "string",
                "description": "추가 학습/개선 피드백"
            }
        },
        "required": [
            "summary",
            "wrong_reason",
            "solution_direction",
            "improvement_feedback"
        ]
    }
}

PROBLEM_DRAFT_JSON_SCHEMA = {
    "name": "problem_draft_result",
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "title": {"type": "string"},
            "description": {"type": "string"},
            "constraints": {"type": "string"},
            "difficulty": {
                "type": "string",
                "enum": ["easy", "medium", "hard"]
            },
            "testCases": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "input": {"type": "string"},
                        "expectedOutput": {"type": "string"},
                        "description": {"type": "string"}
                    },
                    "required": ["input", "expectedOutput", "description"]
                }
            }
        },
        "required": ["title", "description", "constraints", "difficulty", "testCases"]
    }
}

OBJECTIVE_QUESTION_JSON_SCHEMA = {
    "name": "objective_question_result",
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "title": {"type": "string"},
            "description": {"type": "string"},
            "choice1": {"type": "string"},
            "choice2": {"type": "string"},
            "choice3": {"type": "string"},
            "choice4": {"type": "string"},
            "correctAnswer": {
                "type": "integer",
                "enum": [1, 2, 3, 4]
            },
            "explanation": {"type": "string"},
            "difficulty": {
                "type": "string",
                "enum": ["easy", "medium", "hard"]
            },
            "point": {"type": "integer"},
            "source": {
                "type": "string",
                "enum": ["ai"]
            }
        },
        "required": [
            "title",
            "description",
            "choice1",
            "choice2",
            "choice3",
            "choice4",
            "correctAnswer",
            "explanation",
            "difficulty",
            "point",
            "source"
        ]
    }
}

TESTCASE_JSON_SCHEMA = {
    "name": "testcase_generation_result",
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "recommendedTestCases": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "input": {"type": "string"},
                        "expectedOutput": {"type": "string"},
                        "description": {"type": "string"}
                    },
                    "required": ["input", "expectedOutput", "description"]
                }
            }
        },
        "required": ["recommendedTestCases"]
    }
}


def normalize_error_type(req: AnalyzeCodeRequest) -> str:
    jr = req.judge_result

    if jr is None:
        return "logic"

    status = str(jr.status or "").strip().lower()
    stderr = str(jr.stderr or "").strip().lower()
    compile_output = str(jr.compile_output or "").strip().lower()
    error_type_hint = str(jr.error_type_hint or "").strip().lower()
    failed_cases = jr.failed_cases or []

    # 1. 정답은 최우선
    if status in {"accepted", "correct", "success"}:
        return "accepted"

    # 2. 컴파일/문법 오류
    compile_statuses = {
        "compile",
        "compile_error",
        "syntax_error",
        "ce",
    }

    compile_keywords = [
        "syntaxerror",
        "syntax error",
        "invalid syntax",
        "unexpected eof",
        "expected",
        "cannot find symbol",
        "class, interface, enum, or record expected",
        "not declared",
        "undeclared",
        "compilation failed",
        "compile error",
        "error:",
    ]

    if status in compile_statuses or error_type_hint in compile_statuses:
        return "compile"

    if compile_output and any(keyword in compile_output for keyword in compile_keywords):
        return "compile"

    # Python 문법 오류가 stderr로 오는 경우
    if any(keyword in stderr for keyword in [
        "syntaxerror",
        "invalid syntax",
        "unexpected eof",
    ]):
        return "compile"

    # 3. 인덱스 오류
    index_statuses = {
        "index",
        "index_error",
        "out_of_bounds",
    }

    index_keywords = [
        "indexerror",
        "index error",
        "list index out of range",
        "string index out of range",
        "arrayindexoutofboundsexception",
        "stringindexoutofboundsexception",
        "indexoutofboundsexception",
        "outofbounds",
        "out of bounds",
        "out of range",
        "segmentation fault",
    ]

    if status in index_statuses or error_type_hint in index_statuses:
        return "index"

    if any(keyword in stderr for keyword in index_keywords):
        return "index"

    # 4. 런타임 오류
    runtime_statuses = {
        "runtime",
        "runtime_error",
        "timeout",
        "timeout_error",
        "memory_limit_exceeded",
        "memory_error",
        "type_error",
        "re",
    }

    runtime_keywords = [
        "zerodivisionerror",
        "division by zero",
        "valueerror",
        "typeerror",
        "nullpointerexception",
        "numberformatexception",
        "runtimeerror",
        "recursionerror",
        "stack overflow",
        "time limit",
        "timeout",
        "memory limit",
    ]

    if status in runtime_statuses or error_type_hint in runtime_statuses:
        return "runtime"

    if any(keyword in stderr for keyword in runtime_keywords):
        return "runtime"

    # stderr가 있는데 compile/index/runtime으로 특정되지 않으면 runtime으로 처리
    if stderr:
        return "runtime"

    # 5. 테스트케이스 실패는 로직 오류
    if failed_cases:
        return "logic"

    # 6. 그 외는 logic 기본값
    return "logic"

def build_fallback_response(data: AnalyzeCodeRequest, error_type: str, reason: str = "") -> AnalyzeCodeResponse:
    jr = data.judge_result

    failed_case_text = ""
    if jr and jr.failed_cases:
        first_case = jr.failed_cases[0]
        failed_case_text = (
            f" 입력값은 '{first_case.input}', "
            f"기대 출력은 '{first_case.expected_output}', "
            f"실제 출력은 '{first_case.actual_output}'입니다."
        )

    fallback_messages = {
        "accepted": {
            "summary": "정답입니다.",
            "wrong_reason": "오류가 없습니다.",
            "solution_direction": "현재 코드를 유지하면 됩니다.",
            "improvement_feedback": "다양한 입력도 계속 테스트하는 습관을 가지세요.",
        },
        "logic": {
            "summary": "출력 결과가 기대값과 다릅니다.",
            "wrong_reason": f"테스트케이스에서 기대 출력과 실제 출력이 일치하지 않습니다.{failed_case_text}",
            "solution_direction": "조건문, 반복문, 연산식이 문제 요구사항과 맞는지 확인해야 합니다.",
            "improvement_feedback": "틀린 테스트케이스의 입력과 출력을 직접 비교하는 습관을 가지세요.",
        },
        "runtime": {
            "summary": "코드 실행 중 오류가 발생했습니다.",
            "wrong_reason": "실행 중 예외가 발생해 프로그램이 정상적으로 종료되지 않았습니다.",
            "solution_direction": "입력 처리, 형 변환, 0으로 나누기, null 값 사용 여부를 확인해야 합니다.",
            "improvement_feedback": "예외가 발생할 수 있는 입력을 미리 확인하는 습관을 가지세요.",
        },
        "index": {
            "summary": "인덱스 범위 관련 오류가 발생했습니다.",
            "wrong_reason": "배열, 리스트, 문자열에서 존재하지 않는 위치에 접근했을 가능성이 높습니다.",
            "solution_direction": "접근하려는 인덱스가 0 이상이고 길이보다 작은지 확인해야 합니다.",
            "improvement_feedback": "반복문에서 시작값과 종료 조건을 함께 확인하는 습관을 가지세요.",
        },
        "compile": {
            "summary": "문법 또는 컴파일 오류가 발생했습니다.",
            "wrong_reason": "코드가 실행되기 전에 문법 또는 컴파일 단계에서 오류가 발생했습니다.",
            "solution_direction": "괄호, 세미콜론, 변수명, 클래스명, 들여쓰기 등을 확인해야 합니다.",
            "improvement_feedback": "제출 전 기본 문법 오류가 없는지 먼저 확인하는 습관을 가지세요.",
        },
    }

    selected = fallback_messages.get(error_type, fallback_messages["logic"])

    if reason:
        selected = selected.copy()
        selected["improvement_feedback"] += f" 참고: AI 상세 분석은 사용할 수 없습니다. ({reason})"

    return AnalyzeCodeResponse(
        error_type=error_type,
        summary=selected["summary"],
        wrong_reason=selected["wrong_reason"],
        solution_direction=selected["solution_direction"],
        improvement_feedback=selected["improvement_feedback"],
    )

def analyze_code(data: AnalyzeCodeRequest) -> AnalyzeCodeResponse:
    error_type = normalize_error_type(data)

    client = get_openai_client()

    if client is None:
        return build_fallback_response(
            data,
            error_type,
            "OPENAI_API_KEY가 설정되지 않았습니다."
        )

    prompt = build_analysis_prompt(data, error_type)

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {
                    "role": "system",
                    "content": "당신은 코딩 시험 제출물을 분석하는 교육용 코드 리뷰어입니다."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            text={
                "format": {
                    "type": "json_schema",
                    "name": ANALYSIS_JSON_SCHEMA["name"],
                    "schema": ANALYSIS_JSON_SCHEMA["schema"],
                    "strict": True
                }
            }
        )

        raw_text = response.output_text
        parsed = json.loads(raw_text)

        parsed["error_type"] = error_type

        if parsed["error_type"] not in ALLOWED_ERROR_TYPES:
            parsed["error_type"] = "logic"

        return AnalyzeCodeResponse(**parsed)

    except Exception as e:
        print(f"OpenAI 분석 실패, fallback 응답 사용: {e}")

        return build_fallback_response(
            data,
            error_type,
            str(e)
        )

def generate_problem_draft(data: GenerateProblemDraftRequest) -> GenerateProblemDraftResponse:
    client = get_openai_client()

    if client is None:
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")

    prompt = build_problem_draft_prompt(data)

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {
                "role": "system",
                "content": "당신은 코딩 시험용 문제 초안을 생성하는 AI입니다."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": PROBLEM_DRAFT_JSON_SCHEMA["name"],
                "schema": PROBLEM_DRAFT_JSON_SCHEMA["schema"],
                "strict": True
            }
        }
    )

    raw_text = response.output_text
    parsed = json.loads(raw_text)

    return GenerateProblemDraftResponse(**parsed)

def generate_objective_question(data: GenerateObjectiveQuestionRequest) -> GenerateObjectiveQuestionResponse:
    client = get_openai_client()

    if client is None:
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")

    prompt = build_objective_question_prompt(data)

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {
                "role": "system",
                "content": "당신은 시험용 객관식 문제를 생성하는 AI입니다."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": OBJECTIVE_QUESTION_JSON_SCHEMA["name"],
                "schema": OBJECTIVE_QUESTION_JSON_SCHEMA["schema"],
                "strict": True
            }
        }
    )

    raw_text = response.output_text
    parsed = json.loads(raw_text)

    return GenerateObjectiveQuestionResponse(**parsed)

def generate_testcases(data: GenerateTestCasesRequest) -> GenerateTestCasesResponse:
    client = get_openai_client()

    if client is None:
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")

    prompt = build_testcase_generation_prompt(data)

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {
                "role": "system",
                "content": "당신은 코딩 시험 문제용 테스트케이스를 생성하는 AI입니다."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": TESTCASE_JSON_SCHEMA["name"],
                "schema": TESTCASE_JSON_SCHEMA["schema"],
                "strict": True
            }
        }
    )

    raw_text = response.output_text
    parsed = json.loads(raw_text)

    return GenerateTestCasesResponse(**parsed)