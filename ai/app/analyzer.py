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
    "logic_error",
    "runtime_error",
    "index_error",
    "syntax_error",
    "compile_error",
    "type_error",
    "timeout_error",
    "memory_error",
    "wrong_answer",
    "unknown_error",
}


def normalize_error_type(req: AnalyzeCodeRequest) -> str:
    jr = req.judge_result
    stderr = (jr.stderr or "").lower()
    compile_output = (jr.compile_output or "").lower()

    if jr.error_type_hint:
        return jr.error_type_hint

    if jr.status == "timeout":
        return "timeout_error"

    if jr.status == "memory_limit_exceeded":
        return "memory_error"

    if jr.status == "compile_error":
        return "compile_error"

    if jr.status == "syntax_error":
        return "syntax_error"

    if jr.status == "type_error":
        return "type_error"

    if jr.status == "wrong_answer":
        return "logic_error"

    if "indexerror" in stderr or "outofbounds" in stderr or "out of range" in stderr:
        return "index_error"

    if "typeerror" in stderr or "incompatible types" in compile_output:
        return "type_error"

    if "syntaxerror" in stderr or "syntax error" in compile_output:
        return "syntax_error"

    if jr.status == "runtime_error":
        return "runtime_error"

    return "unknown_error"


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
        parsed["error_type"] = "unknown_error"

    return AnalyzeCodeResponse(**parsed)