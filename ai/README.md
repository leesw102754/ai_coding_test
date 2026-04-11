# 📌 AI Code Analyzer

---

## 1. 📌 프로젝트 소개

AI 기반 코드 오류 분석 시스템입니다.

학생이 제출한 코드를 분석하여
오류 유형을 분류하고, 오류 원인 / 해결 방향 / 개선 피드백을 제공합니다.

👉 백엔드 채점 시스템과 연동하여
👉 단순 정답/오답이 아닌 **이해 중심 피드백 제공**을 목표로 합니다.

---

## 2. 🚀 주요 기능

* 오류 유형 분류
  (accepted / logic / runtime / index / compile)
* 오류 원인 분석
* 해결 방향 제시
* 코드 개선 피드백 제공
* JSON 결과 반환
* 다중 언어 지원
  (Python, C, C++, Java, JavaScript)
* 테스트케이스 기반 자동 채점
* bulk 제출 지원 (여러 문제 동시 처리)

---

## 3. 🔄 전체 시스템 흐름

```
문제 등록 + 테스트케이스 등록
→ 코드 제출
→ 백엔드 채점 (테스트케이스 기반)
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

## 5. ⚙️ 실행 전 설치 (중요)

### 1. 필수 설치

* Python 3.10+
* Node.js
* Java (JDK 17 이상 권장)
* Git

---

### 2. Python 패키지 설치

```bash
cd ai
pip install -r requirements.txt
```

---

### 3. 프론트 실행

```bash
cd frontend
npm install
npm start
```

---

### 4. 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

또는 IntelliJ 실행

---

### 5. AI 서버 실행

```bash
cd ai
python -m uvicorn app.main:app --reload
```

---

## 6. 🚀 전체 실행 순서

```
1. 백엔드 실행
2. AI 서버 실행
3. 프론트 실행
4. 브라우저 접속 (http://localhost:3000)
5. 관리자 페이지에서 문제 등록
6. 테스트케이스 등록
7. 코드 제출 → 결과 확인
```

---

## 7. 🔑 환경 설정 (.env)

```
OPENAI_API_KEY=YOUR_KEY
AI_INTERNAL_KEY=1234
```

주의:

* 따옴표 ❌
* 공백 ❌
* GitHub 업로드 ❌

---

## 8. 📡 API 정보

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

## 9. 🧩 전체 시스템 아키텍처

```
Frontend (React)
→ Backend (Spring Boot)
→ Judge (코드 실행 및 채점)
→ AI Server (FastAPI)
→ 결과 반환 (JSON)
→ DB 저장 및 UI 출력
```

---

## 10. 🧪 테스트케이스 구조

```json
{
  "examId": 2,
  "input": "1 2",
  "expectedOutput": "3"
}
```

👉 테스트케이스 기반 자동 채점 수행

---

## 11. 🧠 오류 유형 정의

| error_type | 설명      |
| ---------- | ------- |
| accepted   | 정답      |
| logic      | 로직 오류   |
| runtime    | 실행 중 오류 |
| index      | 인덱스 오류  |
| compile    | 컴파일 오류  |

---

## 12. 💡 기존 시스템과의 차별점

| 기존 코딩 테스트   | 본 시스템       |
| ----------- | ----------- |
| 정답 / 오답만 제공 | 오류 원인 분석 제공 |
| 피드백 없음      | 해결 방향 제시    |
| 단순 채점       | AI 기반 학습 지원 |
| 문제 풀이 중심    | 이해 중심 학습    |

---

## 13. ⚡ 오프라인 AI 대응 설계 (핵심)

### 📌 설계 목표

인터넷이 없는 시험 환경에서도
최소한의 코드 피드백 제공 가능하도록 설계

---

### 🔄 동작 구조

```
[온라인]
오답 → AI API 호출 → 상세 피드백

[오프라인]
오답 → error_type 기반 분석 → fallback 피드백
```

---

### 🧠 핵심 아이디어

👉 AI 없이도 **채점 결과(error_type)** 만으로
👉 의미 있는 피드백 제공

---

### 🛠 fallback 로직 (핵심 구현)

```python
def fallback_feedback(error_type):
    if error_type == "index_error":
        return {
            "summary": "인덱스 범위를 벗어났습니다.",
            "wrong_reason": "존재하지 않는 인덱스 접근",
            "solution_direction": "배열 길이 확인 필요",
            "improvement_feedback": "인덱스 접근 전 범위 체크"
        }

    elif error_type == "logic_error":
        return {
            "summary": "출력 값이 예상과 다릅니다.",
            "wrong_reason": "연산 또는 조건 오류",
            "solution_direction": "문제 요구사항 다시 확인",
            "improvement_feedback": "테스트케이스 반복 수행"
        }

    elif error_type == "runtime_error":
        return {
            "summary": "실행 중 오류 발생",
            "wrong_reason": "예외 처리 부족",
            "solution_direction": "입력값 검증 필요",
            "improvement_feedback": "예외 처리 코드 추가"
        }

    elif error_type == "compile_error":
        return {
            "summary": "컴파일 오류 발생",
            "wrong_reason": "문법 오류",
            "solution_direction": "코드 문법 확인",
            "improvement_feedback": "괄호/세미콜론 점검"
        }

    else:
        return {
            "summary": "알 수 없는 오류",
            "wrong_reason": "분석 불가",
            "solution_direction": "코드 전체 점검",
            "improvement_feedback": "기본 로직 재확인"
        }
```

---

### 📊 온라인 vs 오프라인 비교

| 구분    | 온라인 AI  | 오프라인 fallback |
| ----- | ------- | ------------- |
| 분석 방식 | GPT API | 규칙 기반         |
| 피드백   | 상세      | 기본            |
| 정확도   | 높음      | 제한적           |
| 속도    | 느릴 수 있음 | 빠름            |
| 인터넷   | 필요      | 필요 없음         |

---

### 🎯 설계 의의

* 시험 환경(LAN)에서도 안정적 사용 가능
* AI 서버 장애 시에도 시스템 유지
* 채점 시스템의 독립성 확보

👉 **AI가 없어도 최소 기능 유지**

---

## 14. 🛠 관리자 기능

* 코딩 문제 등록
* 테스트케이스 UI 입력 및 DB 저장
* 문제 + 테스트케이스 통합 관리

👉 Postman 없이 UI에서 관리 가능

---

## 15. 🌐 서버 주소

```
http://127.0.0.1:8000
```

---
