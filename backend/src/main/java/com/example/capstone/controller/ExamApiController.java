package com.example.capstone.controller;

import org.springframework.transaction.annotation.Transactional;
import com.example.capstone.dto.AiAnalyzeResponse;
import com.example.capstone.dto.AiProblemDraftRequest;
import com.example.capstone.dto.AiProblemDraftResponse;
import com.example.capstone.dto.AiTestCaseRecommendRequest;
import com.example.capstone.dto.AiTestCaseRecommendResponse;
import com.example.capstone.dto.BulkSubmissionItem;
import com.example.capstone.dto.BulkSubmissionRequest;
import com.example.capstone.dto.BulkSubmissionResultItem;
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
    System.out.println("AI 호출 실패: " + e.getMessage());

    savedSubmission.setStatus("ai_error");
    savedSubmission.setAiSummary("AI 피드백 생성에 실패했습니다.");
    savedSubmission.setAiWrongReason("AI 서버 연결이 중단되었거나 분석 요청 처리 중 오류가 발생했습니다.");
    savedSubmission.setAiSolutionDirection("AI 서버가 실행 중인지 확인한 뒤 다시 제출하거나 관리자에게 문의하세요.");
    savedSubmission.setAiImprovement("제출 코드는 저장되었으므로, 테스트케이스 결과를 기준으로 먼저 오류를 확인하세요.");
    savedSubmission.setEarnedPoint(0);

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
    System.out.println("Bulk AI 호출 실패: " + e.getMessage());

    status = "ai_error";
    savedSubmission.setStatus(status);
    savedSubmission.setAiSummary("AI 피드백 생성에 실패했습니다.");
    savedSubmission.setAiWrongReason("AI 서버 연결이 중단되었거나 분석 요청 처리 중 오류가 발생했습니다.");
    savedSubmission.setAiSolutionDirection("AI 서버가 실행 중인지 확인한 뒤 다시 제출하거나 관리자에게 문의하세요.");
    savedSubmission.setAiImprovement("제출 코드는 저장되었으므로, 테스트케이스 결과를 기준으로 먼저 오류를 확인하세요.");
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
}