package com.example.capstone.repository;

import com.example.capstone.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCategoryId(Long categoryId);
    void deleteByCategoryId(Long categoryId);
}