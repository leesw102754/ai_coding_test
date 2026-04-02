import os
import logging

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header

from app.schemas import AnalyzeCodeRequest, AnalyzeCodeResponse
from app.analyzer import analyze_code

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