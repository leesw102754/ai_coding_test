import os
import logging

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header

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
from app.analyzer import (
    analyze_code,
    generate_testcases,
    generate_problem_draft,
    generate_objective_question,
)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Coding Exam AI Analyzer")


@app.get("/")
def root():
    return {"message": "AI code analyzer server is running"}


@app.post("/analyze-code", response_model=AnalyzeCodeResponse)
def analyze_code_endpoint(
    request: AnalyzeCodeRequest,
    x_api_key: str = Header(default="")
):
    expected_key = os.getenv("AI_INTERNAL_KEY")

    if not expected_key:
        logger.error("AI_INTERNAL_KEY is not set")
        raise HTTPException(status_code=500, detail="서버 설정이 완료되지 않았습니다.")

    if x_api_key != expected_key:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        logger.info(
            "analyze request received | language=%s | judge_status=%s | failed_cases=%d",
            request.language,
            request.judge_result.status,
            len(request.judge_result.failed_cases),
        )
        return analyze_code(request)

    except Exception:
        logger.exception("analyze-code failed")
        raise HTTPException(
            status_code=500,
            detail="코드 분석 처리 중 서버 오류가 발생했습니다."
        )


@app.post("/generate-testcases", response_model=GenerateTestCasesResponse)
def generate_testcases_endpoint(
    request: GenerateTestCasesRequest,
    x_api_key: str = Header(default="")
):
    expected_key = os.getenv("AI_INTERNAL_KEY")

    if not expected_key:
        logger.error("AI_INTERNAL_KEY is not set")
        raise HTTPException(status_code=500, detail="서버 설정이 완료되지 않았습니다.")

    if x_api_key != expected_key:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        logger.info(
            "testcase generation request received | title=%s | difficulty=%s",
            request.title,
            request.difficulty,
        )
        return generate_testcases(request)

    except Exception:
        logger.exception("generate-testcases failed")
        raise HTTPException(
            status_code=500,
            detail="테스트케이스 생성 중 서버 오류가 발생했습니다."
        )


@app.post("/generate-problem-draft", response_model=GenerateProblemDraftResponse)
def generate_problem_draft_endpoint(
    request: GenerateProblemDraftRequest,
    x_api_key: str = Header(default="")
):
    expected_key = os.getenv("AI_INTERNAL_KEY")

    if not expected_key:
        logger.error("AI_INTERNAL_KEY is not set")
        raise HTTPException(status_code=500, detail="서버 설정이 완료되지 않았습니다.")

    if x_api_key != expected_key:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        logger.info("problem draft request received | prompt=%s", request.prompt)
        return generate_problem_draft(request)

    except Exception:
        logger.exception("generate-problem-draft failed")
        raise HTTPException(
            status_code=500,
            detail="문제 초안 생성 중 서버 오류가 발생했습니다."
        )

@app.post("/generate-objective-question", response_model=GenerateObjectiveQuestionResponse)
def generate_objective_question_endpoint(
    request: GenerateObjectiveQuestionRequest,
    x_api_key: str = Header(default="")
):
    expected_key = os.getenv("AI_INTERNAL_KEY")

    if not expected_key:
        logger.error("AI_INTERNAL_KEY is not set")
        raise HTTPException(status_code=500, detail="서버 설정이 완료되지 않았습니다.")

    if x_api_key != expected_key:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        logger.info(
            "objective question generation request received | topic=%s | difficulty=%s",
            request.topic,
            request.difficulty,
        )
        return generate_objective_question(request)

    except Exception:
        logger.exception("generate-objective-question failed")
        raise HTTPException(
            status_code=500,
            detail="객관식 문제 생성 중 서버 오류가 발생했습니다."
        )