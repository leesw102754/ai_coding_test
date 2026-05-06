package com.example.capstone.controller;

import com.example.capstone.dto.AiAnalyzeResponse;
import com.example.capstone.dto.AiProblemDraftRequest;
import com.example.capstone.dto.AiProblemDraftResponse;
import com.example.capstone.dto.AiTestCaseRecommendRequest;
import com.example.capstone.dto.AiTestCaseRecommendResponse;
import com.example.capstone.dto.BulkSubmissionItem;
import com.example.capstone.dto.BulkSubmissionRequest;
import com.example.capstone.dto.BulkSubmissionResultItem;
import com.example.capstone.dto.JudgeResult;
import com.example.capstone.entity.Exam;
import com.example.capstone.entity.ExamRecord;
import com.example.capstone.entity.Submission;
import com.example.capstone.entity.TestCase;
import com.example.capstone.repository.ExamRecordRepository;
import com.example.capstone.repository.ExamRepository;
import com.example.capstone.repository.SubmissionRepository;
import com.example.capstone.repository.TestCaseRepository;
import com.example.capstone.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExamApiController {

    private final ExamRepository examRepository;
    private final SubmissionRepository submissionRepository;
    private final AiService aiService;
    private final TestCaseRepository testCaseRepository;
    private final ExamRecordRepository examRecordRepository;

    @GetMapping("/exams")
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

@GetMapping("/exams/category/{categoryId}")
public List<Exam> getExamsByCategory(@PathVariable Long categoryId) {
    return examRepository.findByCategoryId(categoryId);
}

    @PostMapping("/ai/problems/generate")
    public AiProblemDraftResponse generateAiProblem(@RequestBody AiProblemDraftRequest request) {
        return aiService.generateProblemDraft(request);
    }

    @PostMapping("/ai/testcases/recommend")
    public AiTestCaseRecommendResponse recommendAiTestCases(
            @RequestBody AiTestCaseRecommendRequest request
    ) {
        return aiService.recommendTestCases(request);
    }

    @PostMapping("/exams")
    public Exam saveExam(@RequestBody Exam exam) {
        if (exam.getSource() == null || exam.getSource().isBlank()) {
            exam.setSource("manual");
        } else {
            exam.setSource(exam.getSource().trim());
        }

        if (exam.getConstraints() != null) {
            exam.setConstraints(exam.getConstraints().trim());
        }

        return examRepository.save(exam);
    }

    @PostMapping("/testcases")
    public TestCase saveTestCase(@RequestBody TestCase testCase) {
        if (testCase.getSource() == null || testCase.getSource().isBlank()) {
            testCase.setSource("manual");
        } else {
            testCase.setSource(testCase.getSource().trim());
        }

        if (testCase.getDescription() == null || testCase.getDescription().isBlank()) {
            if ("manual".equals(testCase.getSource())) {
                testCase.setDescription("수동 입력 케이스");
            } else {
                testCase.setDescription("AI 생성 케이스");
            }
        }

        if (testCase.getInput() != null) {
            testCase.setInput(testCase.getInput().trim());
        }

        if (testCase.getExpectedOutput() != null) {
            testCase.setExpectedOutput(testCase.getExpectedOutput().trim());
        }

        return testCaseRepository.save(testCase);
    }

    @GetMapping("/exams/{id}/testcases")
    public List<TestCase> getTestCases(@PathVariable Long id) {
        return testCaseRepository.findByExamId(id);
    }

    @PostMapping("/exams/{id}/run-tests")
    public Map<String, Object> runTests(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        String language = request.get("language");
        String code = request.get("code");

        JudgeResult judgeResult = aiService.judgeOnly(id, language, code);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "테스트케이스 실행 완료");
        result.put("status", judgeResult.getStatus());
        result.put("errorTypeHint", judgeResult.getErrorTypeHint());
        result.put("stdout", judgeResult.getStdout());
        result.put("stderr", judgeResult.getStderr());
        result.put("compileOutput", judgeResult.getCompileOutput());
        result.put("failedCases", judgeResult.getFailedCases());

        return result;
    }

    @GetMapping("/exams/{id}")
    public Exam getExamDetail(@PathVariable Long id) {
        return examRepository.findById(id).orElseThrow();
    }

    @PatchMapping("/exams/{id}")
    public Exam updateExam(@PathVariable Long id, @RequestBody Exam request) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("문제를 찾을 수 없습니다."));

        if (request.getTitle() != null) {
            exam.setTitle(request.getTitle().trim());
        }

        if (request.getDescription() != null) {
            exam.setDescription(request.getDescription().trim());
        }

        if (request.getConstraints() != null) {
            exam.setConstraints(request.getConstraints().trim());
        }

        if (request.getDifficulty() != null) {
            exam.setDifficulty(request.getDifficulty().trim());
        }

        if (request.getPoint() != null) {
            exam.setPoint(request.getPoint());
        }

        if (request.getSource() != null && !request.getSource().isBlank()) {
            exam.setSource(request.getSource().trim());
        } else {
            if ("ai".equals(exam.getSource())) {
                exam.setSource("ai_edited");
            } else if (exam.getSource() == null || exam.getSource().isBlank()) {
                exam.setSource("manual");
            }
        }

        return examRepository.save(exam);
    }

    @Transactional
    @DeleteMapping("/exams/{id}")
    public String deleteExam(@PathVariable Long id) {
        if (!examRepository.existsById(id)) {
            throw new RuntimeException("문제를 찾을 수 없습니다.");
        }

        submissionRepository.deleteByExamId(id);
        testCaseRepository.deleteByExamId(id);
        examRepository.deleteById(id);

        return id + "번 문제와 관련 테스트케이스/제출 내역이 삭제되었습니다.";
    }

    @PostMapping("/submissions")
    public Map<String, Object> submitCode(@RequestBody Submission submission) {

        if (submission.getStudentId() != null
                && submission.getExamId() != null
                && submissionRepository.existsByStudentIdAndExamId(
                        submission.getStudentId(),
                        submission.getExamId()
                )) {
            Map<String, Object> result = new HashMap<>();
            result.put("message", "이미 제출한 문제입니다.");
            result.put("duplicated", true);
            return result;
        }

        submission.setSubmitTime(LocalDateTime.now());
        Submission savedSubmission = submissionRepository.save(submission);

        AiAnalyzeResponse aiResponse = null;

        try {
            aiResponse = aiService.analyzeSubmission(savedSubmission);

            if (aiResponse != null) {
                savedSubmission.setStatus(aiResponse.getErrorType());
                savedSubmission.setAiSummary(aiResponse.getSummary());
                savedSubmission.setAiWrongReason(aiResponse.getWrongReason());
                savedSubmission.setAiSolutionDirection(aiResponse.getSolutionDirection());
                savedSubmission.setAiImprovement(aiResponse.getImprovementFeedback());

                int point = examRepository.findById(savedSubmission.getExamId())
                        .map(exam -> exam.getPoint() != null ? exam.getPoint() : 0)
                        .orElse(0);

                if ("accepted".equalsIgnoreCase(aiResponse.getErrorType())) {
                    savedSubmission.setEarnedPoint(point);
                } else {
                    savedSubmission.setEarnedPoint(0);
                }

                submissionRepository.save(savedSubmission);
            }
        } catch (Exception e) {
            System.out.println("AI 호출 실패, 기본 채점 피드백으로 대체: " + e.getMessage());

            JudgeResult judgeResult = aiService.judgeOnly(
                    savedSubmission.getExamId(),
                    savedSubmission.getLanguage(),
                    savedSubmission.getCode()
            );

            String fallbackStatus = mapJudgeResultToErrorType(judgeResult);
            aiResponse = buildOfflineFallbackResponse(fallbackStatus);

            savedSubmission.setStatus(aiResponse.getErrorType());
            savedSubmission.setAiSummary(aiResponse.getSummary());
            savedSubmission.setAiWrongReason(aiResponse.getWrongReason());
            savedSubmission.setAiSolutionDirection(aiResponse.getSolutionDirection());
            savedSubmission.setAiImprovement(aiResponse.getImprovementFeedback());

            int point = examRepository.findById(savedSubmission.getExamId())
                    .map(exam -> exam.getPoint() != null ? exam.getPoint() : 0)
                    .orElse(0);

            if ("accepted".equalsIgnoreCase(aiResponse.getErrorType())) {
                savedSubmission.setEarnedPoint(point);
            } else {
                savedSubmission.setEarnedPoint(0);
            }

            submissionRepository.save(savedSubmission);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "제출 완료");
        result.put("submission", savedSubmission);
        result.put("ai_feedback", aiResponse);

        return result;
    }

    @GetMapping("/submissions")
    public List<com.example.capstone.dto.SubmissionResponse> getAllSubmissions() {
        return submissionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Submission::getSubmitTime).reversed())
                .map(com.example.capstone.dto.SubmissionResponse::new)
                .toList();
    }

    @GetMapping("/submissions/student/{studentId}")
    public List<com.example.capstone.dto.SubmissionResponse> getSubmissionsByStudent(
            @PathVariable String studentId
    ) {
        return submissionRepository.findByStudentIdOrderBySubmitTimeDesc(studentId)
                .stream()
                .map(com.example.capstone.dto.SubmissionResponse::new)
                .toList();
    }

    @GetMapping("/submissions/{id}")
    public Submission getSubmissionDetail(@PathVariable Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("제출 내역을 찾을 수 없습니다."));
    }

    @DeleteMapping("/submissions/{id}")
    public String deleteSubmission(@PathVariable Long id) {
        submissionRepository.deleteById(id);
        return id + "번 제출 내역이 삭제되었습니다.";
    }

    @PostMapping("/submissions/bulk")
    public Map<String, Object> submitBulkCode(@RequestBody BulkSubmissionRequest request) {
        if (request.getSubmissions() == null || request.getSubmissions().isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("message", "제출할 문제가 없습니다.");
            result.put("totalCount", 0);
            result.put("acceptedCount", 0);
            result.put("wrongCount", 0);
            result.put("score", 0);
            result.put("maxScore", 0);
            result.put("warningCount", request.getWarningCount() != null ? request.getWarningCount() : 0);
            result.put("results", List.of());
            return result;
        }

        List<BulkSubmissionResultItem> results = new java.util.ArrayList<>();
        int acceptedCount = 0;
        int wrongCount = 0;
        int totalEarnedScore = 0;
        int totalPossibleScore = 0;

        for (BulkSubmissionItem item : request.getSubmissions()) {
            if (item.getExamId() == null || item.getLanguage() == null || item.getCode() == null) {
                continue;
            }

            Exam exam = examRepository.findById(item.getExamId()).orElseThrow();
            int point = (exam.getPoint() != null) ? exam.getPoint() : 0;
            totalPossibleScore += point;

            Submission submission = new Submission();
            submission.setExamId(item.getExamId());
            submission.setStudentName(request.getStudentName());
            submission.setStudentId(request.getStudentId());
            submission.setLanguage(item.getLanguage());
            submission.setCode(item.getCode());
            submission.setSubmitTime(LocalDateTime.now());

            Submission savedSubmission = submissionRepository.save(submission);

            AiAnalyzeResponse aiResponse = null;
            String status = "unknown";

            try {
                aiResponse = aiService.analyzeSubmission(savedSubmission);

                if (aiResponse != null && aiResponse.getErrorType() != null) {
                    status = aiResponse.getErrorType();
                    savedSubmission.setStatus(status);
                    savedSubmission.setAiSummary(aiResponse.getSummary());
                    savedSubmission.setAiWrongReason(aiResponse.getWrongReason());
                    savedSubmission.setAiSolutionDirection(aiResponse.getSolutionDirection());
                    savedSubmission.setAiImprovement(aiResponse.getImprovementFeedback());
                }
            } catch (Exception e) {
                System.out.println("Bulk AI 호출 실패, 기본 채점 피드백으로 대체: " + e.getMessage());

                JudgeResult judgeResult = aiService.judgeOnly(
                        item.getExamId(),
                        item.getLanguage(),
                        item.getCode()
                );

                status = mapJudgeResultToErrorType(judgeResult);
                aiResponse = buildOfflineFallbackResponse(status);

                savedSubmission.setStatus(status);
                savedSubmission.setAiSummary(aiResponse.getSummary());
                savedSubmission.setAiWrongReason(aiResponse.getWrongReason());
                savedSubmission.setAiSolutionDirection(aiResponse.getSolutionDirection());
                savedSubmission.setAiImprovement(aiResponse.getImprovementFeedback());
            }

            if ("accepted".equals(status)) {
                acceptedCount++;
                totalEarnedScore += point;
                savedSubmission.setEarnedPoint(point);
            } else {
                wrongCount++;
                savedSubmission.setEarnedPoint(0);
            }

            submissionRepository.save(savedSubmission);

            BulkSubmissionResultItem resultItem = new BulkSubmissionResultItem();
            resultItem.setExamId(item.getExamId());
            resultItem.setStatus(status);
            resultItem.setSubmission(savedSubmission);
            resultItem.setAiFeedback(aiResponse);

            results.add(resultItem);
        }

        ExamRecord record = new ExamRecord();
        record.setStudentId(request.getStudentId());
        record.setStudentName(request.getStudentName());
        record.setTotalScore(totalEarnedScore);
        record.setWarningCount(request.getWarningCount() != null ? request.getWarningCount() : 0);
        record.setEndTime(LocalDateTime.now());
        examRecordRepository.save(record);

        results.sort(Comparator.comparing(BulkSubmissionResultItem::getStatus));

        int totalCount = results.size();
        String acceptedRate = (totalCount == 0) ? "0%" : (acceptedCount * 100 / totalCount) + "%";

        Map<String, Object> result = new HashMap<>();
        result.put("message", "전체 제출 완료");
        result.put("totalCount", totalCount);
        result.put("acceptedCount", acceptedCount);
        result.put("wrongCount", wrongCount);
        result.put("acceptedRate", acceptedRate);
        result.put("score", totalEarnedScore);
        result.put("maxScore", totalPossibleScore);
        result.put("warningCount", request.getWarningCount() != null ? request.getWarningCount() : 0);
        result.put("results", results);

        return result;
    }

@PostMapping("/submissions/{id}/reanalyze-ai")
public Map<String, Object> reanalyzeSubmissionWithAi(@PathVariable Long id) {
    Submission submission = submissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("제출 내역을 찾을 수 없습니다."));

    AiAnalyzeResponse aiResponse = aiService.analyzeSubmission(submission);

    if (aiResponse == null || aiResponse.getErrorType() == null) {
        throw new RuntimeException("AI 재분석 결과가 비어 있습니다.");
    }

    applyAiResponseToSubmission(submission, aiResponse);

    Map<String, Object> result = new HashMap<>();
    result.put("message", "AI 피드백 재생성 완료");
    result.put("submissionId", submission.getId());
    result.put("status", aiResponse.getErrorType());
    result.put("aiFeedback", aiResponse);

    return result;
}

@PostMapping("/submissions/reanalyze-ai")
public Map<String, Object> reanalyzeAllSubmissionsWithAi() {
    List<Submission> submissions = submissionRepository.findAll();
    List<Map<String, Object>> details = new java.util.ArrayList<>();

    int successCount = 0;
    int failCount = 0;

    for (Submission submission : submissions) {
        Map<String, Object> itemResult = new HashMap<>();
        itemResult.put("submissionId", submission.getId());

        if (submission.getExamId() == null
                || submission.getLanguage() == null
                || submission.getCode() == null
                || submission.getCode().isBlank()) {
            failCount++;
            itemResult.put("success", false);
            itemResult.put("message", "재분석에 필요한 제출 정보가 부족합니다.");
            details.add(itemResult);
            continue;
        }

        try {
            AiAnalyzeResponse aiResponse = aiService.analyzeSubmission(submission);

            if (aiResponse == null || aiResponse.getErrorType() == null) {
                throw new RuntimeException("AI 재분석 결과가 비어 있습니다.");
            }

            applyAiResponseToSubmission(submission, aiResponse);

            successCount++;
            itemResult.put("success", true);
            itemResult.put("status", aiResponse.getErrorType());
            itemResult.put("message", "AI 피드백 재생성 완료");
        } catch (Exception e) {
            failCount++;
            itemResult.put("success", false);
            itemResult.put("message", e.getMessage());
        }

        details.add(itemResult);
    }

    Map<String, Object> result = new HashMap<>();
    result.put("message", "AI 피드백 일괄 재생성 작업 완료");
    result.put("totalCount", submissions.size());
    result.put("successCount", successCount);
    result.put("failCount", failCount);
    result.put("results", details);

    return result;
}

private void applyAiResponseToSubmission(Submission submission, AiAnalyzeResponse aiResponse) {
    submission.setStatus(aiResponse.getErrorType());
    submission.setAiSummary(aiResponse.getSummary());
    submission.setAiWrongReason(aiResponse.getWrongReason());
    submission.setAiSolutionDirection(aiResponse.getSolutionDirection());
    submission.setAiImprovement(aiResponse.getImprovementFeedback());

    int point = examRepository.findById(submission.getExamId())
            .map(exam -> exam.getPoint() != null ? exam.getPoint() : 0)
            .orElse(0);

    if ("accepted".equalsIgnoreCase(aiResponse.getErrorType())) {
        submission.setEarnedPoint(point);
    } else {
        submission.setEarnedPoint(0);
    }

    submissionRepository.save(submission);
}

    private String mapJudgeResultToErrorType(JudgeResult judgeResult) {
        if (judgeResult == null) {
            return "logic";
        }

        String status = judgeResult.getStatus() != null
                ? judgeResult.getStatus().toLowerCase()
                : "";

        String hint = judgeResult.getErrorTypeHint() != null
                ? judgeResult.getErrorTypeHint().toLowerCase()
                : "";

        String stderr = judgeResult.getStderr() != null
                ? judgeResult.getStderr().toLowerCase()
                : "";

        if (status.equals("accepted")) {
            return "accepted";
        }

        if (status.contains("syntax")
                || status.contains("compile")
                || hint.contains("syntax")
                || hint.contains("compile")) {
            return "compile";
        }

        if (hint.contains("index")
                || stderr.contains("indexerror")
                || stderr.contains("arrayindexoutofbounds")) {
            return "index";
        }

        if (status.contains("runtime")
                || status.contains("time_limit")
                || hint.contains("runtime")) {
            return "runtime";
        }

        if (status.contains("wrong")
                || hint.contains("logic")) {
            return "logic";
        }

        return "logic";
    }

    private AiAnalyzeResponse buildOfflineFallbackResponse(String errorType) {
        AiAnalyzeResponse response = new AiAnalyzeResponse();
        response.setErrorType(errorType);

        switch (errorType) {
            case "accepted":
                response.setSummary("정답입니다.");
                response.setWrongReason("오류가 없습니다.");
                response.setSolutionDirection("현재 코드를 유지하면 됩니다.");
                response.setImprovementFeedback("다양한 입력도 계속 테스트하는 습관을 가지세요.");
                break;

            case "compile":
                response.setSummary("문법 또는 컴파일 오류가 발생했습니다.");
                response.setWrongReason("코드가 정상적으로 실행되기 전에 문법 또는 컴파일 단계에서 오류가 발생했습니다.");
                response.setSolutionDirection("괄호, 세미콜론, 변수 선언, 함수명 등을 다시 확인해야 합니다.");
                response.setImprovementFeedback("제출 전 실행 버튼으로 문법 오류를 먼저 확인하는 습관을 가지세요.");
                break;

            case "runtime":
                response.setSummary("실행 중 오류가 발생했습니다.");
                response.setWrongReason("코드 실행 중 예외가 발생하여 테스트케이스를 끝까지 처리하지 못했습니다.");
                response.setSolutionDirection("입력 처리, 나누기 연산, 변수 초기화, 반복문 조건을 확인해야 합니다.");
                response.setImprovementFeedback("경계값과 예외 상황을 직접 테스트하는 습관을 가지세요.");
                break;

            case "index":
                response.setSummary("인덱스 범위 오류가 발생했습니다.");
                response.setWrongReason("배열이나 문자열에 접근할 때 유효하지 않은 위치를 사용했을 가능성이 있습니다.");
                response.setSolutionDirection("배열 길이와 반복문 범위를 다시 확인해야 합니다.");
                response.setImprovementFeedback("입력 크기가 작거나 경계에 있는 테스트케이스를 함께 확인하는 습관을 가지세요.");
                break;

            case "logic":
            default:
                response.setSummary("테스트케이스 결과가 기대 출력과 다릅니다.");
                response.setWrongReason("코드는 실행되었지만 실제 출력이 기대 출력과 일치하지 않았습니다.");
                response.setSolutionDirection("조건문, 반복문, 계산식, 출력 형식을 다시 확인해야 합니다.");
                response.setImprovementFeedback("실패한 입력값을 기준으로 중간 계산 과정을 점검하는 습관을 가지세요.");
                break;
        }

        return response;
    }
}