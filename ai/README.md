# 📌 AI Code Analyzer

---

## 1. 📌 프로젝트 소개

AI 기반 코드 오류 분석 시스템입니다.

학생이 제출한 코드를 분석하여  
오류 유형을 분류하고, 오류 원인 / 해결 방향 / 개선 피드백을 제공합니다.

👉 백엔드 채점 시스템과 연동하여 사용됩니다.

---

## 2. 🚀 주요 기능

- 오류 유형 분류  
  (accepted / logic_error / runtime_error / index_error / compile_error)
- 오류 원인 분석
- 해결 방향 제시
- 코드 개선 피드백 제공
- JSON 결과 반환
- 다중 언어 지원 (Python, C++, Java)
- bulk 제출 지원 (여러 문제 동시 처리)

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

## 4. ⚙️ 실행 방법

### 1) 프로젝트 이동

```bash
cd C:\Users\leesw\capston-ai\ai
```

---

### 2) 가상환경 생성 및 실행

```bash
python -m venv venv
venv\Scripts\activate
```

---

### 3) 패키지 설치

```bash
python -m pip install -r requirements.txt
```

---

### 4) 서버 실행

```bash
python -m uvicorn app.main:app --reload
```

---

### 5) Swagger 접속

```
http://127.0.0.1:8000/docs
```

---

## 5. 🔑 환경 설정 (.env)

📍 위치: `ai/.env`

```
OPENAI_API_KEY=여기에_API_KEY
AI_INTERNAL_KEY=1234
```

주의:

- 따옴표 ❌  
- 공백 ❌  
- GitHub 업로드 ❌  

---

## 6. 📡 API 정보

### POST /analyze-code

---

### 🔐 헤더 (필수)

```
x-api-key: 1234
```

---

### 📥 요청 예시

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
  "judge_message": "논리 오류"
}
```

---

### 📤 응답 예시

```json
{
  "error_type": "logic_error",
  "summary": "덧셈이 아닌 뺄셈을 수행함",
  "wrong_reason": "연산자 오류",
  "solution_direction": "a + b로 수정 필요",
  "improvement_feedback": "연산자 확인 습관 필요"
}
```

---

## 7. 🔗 백엔드 연동 흐름

```
학생 제출
→ 백엔드 채점
→ 오답 발생
→ AI API 호출
→ 결과 반환
→ DB 저장 / 화면 출력
```

---

## 8. 🔧 호출 예시

### Python

```python
import requests

url = "http://127.0.0.1:8000/analyze-code"

response = requests.post(
    url,
    json=data,
    headers={"x-api-key": "1234"}
)

print(response.json())
```

---

### Spring Boot

```java
RestTemplate restTemplate = new RestTemplate();

HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON);
headers.set("x-api-key", "1234");

HttpEntity<Map<String, Object>> request =
        new HttpEntity<>(payload, headers);

ResponseEntity<String> response =
        restTemplate.postForEntity(
                "http://127.0.0.1:8000/analyze-code",
                request,
                String.class
        );

String result = response.getBody();
```

---

## 9. 🌐 서버 주소

```
http://127.0.0.1:8000
```

---

## 10. ❗ 핵심 요약

```
채점 → 오답 → AI 호출 → JSON 피드백 → 저장/출력
(다중 언어 + bulk 지원)
```