import { useNavigate } from 'react-router-dom';
import './TutorialPage.css';

export default function TutorialPage() {
  const navigate = useNavigate();

  return (
    <div className="tutorial-page">
      <div className="tutorial-inner">
        <div className="tutorial-hero">
          <div>
            <span className="tutorial-badge">관리자 전용 가이드</span>
            <h1>CodeTest 사용 방법</h1>
            <p>
              시험 폴더 생성부터 문제 출제, 대량 AI 생성, 시험 운영 관리,
              학생 응시, 결과 분석, AI 피드백 확인까지 전체 흐름을 안내합니다.
            </p>
          </div>

          <button
            type="button"
            className="tutorial-back-btn"
            onClick={() => navigate('/')}
          >
            메인으로 돌아가기
          </button>
        </div>

        <section className="tutorial-section">
          <h2>1. 시험 폴더 생성</h2>

          <div className="tutorial-card">
            <h3>관리자 메인에서 시험 폴더를 먼저 만듭니다.</h3>
            <p>
              중간고사, 기말고사, 모의고사처럼 시험 단위를 폴더로 나누면
              코딩 문제와 객관식 문제를 한 시험 안에 묶어서 관리할 수 있습니다.
            </p>

            <div className="tutorial-path">
              문제출제 → 코드작성형 문제 출제 또는 객관식 문제 출제 → 시험 폴더 생성
            </div>
          </div>
        </section>

        <section className="tutorial-section">
          <h2>2. 시험 운영 관리</h2>

          <div className="tutorial-card">
            <h3>관리자는 시험 폴더별로 시험 시작과 종료를 통제할 수 있습니다.</h3>
            <p>
              관리자 메인 화면의 시험 운영 관리 카드에서 시험 폴더를 선택한 뒤,
              시작 전 테스트 상태, 지금 시험 시작, 지금 시험 종료, 제한 시간 변경을 사용할 수 있습니다.
            </p>

            <div className="tutorial-path">
              관리자 메인 → 시험 운영 관리 → 시험 폴더 선택 → 시작/종료/제한 시간 제어
            </div>

            <ul className="tutorial-list">
              <li>시작 전 테스트 상태: 학생 접근 차단 확인용</li>
              <li>지금 시험 시작: 선택한 시험 폴더를 즉시 진행 중 상태로 변경</li>
              <li>지금 시험 종료: 학생 접근과 제출을 차단</li>
              <li>제한 시간 변경: 시험 제한 시간과 종료 시간 조정</li>
              <li>실시간 이탈 알림: 학생이 시험 화면을 벗어나면 관리자 화면에 표시</li>
            </ul>
          </div>
        </section>

        <section className="tutorial-section">
          <h2>3. 코딩 문제 생성 방법</h2>

          <div className="tutorial-grid">
            <div className="tutorial-card">
              <h3>수동 생성</h3>
              <p>
                문제 제목, 설명, 제한사항, 난이도, 점수, 테스트케이스를 직접 입력합니다.
                정확한 문제를 만들 때 가장 안정적인 방식입니다.
              </p>
            </div>

            <div className="tutorial-card">
              <h3>AI 생성</h3>
              <p>
                원하는 주제나 조건을 입력하면 AI가 코딩 문제 초안을 생성합니다.
                생성 후에는 반드시 문제 설명, 제한사항, 테스트케이스를 확인하고 수정하는 것이 좋습니다.
              </p>
            </div>

            <div className="tutorial-card">
              <h3>코딩 문제 대량 AI 생성</h3>
              <p>
                주제와 난이도별 개수/점수를 입력하면 여러 개의 코딩 문제와 테스트케이스를
                한 번에 생성하고 저장할 수 있습니다. 생성 중에는 로딩창이 표시됩니다.
              </p>
            </div>
          </div>

          <div className="tutorial-tip">
            추천 흐름: AI로 초안 생성 → 관리자 검토 → 테스트케이스 보강 → 최종 등록
          </div>
        </section>

        <section className="tutorial-section">
          <h2>4. 테스트케이스 및 문제 순서 관리</h2>

          <div className="tutorial-card">
            <h3>전체 문제 관리에서 테스트케이스와 문제 순서를 관리합니다.</h3>
            <p>
              코딩 문제는 테스트케이스 품질이 중요합니다. 기본 입력뿐 아니라 음수,
              0, 경계값, 큰 값 같은 예외 상황도 함께 넣어야 채점 신뢰도가 높아집니다.
            </p>

            <div className="tutorial-path">
              프로필 메뉴 → 전체 문제 관리 → 시험 폴더 선택 → 문제 선택 → 테스트케이스 관리
            </div>

            <ul className="tutorial-list">
              <li>입력값 확인</li>
              <li>기대 출력 확인</li>
              <li>테스트케이스 설명 수정</li>
              <li>새 테스트케이스 추가</li>
              <li>불필요한 테스트케이스 삭제</li>
              <li>코딩 문제 수정 및 삭제</li>
              <li>전체 시험 또는 특정 시험 폴더 안에서 코딩 문제 순서 변경</li>
            </ul>
          </div>
        </section>

        <section className="tutorial-section">
          <h2>5. 객관식 문제 생성/수정 방법</h2>

          <div className="tutorial-grid">
            <div className="tutorial-card">
              <h3>객관식 문제 생성</h3>
              <p>
                객관식 문제는 수동 등록 또는 AI 생성이 가능합니다.
                AI가 생성한 객관식 문제는 보기 4개, 정답 번호, 해설이 자동으로 들어오지만,
                시험에 사용하기 전 정답과 해설이 일치하는지 확인해야 합니다.
              </p>

              <div className="tutorial-path">
                문제출제 → 객관식 문제 출제 → 시험 폴더 선택 → 문제 등록
              </div>
            </div>

            <div className="tutorial-card">
              <h3>객관식 대량 AI 생성</h3>
              <p>
                주제와 난이도별 개수를 입력해 여러 개의 객관식 문제를 한 번에 생성하고
                저장할 수 있습니다. 생성 중에는 로딩창이 표시됩니다.
              </p>

              <div className="tutorial-path">
                문제출제 → 객관식 문제 출제 → 대량 AI 생성
              </div>
            </div>

            <div className="tutorial-card">
              <h3>객관식 수정과 순서 변경</h3>
              <p>
                객관식 문제 수정은 전체 문제 관리 화면에서 진행합니다.
                또한 시험 폴더 안에서 객관식 문제의 순서를 위/아래 버튼으로 조정할 수 있습니다.
              </p>

              <div className="tutorial-path">
                전체 문제 관리 → 시험 폴더 선택 → 객관식 문제 선택 → 수정 또는 순서 변경
              </div>
            </div>
          </div>
        </section>

        <section className="tutorial-section">
          <h2>6. 학생 시험 응시 흐름</h2>

          <div className="tutorial-grid">
            <div className="tutorial-card">
              <h3>코딩 문제</h3>
              <p>
                학생은 시험 폴더를 선택한 뒤 코딩 문제를 풉니다.
                실행 버튼으로 공개 테스트케이스를 확인하고, 제출 버튼으로 최종 채점을 진행합니다.
              </p>
            </div>

            <div className="tutorial-card">
              <h3>객관식 문제</h3>
              <p>
                객관식은 모든 문제의 답을 선택한 뒤 한 번에 제출합니다.
                제출 후에는 선택 답안, 정답, 해설이 결과 화면에 표시됩니다.
              </p>
            </div>

            <div className="tutorial-card">
              <h3>시험 시간 제한</h3>
              <p>
                시험 시작 전에는 시험 폴더 접근이 차단되고,
                시험 종료 후에는 접근과 제출이 제한됩니다.
                시험 풀이 중 CodeTest 로고를 클릭해도 홈 화면으로 이동할 수 없습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="tutorial-section">
          <h2>7. 결과 확인 및 AI 피드백</h2>

          <div className="tutorial-card">
            <h3>학생 결과와 관리자 결과를 나눠서 확인합니다.</h3>
            <p>
              학생은 자신의 코딩 점수, 객관식 점수, 총점, AI 피드백을 확인할 수 있습니다.
              관리자는 학생별 점수, 문제별 정답률, 오류 유형 분석, 언어별 정답률을 확인할 수 있습니다.
            </p>

            <ul className="tutorial-list">
              <li>학생: 결과 확인 페이지에서 본인 결과 확인</li>
              <li>학생: TXT 다운로드와 인쇄 화면에서 제출 코드까지 확인</li>
              <li>관리자: 전체 결과 확인 페이지에서 전체 통계 확인</li>
              <li>관리자: AI 피드백 일괄 생성 가능</li>
              <li>AI 일괄 피드백 생성 시 정답 제출과 기존 피드백 보유 제출은 자동 제외</li>
              <li>AI 피드백: 오답 원인, 해결 방향, 개선 피드백 제공</li>
            </ul>
          </div>
        </section>

        <section className="tutorial-section">
          <h2>8. 시연할 때 추천 순서</h2>

          <div className="tutorial-flow">
            <div>시험 폴더 생성</div>
            <span>→</span>
            <div>대량 AI 문제 생성</div>
            <span>→</span>
            <div>테스트케이스 확인</div>
            <span>→</span>
            <div>시험 운영 관리</div>
            <span>→</span>
            <div>학생 응시</div>
            <span>→</span>
            <div>결과 분석</div>
          </div>
        </section>
      </div>
    </div>
  );
}