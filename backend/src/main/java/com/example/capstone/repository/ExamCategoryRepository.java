package com.example.capstone.repository;

import com.example.capstone.entity.ExamCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamCategoryRepository extends JpaRepository<ExamCategory, Long> {
}