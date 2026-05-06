package com.example.capstone.controller;

import com.example.capstone.repository.ObjectiveSubmissionRepository;
import com.example.capstone.entity.Exam;
import com.example.capstone.entity.ExamCategory;
import com.example.capstone.repository.ExamCategoryRepository;
import com.example.capstone.repository.ExamRepository;
import com.example.capstone.repository.SubmissionRepository;
import com.example.capstone.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.example.capstone.repository.ObjectiveQuestionRepository;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class ExamCategoryController {

    private final ExamCategoryRepository categoryRepository;
    private final ExamRepository examRepository;
    private final SubmissionRepository submissionRepository;
    private final TestCaseRepository testCaseRepository;
    private final ObjectiveQuestionRepository objectiveQuestionRepository;
    private final ObjectiveSubmissionRepository objectiveSubmissionRepository;

    @GetMapping
    public List<ExamCategory> getCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping
    public ExamCategory createCategory(@RequestBody ExamCategory request) {
        ExamCategory category = new ExamCategory();

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("폴더명을 입력하세요.");
        }

        category.setTitle(request.getTitle().trim());
        category.setCreatedAt(LocalDateTime.now());

        return categoryRepository.save(category);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public String deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("삭제하려는 폴더가 존재하지 않습니다.");
        }

        List<Exam> exams = examRepository.findByCategoryId(id);

        for (Exam exam : exams) {
            submissionRepository.deleteByExamId(exam.getId());
            testCaseRepository.deleteByExamId(exam.getId());
        }

        examRepository.deleteByCategoryId(id);
	objectiveSubmissionRepository.deleteByCategoryId(id);
        objectiveQuestionRepository.deleteByCategoryId(id);
        categoryRepository.deleteById(id);

        return id + "번 폴더와 내부 문제/테스트케이스/제출 내역이 모두 삭제되었습니다.";
    }
}