# CodeTest - 오프라인 코딩 테스트 플랫폼

React + npm + Webpack 기반의 오프라인 코딩 테스트 플랫폼입니다.

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | React 19 |
| 번들러 | Webpack 5 (Vite 플러그인 미사용) |
| 트랜스파일러 | Babel 7 |
| 라우터 | React Router DOM v7 |
| 코드 에디터 | Monaco Editor (@monaco-editor/react) |
| 패키지 관리 | npm |

## 주요 기능

### 메인 페이지
- 7개의 알고리즘 문제 목록 (쉬움 3, 보통 3, 어려움 1)
- 문제 검색 및 난이도 필터링
- 진행 현황 및 통계 사이드바
- 흑/백 테마 전환 (우측 상단 버튼)

### 시험 페이지
- **전체화면 강제 전환**: 시험 시작 시 자동으로 전체화면 모드 진입
- **창 이동 방지**: 다른 탭/창으로 이동 시 경고 팝업 및 전체화면 복귀
- **키보드 단축키 차단**: Alt+Tab, Alt+F4, Ctrl+W 등 차단
- **우클릭 방지**: 시험 중 컨텍스트 메뉴 비활성화
- Monaco Editor 기반 코드 에디터 (JavaScript, Python, Java)
- 실시간 타이머
- 테스트 케이스 실행 및 제출

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (http://localhost:3000)
npm start

# 프로덕션 빌드
npm run build
```

## 프로젝트 구조

```
codetest/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js       # 헤더 (로고, 테마 전환)
│   │   └── Header.css
│   ├── context/
│   │   ├── ThemeContext.js  # 흑/백 테마 상태 관리
│   │   └── ProblemContext.js # 문제 풀이 상태 관리
│   ├── data/
│   │   └── problems.js     # 문제 데이터 (7문제)
│   ├── pages/
│   │   ├── HomePage.js     # 메인 문제 목록 페이지
│   │   ├── HomePage.css
│   │   ├── ProblemPage.js  # 코딩 시험 페이지
│   │   └── ProblemPage.css
│   ├── styles/
│   │   └── global.css      # 전역 CSS (다크/라이트 테마 변수)
│   ├── App.js              # 라우터 설정
│   └── index.js            # 엔트리포인트
├── webpack.config.js       # Webpack 설정
├── .babelrc               # Babel 설정
└── package.json
```

## 테마 전환

CSS 변수 기반으로 다크/라이트 테마를 지원합니다.
`body.dark` / `body.light` 클래스로 전체 테마가 전환됩니다.
선택한 테마는 `localStorage`에 저장되어 새로고침 후에도 유지됩니다.

## 시험 보안 기능

시험 시작 후 다음 행동이 감지되면 경고 팝업이 표시되고 전체화면으로 복귀됩니다:

- 다른 탭/창으로 이동 (`visibilitychange` 이벤트)
- 창 포커스 이탈 (`blur` 이벤트)
- 전체화면 강제 종료 (`fullscreenchange` 이벤트)
- Alt+Tab, Alt+F4, Ctrl+W 키 입력

경고 횟수는 화면에 누적 표시됩니다.
