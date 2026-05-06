package com.example.capstone.repository;

import com.example.capstone.entity.ObjectiveSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ObjectiveSubmissionRepository extends JpaRepository<ObjectiveSubmission, Long> {

    boolean existsByStudentIdAndQuestionId(String studentId, Long questionId);

    List<ObjectiveSubmission> findByStudentIdOrderBySubmitTimeDesc(String studentId);

    List<ObjectiveSubmission> findByCategoryIdOrderBySubmitTimeDesc(Long categoryId);

    void deleteByQuestionId(Long questionId);

    void deleteByCategoryId(Long categoryId);
}