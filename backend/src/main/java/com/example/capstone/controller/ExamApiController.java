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

    @PostMapping("/submissions")
    public Map<String, Object> submitCode(@RequestBody Submission submission) {

        submission.setSubmitTime(LocalDateTime.now());
        Submission savedSubmission = submissionRepository.save(submission);

        AiAnalyzeResponse aiResponse = null;

        try {
            aiResponse = aiService.analyzeSubmission(savedSubmission);
        } catch (Exception e) {
            System.out.println("AI 호출 실패: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "제출 완료");
        result.put("submission", savedSubmission);
        result.put("ai_feedback", aiResponse);

        return result;
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