package com.example.capstone.controller;

import com.example.capstone.dto.BulkSubmissionItem;
import com.example.capstone.dto.BulkSubmissionRequest;
import com.example.capstone.dto.BulkSubmissionResultItem;
import com.example.capstone.dto.AiAnalyzeResponse;
import com.example.capstone.entity.Exam;
import com.example.capstone.entity.Submission;
import com.example.capstone.repository.ExamRepository;
import com.example.capstone.repository.SubmissionRepository;
import com.example.capstone.service.AiService;
import lombok.RequiredArgsConstructor;
import com.example.capstone.entity.TestCase;
import com.example.capstone.repository.TestCaseRepository;
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

    @GetMapping("/exams")
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    @PostMapping("/exams")
    public Exam saveExam(@RequestBody Exam exam) {
        return examRepository.save(exam);
    }

    @PostMapping("/testcases")
    public TestCase saveTestCase(@RequestBody TestCase testCase) {
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

    if (request.getTitle() != null) exam.setTitle(request.getTitle());
    if (request.getDescription() != null) exam.setDescription(request.getDescription());
    if (request.getDifficulty() != null) exam.setDifficulty(request.getDifficulty());

    return examRepository.save(exam);
}

    // [관리자] 시험 문제 삭제
    @DeleteMapping("/exams/{id}")
    public String deleteExam(@PathVariable Long id) {
        examRepository.deleteById(id);
        return id + "번 문제가 삭제되었습니다.";
    }

    @PostMapping("/submissions")
    public Map<String, Object> submitCode(@RequestBody Submission submission) {

        submission.setSubmitTime(LocalDateTime.now());
        Submission savedSubmission = submissionRepository.save(submission);

        AiAnalyzeResponse aiResponse = null;

        try {
            aiResponse = aiService.analyzeSubmission(savedSubmission);

            if (aiResponse != null) {
                savedSubmission.setStatus(aiResponse.getErrorType());            // 상태 저장
                savedSubmission.setAiSummary(aiResponse.getSummary());          // 요약 저장
                savedSubmission.setAiWrongReason(aiResponse.getWrongReason());  // 틀린 이유 저장
                savedSubmission.setAiSolutionDirection(aiResponse.getSolutionDirection()); // 해결 방향 저장
                savedSubmission.setAiImprovement(aiResponse.getImprovementFeedback());     // 개선 피드백 저장

                submissionRepository.save(savedSubmission);
            }
        } catch (Exception e) {
            System.out.println("AI 호출 실패: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "제출 완료");
        result.put("submission", savedSubmission); // 이제 이 안에는 AI 피드백이 포함되어 있습니다.
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

    // [관리자/학생] 특정 제출 내역 상세 보기 (AI 피드백 포함)
    @GetMapping("/submissions/{id}")
    public Submission getSubmissionDetail(@PathVariable Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("제출 내역을 찾을 수 없습니다."));
    }

    // [관리자] 잘못된 제출 내역 삭제 (테스트 데이터 정리용)
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
        result.put("results", List.of());
        return result;
    }

    List<BulkSubmissionResultItem> results = new java.util.ArrayList<>();
    int acceptedCount = 0;
    int wrongCount = 0;

    for (BulkSubmissionItem item : request.getSubmissions()) {
        if (item.getExamId() == null || item.getLanguage() == null || item.getCode() == null) {
            continue;
        }

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
            }
        } catch (Exception e) {
            System.out.println("Bulk AI 호출 실패: " + e.getMessage());
            status = "ai_error";
        }

        if ("accepted".equals(status)) {
            acceptedCount++;
        } else {
            wrongCount++;
        }

        BulkSubmissionResultItem resultItem = new BulkSubmissionResultItem();
        resultItem.setExamId(item.getExamId());
        resultItem.setStatus(status);
        resultItem.setSubmission(savedSubmission);
        resultItem.setAiFeedback(aiResponse);

        results.add(resultItem);
    }

results.sort(Comparator.comparing(BulkSubmissionResultItem::getStatus));

int totalCount = results.size();
String acceptedRate = (totalCount == 0) ? "0%" : (acceptedCount * 100 / totalCount) + "%";
int score = acceptedCount;
int maxScore = totalCount;

Map<String, Object> result = new HashMap<>();
result.put("message", "전체 제출 완료");
result.put("totalCount", totalCount);
result.put("acceptedCount", acceptedCount);
result.put("wrongCount", wrongCount);
result.put("acceptedRate", acceptedRate);
result.put("score", score);
result.put("maxScore", maxScore);
result.put("results", results);

    return result;
}
}