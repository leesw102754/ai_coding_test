package com.example.capstone.repository;

import com.example.capstone.entity.ObjectiveQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ObjectiveQuestionRepository extends JpaRepository<ObjectiveQuestion, Long> {
    List<ObjectiveQuestion> findByCategoryId(Long categoryId);
    void deleteByCategoryId(Long categoryId);
}