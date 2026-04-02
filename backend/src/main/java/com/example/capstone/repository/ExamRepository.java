package com.example.capstone.repository;

import com.example.capstone.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

// JpaRepository를 상속받으면 저장, 조회, 삭제 기능을 공짜로 얻음
public interface ExamRepository extends JpaRepository<Exam, Long> {
}
