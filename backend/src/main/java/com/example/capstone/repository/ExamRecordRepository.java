package com.example.capstone.repository;

import com.example.capstone.entity.ExamRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRecordRepository extends JpaRepository<ExamRecord, Long> {

    List<ExamRecord> findByStudentIdOrderByEndTimeDesc(String studentId);

    Optional<ExamRecord> findFirstByStudentIdOrderByEndTimeDesc(String studentId);

    List<ExamRecord> findAllByOrderByEndTimeDesc();
}