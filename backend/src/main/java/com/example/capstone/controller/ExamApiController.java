package com.example.capstone.controller;

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
}