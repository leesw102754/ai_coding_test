package com.example.capstone.repository;

import com.example.capstone.entity.ExamRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRecordRepository extends JpaRepository<ExamRecord, Long> {

    // 1. 특정 학생의 모든 응시 기록을 최신순으로 가져오기
    List<ExamRecord> findByStudentIdOrderByEndTimeDesc(String studentId);

    // 2. 특정 학번의 가장 최근 응시 기록 하나만 가져오기
    Optional<ExamRecord> findFirstByStudentIdOrderByEndTimeDesc(String studentId);

    // 3. 관리자가 볼 때: 모든 학생의 기록을 최신순으로 정렬
    List<ExamRecord> findAllByOrderByEndTimeDesc();
}
