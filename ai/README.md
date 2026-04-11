# 📌 AI Code Analyzer

---

## 1. 📌 프로젝트 소개

AI 기반 코드 오류 분석 시스템입니다.

학생이 제출한 코드를 분석하여  
오류 유형을 분류하고, 오류 원인 / 해결 방향 / 개선 피드백을 제공합니다.

👉 백엔드 채점 시스템과 연동하여  
👉 단순 정답/오답이 아닌 "이해 중심 피드백" 제공을 목표로 합니다.

---

## 2. 🚀 주요 기능

- 오류 유형 분류  
  (accepted / logic / runtime / index / compile)
- 오류 원인 분석
- 해결 방향 제시
- 코드 개선 피드백 제공
- JSON 결과 반환
- 다중 언어 지원  
  (Python, C, C++, Java)
- bulk 제출 지원 (여러 문제 동시 처리)

---

## 3. 🔄 전체 시스템 흐름

```
코드 제출
→ 백엔드 채점
→ JudgeResult 생성
→ AI 서버 호출 (/analyze-code)
→ 오류 분석 수행
→ JSON 결과 반환
→ DB 저장 및 프론트 출력
```

---

## 4. 📁 프로젝트 구조

```
ai/
 ┣ app/
 ┃ ┣ analyzer.py
 ┃ ┣ prompt_builder.py
 ┃ ┣ main.py
 ┃ ┣ schemas.py
 ┣ requirements.txt
 ┣ README.md
 ┣ .env.example
```

---

## 5. ⚙️ 실행 방법

### 1) 프로젝트 이동

```bash
cd C:\Users\leesw\capston-ai\ai
```

### 2) 가상환경 생성 및 실행

```bash
python -m venv venv
venv\Scripts\activate
```

### 3) 패키지 설치

```bash
python -m pip install -r requirements.txt
```

### 4) 서버 실행

```bash
python -m uvicorn app.main:app --reload
```

### 5) Swagger 접속

```
http://127.0.0.1:8000/docs
```

---

## 6. 🔑 환경 설정 (.env)

```
OPENAI_API_KEY=YOUR_KEY
AI_INTERNAL_KEY=1234
```

주의:
- 따옴표 ❌
- 공백 ❌
- GitHub 업로드 ❌

---

## 7. 📡 API 정보

### POST /analyze-code

#### 헤더

```
x-api-key: 1234
```

#### 요청 예시

```json
{
  "problem_title": "두 수의 합",
  "problem_description": "두 정수를 입력받아 합을 출력",
  "language": "cpp",
  "student_code": "int main(){...}",
  "test_result": "Wrong Answer",
  "failed_cases": [
    {
      "input": "1 2",
      "expected_output": "3",
      "actual_output": "-1",
      "reason": "덧셈 대신 뺄셈 사용"
    }
  ],
  "judge_message": "logic error"
}
```

#### 응답 예시

```json
{
  "error_type": "logic",
  "summary": "덧셈이 아닌 뺄셈을 수행함",
  "wrong_reason": "연산자 오류",
  "solution_direction": "a + b로 수정 필요",
  "improvement_feedback": "연산자 확인 습관 필요"
}
```

---

## 8. 🔗 백엔드 연동 흐름

```
학생 제출
→ 백엔드 채점
→ 오답 발생
→ AI API 호출
→ 결과 반환
→ DB 저장 / 화면 출력
```

---

## 9. 🎯 핵심 기능 정리

```
✔ 코드 실행 기반 채점 결과 활용
✔ 오류 유형 자동 분류
✔ AI 기반 원인 분석 + 해결 방향 제공
✔ 다중 언어 지원
✔ bulk 처리 가능
```

---

## 10. 🚀 프로젝트 특징

기존 코딩 테스트:
→ 정답 / 오답만 제공

본 시스템:
→ 오류 원인 + 해결 방향 + 개선 피드백 제공

👉 학습 중심 코딩 테스트 시스템

---

## 11. 🌐 서버 주소

```
http://127.0.0.1:8000
```