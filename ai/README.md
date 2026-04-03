# 📌 AI Code Analyzer

---

## 1. 📌 프로젝트 소개

AI 기반 코드 오류 분석 시스템입니다.

학생이 제출한 코드를 분석하여
오류 유형을 분류하고, 오류 원인 / 해결 방향 / 개선 피드백을 제공합니다.

👉 본 시스템은 **단독 실행용이 아닌, 백엔드 채점 시스템과 연동하여 사용됩니다.**

---

## 2. 🚀 주요 기능

* 코드 오류 유형 분류
  (logic_error / index_error / runtime_error)
* 오류 원인 분석
* 해결 방향 제시
* 코드 개선 피드백 제공
* JSON 형태 결과 반환

※ 정답 코드를 제공하지 않고 **오류 분석 중심**으로 동작합니다.

---

## 3. 📁 프로젝트 구조

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

## 4. ⚙️ 실행 방법 (Windows 기준)

### 1. Python 설치

https://www.python.org/downloads/

설치 시:

* ✅ Add Python to PATH 체크

확인:

```bash
python --version
pip --version
```

---

### 2. 프로젝트 이동

```bash
cd 해당 폴더
```

---

### 3. 가상환경 생성 및 실행

```bash
python -m venv venv
venv\Scripts\activate
```

---

### 4. 패키지 설치

```bash
python -m pip install -r requirements.txt
```

---

### 5. 서버 실행

```bash
python -m uvicorn app.main:app --reload
```

---

### 6. Swagger 접속

```
http://127.0.0.1:8000/docs
```

---

## 5. 🔑 환경 설정 (.env)

📍 위치: `ai/.env`

```text
OPENAI_API_KEY=여기에_API_KEY
AI_INTERNAL_KEY=1234
```

주의:

* 따옴표 ❌
* 공백 ❌
* `.env.txt` ❌
* GitHub 업로드 ❌

---

## 6. 📡 API 정보

### 📍 Endpoint

```
POST /analyze-code
```

---

### 🔐 내부 인증 (필수)

```
x-api-key: 1234
```

👉 헤더 없으면 **403 Forbidden 발생**

---

### 📍 요청 JSON

```json
{
  "problem_title": "평균 이상",
  "problem_description": "평균 이상 데이터 조회",
  "language": "sql",
  "student_code": "SELECT * FROM scores WHERE score > (SELECT AVG(score) FROM scores);",
  "test_result": "Wrong Answer",
  "failed_cases": [
    {
      "input": "",
      "expected_output": "평균 이상 포함",
      "actual_output": "평균 제외",
      "reason": ">= 대신 > 사용"
    }
  ],
  "judge_message": "논리 오류"
}
```

---

### 📍 응답 JSON

```json
{
  "error_type": "logic_error",
  "summary": "평균 이상이 아니라 평균 초과 데이터만 조회함",
  "wrong_reason": ">= 대신 > 사용",
  "solution_direction": ">= 사용으로 수정 필요",
  "improvement_feedback": "조건 표현 정확히 확인 필요"
}
```

---

## 7. 🔗 백엔드 연동 방법

### 📍 전체 흐름

```
학생 제출
→ 백엔드 채점
→ 오답 발생
→ failed_cases 생성
→ AI API 호출
→ JSON 피드백 반환
→ DB 저장 / 결과 출력
```

---

### 📍 호출 조건

```
test_result != "Accepted"
```

---

### 📍 test_result 값

```
Accepted
Wrong Answer
Runtime Error
```

---

### 📍 필수 데이터

| 필드                  | 필수 |
| ------------------- | -- |
| problem_title       | ✅  |
| problem_description | ✅  |
| language            | ✅  |
| student_code        | ✅  |
| test_result         | ✅  |
| failed_cases        | ✅  |
| judge_message       | 선택 |

---

### 📍 failed_cases 구조

```json
{
  "input": "",
  "expected_output": "",
  "actual_output": "",
  "reason": ""
}
```

---

## 8. 🔧 백엔드 호출 예시

### Python

```python
import requests

def call_ai_api(data):
    url = "http://127.0.0.1:8000/analyze-code"
    response = requests.post(
        url,
        json=data,
        headers={"x-api-key": "capstone-secret-key"}
    )
    return response.json()
```

---

### Spring Boot

```java
RestTemplate restTemplate = new RestTemplate();

String url = "http://127.0.0.1:8000/analyze-code";

HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON);
headers.set("x-api-key", "capstone-secret-key");

HttpEntity<Map<String, Object>> request =
        new HttpEntity<>(payload, headers);

ResponseEntity<String> response =
        restTemplate.postForEntity(url, request, String.class);

String result = response.getBody();
```

---

## 9. 🌐 서버 주소

```
개발: http://127.0.0.1:8000
배포: http://서버IP:8000
```

---

## 10. ❗ Troubleshooting

### 서버 실행 오류

```bash
python -m uvicorn app.main:app --reload
```

---

### API 키 오류

* `.env` 확인
* OPENAI_API_KEY 값 확인

---

### 403 오류

* x-api-key 헤더 확인
* AI_INTERNAL_KEY 값 확인

---

### 패키지 오류

```bash
python -m pip install -r requirements.txt
```

---

### JSON 오류

* 필드 누락 확인
* failed_cases 구조 확인

---

### 서버 연결 실패

* 포트 확인 (8000)
* URL 확인

---

## 11. 📌 핵심 요약

```
백엔드 → 채점 → 오답 발생 → AI 호출 → JSON 피드백 반환 → 저장 및 출력
```

---
