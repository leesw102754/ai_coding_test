package com.example.capstone.controller;

import com.example.capstone.entity.ObjectiveQuestion;
import com.example.capstone.entity.ObjectiveSubmission;
import com.example.capstone.repository.ObjectiveQuestionRepository;
import com.example.capstone.repository.ObjectiveSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/objective/submissions")
@RequiredArgsConstructor
public class ObjectiveSubmissionController {

    private final ObjectiveSubmissionRepository objectiveSubmissionRepository;
    private final ObjectiveQuestionRepository objectiveQuestionRepository;

    @PostMapping
    public Map<String, Object> submitObjective(@RequestBody ObjectiveSubmission request) {
        if (request.getStudentId() == null || request.getStudentId().isBlank()) {
            throw new RuntimeException("학번 정보가 없습니다.");
        }

        if (request.getStudentName() == null || request.getStudentName().isBlank()) {
            throw new RuntimeException("학생 이름 정보가 없습니다.");
        }

        if (request.getQuestionId() == null) {
            throw new RuntimeException("객관식 문제 ID가 없습니다.");
        }

        if (request.getSelectedAnswer() == null
                || request.getSelectedAnswer() < 1
                || request.getSelectedAnswer() > 4) {
            throw new RuntimeException("선택한 답안은 1~4 중 하나여야 합니다.");
        }

        if (objectiveSubmissionRepository.existsByStudentIdAndQuestionId(
                request.getStudentId(),
                request.getQuestionId()
        )) {
            Map<String, Object> result = new HashMap<>();
            result.put("message", "이미 제출한 객관식 문제입니다.");
            result.put("duplicated", true);
            return result;
        }

        ObjectiveQuestion question = objectiveQuestionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("객관식 문제를 찾을 수 없습니다."));

        boolean correct = question.getCorrectAnswer() != null
                && question.getCorrectAnswer().equals(request.getSelectedAnswer());

        int earnedPoint = correct
                ? (question.getPoint() != null ? question.getPoint() : 0)
                : 0;

        ObjectiveSubmission submission = new ObjectiveSubmission();
        submission.setCategoryId(question.getCategoryId());
        submission.setQuestionId(question.getId());
        submission.setStudentId(request.getStudentId().trim());
        submission.setStudentName(request.getStudentName().trim());
        submission.setSelectedAnswer(request.getSelectedAnswer());
        submission.setCorrectAnswer(question.getCorrectAnswer());
        submission.setCorrect(correct);
        submission.setEarnedPoint(earnedPoint);
        submission.setSubmitTime(LocalDateTime.now());

        ObjectiveSubmission saved = objectiveSubmissionRepository.save(submission);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "객관식 제출 완료");
        result.put("submission", saved);
        result.put("correct", correct);
        result.put("earnedPoint", earnedPoint);
        result.put("correctAnswer", question.getCorrectAnswer());
        result.put("explanation", question.getExplanation());

        return result;
    }

    @GetMapping
    public List<ObjectiveSubmission> getAllObjectiveSubmissions() {
        return objectiveSubmissionRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<ObjectiveSubmission> getObjectiveSubmissionsByStudent(
            @PathVariable String studentId
    ) {
        return objectiveSubmissionRepository.findByStudentIdOrderBySubmitTimeDesc(studentId);
    }

    @GetMapping("/category/{categoryId}")
    public List<ObjectiveSubmission> getObjectiveSubmissionsByCategory(
            @PathVariable Long categoryId
    ) {
        return objectiveSubmissionRepository.findByCategoryIdOrderBySubmitTimeDesc(categoryId);
    }

    @DeleteMapping("/{id}")
    public String deleteObjectiveSubmission(@PathVariable Long id) {
        objectiveSubmissionRepository.deleteById(id);
        return id + "번 객관식 제출 내역이 삭제되었습니다.";
    }
}