package com.example.capstone.repository;

import com.example.capstone.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStudentIdOrderBySubmitTimeDesc(String studentId);

    boolean existsByStudentIdAndExamId(String studentId, Long examId);

    void deleteByExamId(Long examId);
}