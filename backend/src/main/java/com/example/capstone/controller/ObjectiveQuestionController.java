package com.example.capstone.controller;

import com.example.capstone.repository.ObjectiveSubmissionRepository;
import com.example.capstone.dto.AiObjectiveQuestionRequest;
import com.example.capstone.dto.AiObjectiveQuestionResponse;
import com.example.capstone.entity.ObjectiveQuestion;
import com.example.capstone.repository.ObjectiveQuestionRepository;
import com.example.capstone.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/objective")
@RequiredArgsConstructor
public class ObjectiveQuestionController {

    private final ObjectiveSubmissionRepository objectiveSubmissionRepository;
    private final ObjectiveQuestionRepository objectiveQuestionRepository;
    private final AiService aiService;

    @PostMapping("/questions")
    public ObjectiveQuestion createQuestion(@RequestBody ObjectiveQuestion question) {
        if (question.getCategoryId() == null) {
            throw new RuntimeException("시험 폴더를 선택하세요.");
        }

        if (question.getTitle() == null || question.getTitle().isBlank()) {
            throw new RuntimeException("문제 제목을 입력하세요.");
        }

        if (question.getDescription() == null || question.getDescription().isBlank()) {
            throw new RuntimeException("문제 설명을 입력하세요.");
        }

        if (question.getChoice1() == null || question.getChoice1().isBlank()
                || question.getChoice2() == null || question.getChoice2().isBlank()
                || question.getChoice3() == null || question.getChoice3().isBlank()
                || question.getChoice4() == null || question.getChoice4().isBlank()) {
            throw new RuntimeException("보기 4개를 모두 입력하세요.");
        }

        if (question.getCorrectAnswer() == null
                || question.getCorrectAnswer() < 1
                || question.getCorrectAnswer() > 4) {
            throw new RuntimeException("정답 번호는 1~4 중 하나여야 합니다.");
        }

        if (question.getPoint() == null || question.getPoint() <= 0) {
            question.setPoint(10);
        }

        if (question.getDifficulty() == null || question.getDifficulty().isBlank()) {
            question.setDifficulty("easy");
        }

        if (question.getSource() == null || question.getSource().isBlank()) {
            question.setSource("manual");
        }

        question.setTitle(question.getTitle().trim());
        question.setDescription(question.getDescription().trim());
        question.setChoice1(question.getChoice1().trim());
        question.setChoice2(question.getChoice2().trim());
        question.setChoice3(question.getChoice3().trim());
        question.setChoice4(question.getChoice4().trim());

        if (question.getExplanation() != null) {
            question.setExplanation(question.getExplanation().trim());
        }

        question.setCreatedAt(LocalDateTime.now());

        return objectiveQuestionRepository.save(question);
    }

    @GetMapping("/questions")
    public List<ObjectiveQuestion> getQuestions() {
        return objectiveQuestionRepository.findAll();
    }

    @GetMapping("/questions/category/{categoryId}")
    public List<ObjectiveQuestion> getQuestionsByCategory(@PathVariable Long categoryId) {
        return objectiveQuestionRepository.findByCategoryId(categoryId);
    }

    @GetMapping("/questions/{id}")
    public ObjectiveQuestion getQuestion(@PathVariable Long id) {
        return objectiveQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("객관식 문제를 찾을 수 없습니다."));
    }

@Transactional
@DeleteMapping("/questions/{id}")
public String deleteQuestion(@PathVariable Long id) {
    objectiveSubmissionRepository.deleteByQuestionId(id);
    objectiveQuestionRepository.deleteById(id);
    return id + "번 객관식 문제와 관련 제출 내역이 삭제되었습니다.";
}

    @PostMapping("/ai-generate")
    public AiObjectiveQuestionResponse generateObjectiveQuestion(
            @RequestBody AiObjectiveQuestionRequest request
    ) {
        AiObjectiveQuestionResponse response = aiService.generateObjectiveQuestion(request);
        response.setSource("ai");
        return response;
    }
}