package com.example.capstone.controller;

import java.util.Comparator;
import java.util.Map;
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

private List<ObjectiveQuestion> sortObjectiveQuestions(List<ObjectiveQuestion> questions) {
    return questions.stream()
            .sorted(
                    Comparator
                            .comparing((ObjectiveQuestion question) ->
                                    question.getDisplayOrder() == null
                                            ? Integer.MAX_VALUE
                                            : question.getDisplayOrder()
                            )
                            .thenComparing(question ->
                                    question.getId() == null
                                            ? Long.MAX_VALUE
                                            : question.getId()
                            )
            )
            .toList();
}

private Integer getNextObjectiveDisplayOrder(Long categoryId) {
    List<ObjectiveQuestion> questions = categoryId == null
            ? objectiveQuestionRepository.findAll()
            : objectiveQuestionRepository.findByCategoryId(categoryId);

    return questions.stream()
            .map(ObjectiveQuestion::getDisplayOrder)
            .filter(order -> order != null)
            .max(Integer::compareTo)
            .orElse(0) + 1;
}

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

if (question.getDisplayOrder() == null) {
    question.setDisplayOrder(getNextObjectiveDisplayOrder(question.getCategoryId()));
}

question.setCreatedAt(LocalDateTime.now());

return objectiveQuestionRepository.save(question);
    }

@GetMapping("/questions")
public List<ObjectiveQuestion> getQuestions() {
    return sortObjectiveQuestions(objectiveQuestionRepository.findAll());
}

@GetMapping("/questions/category/{categoryId}")
public List<ObjectiveQuestion> getQuestionsByCategory(@PathVariable Long categoryId) {
    return sortObjectiveQuestions(objectiveQuestionRepository.findByCategoryId(categoryId));
}

    @GetMapping("/questions/{id}")
    public ObjectiveQuestion getQuestion(@PathVariable Long id) {
        return objectiveQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("객관식 문제를 찾을 수 없습니다."));
    }

@PatchMapping("/questions/{id}")
public ObjectiveQuestion updateQuestion(
        @PathVariable Long id,
        @RequestBody ObjectiveQuestion request
) {
    ObjectiveQuestion question = objectiveQuestionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("객관식 문제를 찾을 수 없습니다."));

    if (request.getCategoryId() != null) {
        question.setCategoryId(request.getCategoryId());
    }

    if (request.getTitle() != null) {
        if (request.getTitle().isBlank()) {
            throw new RuntimeException("문제 제목을 입력하세요.");
        }
        question.setTitle(request.getTitle().trim());
    }

    if (request.getDescription() != null) {
        if (request.getDescription().isBlank()) {
            throw new RuntimeException("문제 설명을 입력하세요.");
        }
        question.setDescription(request.getDescription().trim());
    }

    if (request.getChoice1() != null) {
        if (request.getChoice1().isBlank()) {
            throw new RuntimeException("보기 1을 입력하세요.");
        }
        question.setChoice1(request.getChoice1().trim());
    }

    if (request.getChoice2() != null) {
        if (request.getChoice2().isBlank()) {
            throw new RuntimeException("보기 2를 입력하세요.");
        }
        question.setChoice2(request.getChoice2().trim());
    }

    if (request.getChoice3() != null) {
        if (request.getChoice3().isBlank()) {
            throw new RuntimeException("보기 3을 입력하세요.");
        }
        question.setChoice3(request.getChoice3().trim());
    }

    if (request.getChoice4() != null) {
        if (request.getChoice4().isBlank()) {
            throw new RuntimeException("보기 4를 입력하세요.");
        }
        question.setChoice4(request.getChoice4().trim());
    }

    if (request.getCorrectAnswer() != null) {
        if (request.getCorrectAnswer() < 1 || request.getCorrectAnswer() > 4) {
            throw new RuntimeException("정답 번호는 1~4 중 하나여야 합니다.");
        }
        question.setCorrectAnswer(request.getCorrectAnswer());
    }

    if (request.getExplanation() != null) {
        question.setExplanation(request.getExplanation().trim());
    }

    if (request.getDifficulty() != null && !request.getDifficulty().isBlank()) {
        question.setDifficulty(request.getDifficulty().trim());
    }

    if (request.getPoint() != null) {
        if (request.getPoint() <= 0) {
            throw new RuntimeException("점수는 1점 이상이어야 합니다.");
        }
        question.setPoint(request.getPoint());
    }

if (request.getDisplayOrder() != null) {
    question.setDisplayOrder(request.getDisplayOrder());
}

    if (request.getSource() != null && !request.getSource().isBlank()) {
        question.setSource(request.getSource().trim());
    }



    return objectiveQuestionRepository.save(question);
}

@Transactional
@PatchMapping("/questions/reorder/bulk")
public List<ObjectiveQuestion> reorderObjectiveQuestions(
        @RequestBody List<ObjectiveQuestion> requests
) {
    for (ObjectiveQuestion request : requests) {
        if (request.getId() == null || request.getDisplayOrder() == null) {
            continue;
        }

        ObjectiveQuestion question = objectiveQuestionRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("객관식 문제를 찾을 수 없습니다."));

        question.setDisplayOrder(request.getDisplayOrder());
        objectiveQuestionRepository.save(question);
    }

    return sortObjectiveQuestions(objectiveQuestionRepository.findAll());
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