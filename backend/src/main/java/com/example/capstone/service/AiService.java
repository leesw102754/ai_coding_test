package com.example.capstone.service;

import com.example.capstone.dto.AiAnalyzeRequest;
import com.example.capstone.dto.AiAnalyzeResponse;
import com.example.capstone.dto.JudgeResult;
import com.example.capstone.entity.Exam;
import com.example.capstone.entity.Submission;
import com.example.capstone.entity.TestCase;
import com.example.capstone.repository.ExamRepository;
import com.example.capstone.repository.TestCaseRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.example.capstone.dto.AiTestCaseRecommendRequest;
import com.example.capstone.dto.AiTestCaseRecommendResponse;
import com.example.capstone.dto.AiProblemDraftRequest;
import com.example.capstone.dto.AiProblemDraftResponse;

import java.util.List;

@Service
public class AiService {

    private final RestTemplate restTemplate = new RestTemplate();

    private final PythonJudgeService pythonJudgeService;
    private final CppJudgeService cppJudgeService;
    private final JavaJudgeService javaJudgeService;
    private final CJudgeService cJudgeService;
    private final JavaScriptJudgeService javaScriptJudgeService;

    private final TestCaseRepository testCaseRepository;
    private final ExamRepository examRepository;

    @Value("${ai.internal.key}")
    private String aiInternalKey;

    public AiService(
            PythonJudgeService pythonJudgeService,
            CppJudgeService cppJudgeService,
            JavaJudgeService javaJudgeService,
            CJudgeService cJudgeService,
            JavaScriptJudgeService javaScriptJudgeService,
            TestCaseRepository testCaseRepository,
            ExamRepository examRepository
    ) {
        this.pythonJudgeService = pythonJudgeService;
        this.cppJudgeService = cppJudgeService;
        this.javaJudgeService = javaJudgeService;
        this.cJudgeService = cJudgeService;
        this.javaScriptJudgeService = javaScriptJudgeService;
        this.testCaseRepository = testCaseRepository;
        this.examRepository = examRepository;
    }

    public AiAnalyzeResponse analyzeSubmission(Submission submission) {
        String aiUrl = "http://127.0.0.1:8000/analyze-code";

        Exam exam = examRepository.findById(submission.getExamId()).orElseThrow();
        List<TestCase> testCases = testCaseRepository.findByExamId(submission.getExamId());

        AiAnalyzeRequest request = new AiAnalyzeRequest();
	request.setProblemTitle(exam.getTitle());
	request.setProblemDescription(exam.getDescription());
	request.setProblemConstraints(exam.getConstraints());
	request.setLanguage(submission.getLanguage());
	request.setStudentCode(submission.getCode());

        JudgeResult judgeResult;
        String language = submission.getLanguage();

        if ("python".equalsIgnoreCase(language)) {
            judgeResult = pythonJudgeService.judge(submission.getCode(), testCases);
        } else if ("c".equalsIgnoreCase(language)) {
            judgeResult = cJudgeService.judge(submission.getCode(), testCases);
        } else if ("cpp".equalsIgnoreCase(language) || "c++".equalsIgnoreCase(language)) {
            judgeResult = cppJudgeService.judge(submission.getCode(), testCases);
        } else if ("java".equalsIgnoreCase(language)) {
            judgeResult = javaJudgeService.judge(submission.getCode(), testCases);
        } else if ("javascript".equalsIgnoreCase(language) || "js".equalsIgnoreCase(language)) {
            judgeResult = javaScriptJudgeService.judge(submission.getCode(), testCases);
        } else {
            judgeResult = new JudgeResult();
            judgeResult.setStatus("runtime_error");
            judgeResult.setErrorTypeHint("runtime_error");
            judgeResult.setStdout("");
            judgeResult.setStderr("현재는 Python, C, C++, Java, JavaScript만 실제 실행 지원");
            judgeResult.setCompileOutput("");
            judgeResult.setExecutionTimeMs(0);
            judgeResult.setMemoryKb(0);
            judgeResult.setFailedCases(List.of());
        }

        request.setJudgeResult(judgeResult);

        if ("accepted".equals(judgeResult.getStatus())) {
            AiAnalyzeResponse ok = new AiAnalyzeResponse();
            ok.setErrorType("accepted");
            ok.setSummary("정답입니다.");
            ok.setWrongReason("오류가 없습니다.");
            ok.setSolutionDirection("현재 코드를 유지하면 됩니다.");
            ok.setImprovementFeedback("다양한 입력도 계속 테스트하는 습관을 가지세요.");
            return ok;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", aiInternalKey);

        HttpEntity<AiAnalyzeRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<AiAnalyzeResponse> response = restTemplate.exchange(
                aiUrl,
                HttpMethod.POST,
                entity,
                AiAnalyzeResponse.class
        );

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new RuntimeException("AI 서버 호출 실패");
        }

        return response.getBody();
    }

    public JudgeResult judgeOnly(Long examId, String language, String code) {
        List<TestCase> testCases = testCaseRepository.findByExamId(examId);

        if ("python".equalsIgnoreCase(language)) {
            return pythonJudgeService.judge(code, testCases);
        } else if ("c".equalsIgnoreCase(language)) {
            return cJudgeService.judge(code, testCases);
        } else if ("cpp".equalsIgnoreCase(language) || "c++".equalsIgnoreCase(language)) {
            return cppJudgeService.judge(code, testCases);
        } else if ("java".equalsIgnoreCase(language)) {
            return javaJudgeService.judge(code, testCases);
        } else if ("javascript".equalsIgnoreCase(language) || "js".equalsIgnoreCase(language)) {
            return javaScriptJudgeService.judge(code, testCases);
        }

        JudgeResult result = new JudgeResult();
        result.setStatus("runtime_error");
        result.setErrorTypeHint("runtime_error");
        result.setStdout("");
        result.setStderr("지원하지 않는 언어입니다.");
        result.setCompileOutput("");
        result.setExecutionTimeMs(0);
        result.setMemoryKb(0);
        result.setFailedCases(List.of());

        return result;
    }

    public AiTestCaseRecommendResponse recommendTestCases(AiTestCaseRecommendRequest request) {
        String aiUrl = "http://127.0.0.1:8000/generate-testcases";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", aiInternalKey);

        HttpEntity<AiTestCaseRecommendRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<AiTestCaseRecommendResponse> response = restTemplate.exchange(
                aiUrl,
                HttpMethod.POST,
                entity,
                AiTestCaseRecommendResponse.class
        );

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new RuntimeException("AI 테스트케이스 추천 실패");
        }

        return response.getBody();
    }

    public AiProblemDraftResponse generateProblemDraft(AiProblemDraftRequest request) {
        String aiUrl = "http://127.0.0.1:8000/generate-problem-draft";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", aiInternalKey);

        HttpEntity<AiProblemDraftRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<AiProblemDraftResponse> response = restTemplate.exchange(
                aiUrl,
                HttpMethod.POST,
                entity,
                AiProblemDraftResponse.class
        );

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new RuntimeException("AI 문제 초안 생성 실패");
        }

        return response.getBody();
    }
}