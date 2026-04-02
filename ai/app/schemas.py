from typing import List, Optional, Literal
from pydantic import BaseModel, Field

ErrorType = Literal[
    "logic_error",
    "runtime_error",
    "index_error",
    "syntax_error",
    "compile_error",
    "type_error",
    "timeout_error",
    "memory_error",
    "wrong_answer",
    "unknown_error"
]

JudgeStatus = Literal[
    "accepted",
    "wrong_answer",
    "runtime_error",
    "compile_error",
    "timeout",
    "memory_limit_exceeded",
    "syntax_error",
    "type_error",
    "unknown_error"
]

class FailedCase(BaseModel):
    input: str = ""
    expected_output: str = ""
    actual_output: str = ""
    reason: str = ""

class JudgeResult(BaseModel):
    status: JudgeStatus
    error_type_hint: Optional[ErrorType] = None
    stdout: str = ""
    stderr: str = ""
    compile_output: str = ""
    execution_time_ms: Optional[int] = None
    memory_kb: Optional[int] = None
    failed_cases: List[FailedCase] = Field(default_factory=list)

class AnalyzeCodeRequest(BaseModel):
    problem_title: str
    problem_description: str
    language: str
    student_code: str
    judge_result: JudgeResult

class AnalyzeCodeResponse(BaseModel):
    error_type: ErrorType
    summary: str
    wrong_reason: str
    solution_direction: str
    improvement_feedback: str