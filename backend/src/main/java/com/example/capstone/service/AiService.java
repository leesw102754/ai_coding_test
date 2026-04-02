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

import java.util.List;

@Service
public class AiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final PythonJudgeService pythonJudgeService;
    private final TestCaseRepository testCaseRepository;
    private final ExamRepository examRepository;

    @Value("${ai.internal.key}")
    private String aiInternalKey;

    public AiService(
            PythonJudgeService pythonJudgeService,
            TestCaseRepository testCaseRepository,
            ExamRepository examRepository
    ) {
        this.pythonJudgeService = pythonJudgeService;
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
        request.setLanguage(submission.getLanguage());
        request.setStudentCode(submission.getCode());

        JudgeResult judgeResult;

        if ("python".equalsIgnoreCase(submission.getLanguage())) {
            judgeResult = pythonJudgeService.judge(submission.getCode(), testCases);
        } else {
            judgeResult = new JudgeResult();
            judgeResult.setStatus("runtime_error");
            judgeResult.setErrorTypeHint("runtime_error");
            judgeResult.setStdout("");
            judgeResult.setStderr("현재는 Python만 실제 실행 지원");
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
}