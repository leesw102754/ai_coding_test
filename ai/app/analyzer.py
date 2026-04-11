import os
import json

from dotenv import load_dotenv
from openai import OpenAI

from app.schemas import AnalyzeCodeRequest, AnalyzeCodeResponse
from app.prompt_builder import build_analysis_prompt

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
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


def normalize_error_type(req: AnalyzeCodeRequest) -> str:
    jr = req.judge_result
    stderr = (jr.stderr or "").lower()
    compile_output = (jr.compile_output or "").lower()
    error_type_hint = (jr.error_type_hint or "").lower()

    # 1. accepted
    if jr.status == "accepted":
        return "accepted"

    # 2. compile / syntax
    if jr.status in {"compile_error", "syntax_error"}:
        return "compile"

    if error_type_hint in {"compile", "compile_error", "syntax_error"}:
        return "compile"

    if "syntaxerror" in stderr or "syntax error" in stderr:
        return "compile"

    if "syntaxerror" in compile_output or "syntax error" in compile_output:
        return "compile"

    if "invalid syntax" in stderr or "unexpected eof" in stderr:
        return "compile"

    # 3. index
    if "indexerror" in stderr or "outofbounds" in stderr or "out of range" in stderr:
        return "index"

    # 4. runtime
    if jr.status in {"runtime_error", "timeout", "memory_limit_exceeded", "type_error"}:
        return "runtime"

    if error_type_hint in {"runtime", "runtime_error", "timeout_error", "memory_error", "type_error"}:
        return "runtime"

    # 5. logic
    return "logic"


def analyze_code(data: AnalyzeCodeRequest) -> AnalyzeCodeResponse:
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")

    error_type = normalize_error_type(data)
    prompt = build_analysis_prompt(data, error_type)

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