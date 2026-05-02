package com.example.capstone.repository;

import com.example.capstone.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByExamId(Long examId);
    void deleteByExamId(Long examId);
}